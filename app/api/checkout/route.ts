import { auth } from "@/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { randomBytes } from "crypto"
import jwt from "jsonwebtoken"

// Helper to format private key for CDP (supporting raw base64 and PEM)
function formatPrivateKey(raw: string) {
    if (!raw) return "";
    try {
        // Strip quotes if any
        let clean = raw.trim();
        if (clean.startsWith('"') && clean.endsWith('"')) {
            clean = clean.substring(1, clean.length - 1);
        }

        if (clean.includes('-----BEGIN')) {
            return clean.replace(/\\n/g, '\n');
        }

        const buffer = Buffer.from(clean, 'base64');
        const privKey = buffer.length >= 32 ? buffer.slice(0, 32) : buffer;
        const pkcs8Der = Buffer.concat([
            Buffer.from('3041020100301306072a8648ce3d020106082a8648ce3d030107042730250201010420', 'hex'),
            privKey
        ]);
        return `-----BEGIN PRIVATE KEY-----\n${pkcs8Der.toString('base64')}\n-----END PRIVATE KEY-----`;
    } catch (e) {
        console.error("Key format error:", e);
        return "";
    }
}

async function createCDPCharge(amount: number, description: string, metadata: any) {
    const keyName = process.env.COINBASE_CDP_API_KEY_NAME;
    const rawKey = process.env.COINBASE_CDP_PRIVATE_KEY;

    if (!keyName || !rawKey) {
        console.log("CDP Keys missing from env");
        return null;
    }

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
                name: "Order Payment",
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
        console.log("CDP API Response Status:", response.status, data);
        return { status: response.status, data };
    } catch (error) {
        console.error("CDP Charge Fatal Error:", error);
        return { error: { message: "CDP connection failed" } };
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
                name: "Order Payment",
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
        console.log("Legacy API Response Status:", response.status, data);
        return { status: response.status, data };
    } catch (error) {
        console.error("Legacy Charge Fatal Error:", error);
        return { error: { message: "Legacy connection failed" } };
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

        console.log("Checkout initiated:", { productIds, paymentMethodId, couponCode, userId: session.user.id });

        if (!productIds || !productIds.length) {
            return NextResponse.json({ error: "No products selected" }, { status: 400 })
        }

        const products = await db.product.findMany({
            where: { id: { in: productIds } }
        })

        if (products.length === 0) {
            return NextResponse.json({ error: "Products not found" }, { status: 404 })
        }

        let totalAmount = products.reduce((acc, curr) => acc + curr.price, 0)
        let appliedCouponId = null

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

        const coinbaseMethod = await db.paymentMethod.findUnique({ where: { name: "coinbase" } })

        if (paymentMethodId === coinbaseMethod?.id || paymentMethodId === "coinbase") {
            const config = coinbaseMethod?.config ? JSON.parse(coinbaseMethod.config) : {}
            const apiKey = config.apiKey || process.env.COINBASE_API_KEY

            const metadata = {
                userId: session.user.id,
                productIds: JSON.stringify(productIds),
                couponId: appliedCouponId || "none"
            }

            const description = products.map(p => p.name).join(", ")

            // Strategy A: Try CDP API
            let chargeResult = await createCDPCharge(totalAmount, description, metadata);

            // Strategy B: Try Legacy API fallback
            // We fallback if CDP is explicitly missing, returns an error, OR is unauthorized (401)
            // since some endpoints/keys don't support CDP yet.
            const shouldFallback = !chargeResult ||
                chargeResult.error ||
                (chargeResult.status >= 400);

            if (shouldFallback) {
                console.log(`CDP Strategy failed (Status: ${chargeResult?.status}). Trying Legacy API fallback...`);
                if (apiKey) {
                    chargeResult = await createLegacyCharge(apiKey, totalAmount, description, metadata);
                }
            }

            if (chargeResult?.data?.data?.hosted_url) {
                return NextResponse.json({ url: chargeResult.data.data.hosted_url })
            } else {
                const errorObj = chargeResult?.data?.error || chargeResult?.error || { message: "Unknown error" };
                console.error("Coinbase Checkout Final Failure:", errorObj);
                return NextResponse.json({
                    error: errorObj.message || "Payment provider error",
                    details: errorObj
                }, { status: 400 })
            }
        }

        return NextResponse.json({ error: "Invalid payment method" }, { status: 400 })

    } catch (error: any) {
        console.error("Global Checkout Route Error:", error)
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}
