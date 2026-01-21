
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

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

        // 1. Calculate Total from DB (Security)
        const products = await db.product.findMany({
            where: { id: { in: productIds } }
        })

        let totalAmount = 0
        products.forEach(p => {
            totalAmount += p.price
        })

        // 2. Apply Coupon
        let couponId = undefined
        if (couponCode) {
            const coupon = await db.coupon.findUnique({
                where: { code: couponCode, isActive: true }
            })

            if (coupon) {
                if (coupon.percent) {
                    totalAmount = totalAmount - Math.round((totalAmount * coupon.percent) / 100)
                } else if (coupon.amount) {
                    totalAmount = Math.max(0, totalAmount - coupon.amount)
                }
                couponId = coupon.id
            }
        }

        // 3. Handle Payment Methods
        if (paymentMethodId === "coinbase") {
            const checkoutId = process.env.NEXT_PUBLIC_COINBASE_CHECKOUT_ID
            if (!checkoutId) {
                return NextResponse.json({ error: "Coinbase Checkout ID not configured in environment" }, { status: 500 })
            }

            // Construct Metadata for the URL to track the order
            // Note: Coinbase Checkouts support URL parameters to pre-fill or pass metadata.
            // Format: ?metadata[key]=value
            const metadataQuery = new URLSearchParams()
            metadataQuery.append("metadata[userId]", session.user.id)
            metadataQuery.append("metadata[productIds]", JSON.stringify(productIds))
            if (couponId) {
                metadataQuery.append("metadata[couponId]", couponId)
            } else {
                metadataQuery.append("metadata[couponId]", "null")
            }

            // Note: We cannot easily enforce the exact amount via URL on a static checkout unless
            // the checkout itself is "variable price" or we use a specific override if supported.
            // For now, we rely on the Checkout being configured correctly on Coinbase side.

            const checkoutUrl = `https://commerce.coinbase.com/checkout/${checkoutId}?${metadataQuery.toString()}`

            return NextResponse.json({ url: checkoutUrl })

        } else if (paymentMethodId === "paypal") {
            return NextResponse.json({ error: "PayPal checkout via this route not fully implemented yet" }, { status: 501 })
        }

        return NextResponse.json({ error: "Invalid payment method" }, { status: 400 })

    } catch (error) {
        console.error("Checkout error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
