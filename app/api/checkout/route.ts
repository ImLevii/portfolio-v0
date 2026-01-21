import { auth } from "@/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { randomBytes } from "crypto"
import jwt from "jsonwebtoken"

// Helper to format private key for CDP (supporting raw base64 and PEM)
function formatPrivateKey(raw: string) {
    if (!raw) return "";
    if (raw.includes('-----BEGIN')) return raw.replace(/\\n/g, '\n');

    try {
        const buffer = Buffer.from(raw, 'base64');
        const privKey = buffer.length >= 64 ? buffer.slice(0, 32) : buffer;
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

    if (!keyName || !rawKey) return { error: "Missing CDP keys" };

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
                'Accept': 'application/json'
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
        return { status: response.status, data };
    } catch (error: any) {
        return { error: error.message || "CDP request failed" };
    }
}

async function createLegacyCharge(apiKey: string, amount: number, description: string, metadata: any) {
    try {
        const response = await fetch("https://api.commerce.coinbase.com/charges", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CC-Api-Key": apiKey,
                "X-CC-Version": "2018-03-22",
                "Accept": "application/json"
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
        return { status: response.status, data };
    } catch (error: any) {
        return { error: error.message || "Legacy request failed" };
    }
}

export async function GET() {
    try {
        const coinbaseMethod = await db.paymentMethod.findUnique({ where: { name: "coinbase" } })
        const config = coinbaseMethod?.config ? JSON.parse(coinbaseMethod.config) : {}
        const apiKey = config.apiKey || process.env.COINBASE_API_KEY

        const metadata = { test: "true" }
        const description = "Diagnostic Check"
        const amount = 100

        const cdp = await createCDPCharge(amount, description, metadata);
        let legacy = null;
        if (apiKey) legacy = await createLegacyCharge(apiKey, amount, description, metadata);

        return NextResponse.json({ diagnostics: { cdp, legacy } });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
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

        const products = await db.product.findMany({
            where: { id: { in: productIds } }
        })

        if (products.length === 0) {
            return NextResponse.json({ error: "Products not found" }, { status: 404 })
        }

        // Calculate total respecting salePrice
        let totalAmount = products.reduce((acc, curr) => {
            const price = curr.isSale && curr.salePrice ? curr.salePrice : curr.price;
            return acc + price;
        }, 0)

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

            // 1. Try CDP
            let result: any = await createCDPCharge(totalAmount, description, metadata);

            // 2. Fallback to Legacy if CDP didn't return a hosted_url
            if (!result?.data?.data?.hosted_url && apiKey) {
                console.log("CDP failed, falling back to Legacy API...");
                result = await createLegacyCharge(apiKey, totalAmount, description, metadata);
            }

            if (result?.data?.data?.hosted_url) {
                return NextResponse.json({ url: result.data.data.hosted_url })
            } else {
                const error = result?.data?.error || result?.error || { message: "Payment provider error" };
                console.error("Coinbase failure:", error);
                return NextResponse.json({ error: error.message, details: error }, { status: 400 })
            }
        }

        return NextResponse.json({ error: "Invalid payment method" }, { status: 400 })

    } catch (error: any) {
        console.error("Checkout Error:", error)
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}
