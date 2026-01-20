

import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { generateLicenseKey } from "@/lib/license"
import { createHmac } from "crypto"

export async function POST(req: Request) {
    const body = await req.text()
    const signature = (await headers()).get("x-cc-webhook-signature")

    const coinbaseMethod = await db.paymentMethod.findUnique({ where: { name: "coinbase" } })
    const config = coinbaseMethod?.config ? JSON.parse(coinbaseMethod.config) : {}
    const webhookSecret = config.webhookSecret || process.env.COINBASE_WEBHOOK_SECRET

    if (!webhookSecret) {
        return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
    }

    if (!signature) {
        return NextResponse.json({ error: "No signature provided" }, { status: 400 })
    }

    // Verify Signature
    try {
        const hmac = createHmac("sha256", webhookSecret)
        const computedSignature = hmac.update(body).digest("hex")

        if (computedSignature !== signature) {
            console.error("Coinbase Webhook Signature Mismatch")
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
        }
    } catch (error) {
        console.error("Signature verification error:", error)
        return NextResponse.json({ error: "Verification failed" }, { status: 500 })
    }

    const { event } = JSON.parse(body)

    console.log(`Coinbase Webhook: ${event.type}`, event.id)

    switch (event.type) {
        case "charge:created":
            console.log("Charge created", event.data)
            break
        case "charge:pending":
            console.log("Charge pending", event.data)
            break
        case "charge:failed":
            console.log("Charge failed", event.data)
            break
        case "charge:confirmed":
        case "charge:resolved":
            console.log("Charge confirmed/resolved", event.data)
            await handleChargeConfirmed(event.data)
            break
        default:
            console.log("Unhandled event", event.type)
    }

    return NextResponse.json({ received: true })
}

async function handleChargeConfirmed(charge: any) {
    const metadata = charge.metadata || {}
    const userId = metadata.userId
    const productIdsStr = metadata.productIds
    const couponId = metadata.couponId

    if (!productIdsStr) {
        console.error("Coinbase Webhook: Missing productIds in metadata")
        return
    }

    const productIds = JSON.parse(productIdsStr)

    try {
        // Check if order already exists (to prevent duplicates)
        // We use the Coinbase charge code or ID as the unique identifier
        const existingOrder = await db.order.findUnique({
            where: { stripeSessionId: charge.code } // Reusing stripeSessionId field for external ID
        })

        if (existingOrder) {
            console.log("Order already processed:", existingOrder.id)
            return
        }

        const items = await db.product.findMany({
            where: { id: { in: productIds } }
        })

        const totalAmount = charge.pricing.local.amount * 100 // Convert back to cents

        const order = await db.order.create({
            data: {
                userId: userId,
                stripeSessionId: charge.code, // Store Coinbase Charge Code
                amount: totalAmount,
                currency: "usd",
                status: "completed",
                paymentMethod: "coinbase",
                couponCode: couponId ? (await db.coupon.findUnique({ where: { id: couponId } }))?.code : undefined,
                items: {
                    create: items.map((item) => ({
                        productId: item.id,
                        price: item.price // Note: This might differ from actual paid amount if there was a discount
                    }))
                }
            }
        })

        // Generate License Keys & Decrement Stock
        for (const item of items) {
            const expiresAt = item.duration ? new Date(Date.now() + item.duration * 24 * 60 * 60 * 1000) : null
            await db.licenseKey.create({
                data: {
                    key: generateLicenseKey(),
                    productId: item.id,
                    userId: userId,
                    orderId: order.id,
                    status: "ACTIVE",
                    expiresAt: expiresAt
                }
            })

            // Decrement Stock
            await db.product.update({
                where: { id: item.id },
                data: { stock: { decrement: 1 } }
            }).catch(err => console.error(`Failed to decrement stock for product ${item.id}:`, err))
        }

        // Increment Coupon Usage
        if (couponId) {
            await db.coupon.update({
                where: { id: couponId },
                data: { uses: { increment: 1 } }
            }).catch(err => console.error("Failed to increment coupon usage:", err))
        }

        console.log("Coinbase Order created successfully:", order.id)

    } catch (error) {
        console.error("Error processing Coinbase webhook:", error)
        throw error // Propagate error but endpoint will still return 200 to Coinbase to stop retries if it's a codelogic error? No, better to fail if DB error.
    }
}
