
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

            // Basic validation (more robust validation should be done potentially)
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
            const apiKey = process.env.COINBASE_API_KEY || process.env.NEXT_COINBASE_API_KEY
            if (!apiKey) {
                return NextResponse.json({ error: "Coinbase API key not configured" }, { status: 500 })
            }

            const amountInDollars = (totalAmount / 100).toFixed(2)

            // Create Coinbase Charge
            const chargeData = {
                name: "Portfolio Purchase",
                description: `Order for ${products.map(p => p.name).join(", ")}`,
                local_price: {
                    amount: amountInDollars,
                    currency: "USD"
                },
                pricing_type: "fixed_price",
                metadata: {
                    userId: session.user.id,
                    productIds: JSON.stringify(productIds),
                    couponId: couponId
                },
                redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/shop/success`,
                cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/shop`
            }

            const response = await fetch("https://api.commerce.coinbase.com/charges", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CC-Api-Key": apiKey,
                    "X-CC-Version": "2018-03-22"
                },
                body: JSON.stringify(chargeData)
            })

            if (!response.ok) {
                const errorData = await response.json()
                console.error("Coinbase Charge creation failed:", errorData)
                return NextResponse.json({ error: "Failed to create Coinbase charge" }, { status: 500 })
            }

            const charge = await response.json()
            return NextResponse.json({ url: charge.data.hosted_url })

        } else if (paymentMethodId === "paypal") {
            // PayPal flow usually involves client-side buttons or order creation api
            // For now, if we don't have a server-side creation specific to 'standard' flow,
            // we might handle it differently.
            // But if the client expects a URL, we might need to change how paypal is handled.
            // Assuming current 'CartPopover' implementation for PayPal uses client-side buttons?
            // Checking CartPopover again... it seems to separate PayPal logic.
            // The `RadioGroup` selects `paypal`, but...
            // Wait, CartPopover checks `isPayPalSelected`.
            // If `isPayPalSelected` is true, it renders the PayPal button (image) which calls `onCheckout`??
            // Re-reading CartPopover...
            // line 352: button onClick={onCheckout} ...
            // So default layout calls onCheckout for PayPal too?
            // Wait, previous `route.ts` I saw for `api/payment` was for CAPTURE.
            // The `api/checkout` is expected to return a URL.
            // If the user wants PayPal flow here, we'd create an order and return approve link.

            // Stub for now or implement if easy.
            return NextResponse.json({ error: "PayPal checkout via this route not fully implemented yet" }, { status: 501 })
        }

        return NextResponse.json({ error: "Invalid payment method" }, { status: 400 })

    } catch (error) {
        console.error("Checkout error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
