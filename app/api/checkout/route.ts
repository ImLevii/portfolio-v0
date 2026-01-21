import { auth } from "@/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { randomBytes } from "crypto"
import jwt from "jsonwebtoken"

// Helper to format private key for CDP (supporting raw base64 and PEM)
function formatPrivateKey(raw: string) {
    if (!raw) return "";
    if (raw.includes('-----BEGIN')) return raw.replace(/\\n/g, '\n');

    // If it's a 64-byte key (seed + pub), we take the first 32 bytes (seed)
    // and wrap it in a PKCS#8 DER for P-256 (ES256)
    try {
        const buffer = Buffer.from(raw, 'base64');
        const privKey = buffer.length >= 32 ? buffer.slice(0, 32) : buffer;
        const pkcs8Der = Buffer.concat([
            Buffer.from('3041020100301306072a8648ce3d020106082a8648ce3d030107042730250201010420', 'hex'),
            privKey
        ]);
        return `-----BEGIN PRIVATE KEY-----\n${pkcs8Der.toString('base64')}\n-----END PRIVATE KEY-----`;
    } catch (e) {
        return "";
    }
}

async function createCDPCharge(amount: number, description: string, metadata: any) {
    const keyName = process.env.COINBASE_CDP_API_KEY_NAME;
    const rawKey = process.env.COINBASE_CDP_PRIVATE_KEY;

    if (!keyName || !rawKey) return null;

    const pemKey = formatPrivateKey(rawKey);
    const method = 'POST';
    const path = '/charges';
    const host = 'api.commerce.coinbase.com';

    try {
        const token = jwt.sign(
            {
                iss: 'coinbase',
                nbf: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 120,
                sub: keyName,
                uri: `${method} ${host}${path}`
            },
            pemKey,
            {
                algorithm: 'ES256',
                header: {
                    kid: keyName,
                    nonce: randomBytes(16).toString('hex')
                }
            }
        );

        const response = await fetch(`https://${host}${path}`, {
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-CC-Version': '2018-03-22'
            },
            body: JSON.stringify({
                name: "Product Purchase",
                description: description.substring(0, 200),
                pricing_type: "fixed_price",
                local_price: {
                    amount: (amount / 100).toFixed(2),
                    currency: "USD"
                },
                metadata
            })
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("CDP Charge Error:", error);
        return { error: { message: "CDP creation failed" } };
    }
}

async function createLegacyCharge(apiKey: string, amount: number, description: string, metadata: any) {
    try {
        const response = await fetch("https://api.commerce.coinbase.com/charges", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CC-Api-Key": apiKey,
                "X-CC-Version": "2018-03-22"
            },
            body: JSON.stringify({
                name: "Product Purchase",
                description: description.substring(0, 200),
                pricing_type: "fixed_price",
                local_price: {
                    amount: (amount / 100).toFixed(2),
                    currency: "USD"
                },
                metadata
            })
        });

        return await response.json();
    } catch (error) {
        return { error: { message: "Legacy creation failed" } };
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { productIds, paymentMethodId, couponCode } = body

        if (!productIds || !productIds.length) {
            return NextResponse.json({ error: "No products selected" }, { status: 400 })
        }

        // 1. Calculate Total in cents
        const products = await db.product.findMany({
            where: { id: { in: productIds } }
        })

        if (products.length === 0) {
            return NextResponse.json({ error: "Products not found" }, { status: 404 })
        }

        let totalAmount = products.reduce((acc, curr) => acc + curr.price, 0)
        let appliedCouponId = null

        // 2. Apply Coupon
        if (couponCode) {
            const coupon = await db.coupon.findFirst({
                where: { code: couponCode, isEnabled: true }
            })

            if (coupon) {
                if (coupon.type === "PERCENTAGE") {
                    totalAmount = Math.round(totalAmount * (1 - coupon.value / 100))
                } else {
                    totalAmount = Math.max(0, totalAmount - coupon.value)
                }
                appliedCouponId = coupon.id
            }
        }

        // 3. Handle Coinbase (Check by ID or Name)
        const coinbaseMethod = await db.paymentMethod.findUnique({ where: { name: "coinbase" } })

        // We accept either the exact ID from client or if the method name is "coinbase"
        if (paymentMethodId === coinbaseMethod?.id || paymentMethodId === "coinbase") {
            const config = coinbaseMethod?.config ? JSON.parse(coinbaseMethod.config) : {}
            const apiKey = config.apiKey || process.env.COINBASE_API_KEY

            const metadata = {
                userId: session.user.id,
                productIds: JSON.stringify(productIds),
                couponId: appliedCouponId || "none"
            }

            const description = products.map(p => p.name).join(", ")

            // Strategy A: Try CDP API (Required for newer Onchain merchants)
            let chargeData = await createCDPCharge(totalAmount, description, metadata);

            // Strategy B: Try Legacy API (Fallback)
            if (!chargeData || chargeData.error) {
                console.log("CDP Charge creation failed or skipped, trying Legacy API...");
                if (apiKey) {
                    const legacyData = await createLegacyCharge(apiKey, totalAmount, description, metadata);
                    // If legacy also fails with deprecation but CDP was tried, we stick with legacy error or combine them
                    if (legacyData?.data?.hosted_url) {
                        chargeData = legacyData;
                    } else if (legacyData?.error) {
                        chargeData = legacyData; // Keep legacy error if it's more descriptive
                    }
                }
            }

            if (chargeData?.data?.hosted_url) {
                return NextResponse.json({ url: chargeData.data.hosted_url })
            } else {
                console.error("Coinbase All Strategies Failed:", chargeData)
                const errorMsg = chargeData?.error?.message || "Payment provider error. If using Onchain Commerce, ensure CDP keys are correct."
                return NextResponse.json({ error: errorMsg }, { status: 400 })
            }
        }

        return NextResponse.json({ error: "Invalid payment method" }, { status: 400 })

    } catch (error) {
        console.error("Checkout error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
