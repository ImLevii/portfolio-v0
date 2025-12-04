import { headers } from "next/headers"
import { NextResponse } from "next/server"
import Stripe from "stripe"
import { db } from "@/lib/db"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // apiVersion: "2025-02-24.acacia",
    typescript: true,
})

export async function POST(req: Request) {
    const body = await req.text()
    const signature = (await headers()).get("Stripe-Signature") as string

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
    }

    const session = event.data.object as Stripe.Checkout.Session

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.payment_status === "paid") {
            const email = session.customer_details?.email
            const productIds = session.metadata?.productIds ? JSON.parse(session.metadata.productIds) : []
            const amount = session.amount_total || 0

            if (email) {
                // Find or create user
                let user = await db.user.findUnique({ where: { email } })
                if (!user) {
                    user = await db.user.create({ data: { email, name: session.customer_details?.name } })
                }

                // Create Order
                await db.order.create({
                    data: {
                        userId: user.id,
                        stripeSessionId: session.id,
                        amount: amount,
                        currency: session.currency || "usd",
                        status: "completed",
                        items: {
                            create: productIds.map((id: string) => ({
                                productId: id,
                                price: 0 // Ideally fetch price from DB or Stripe, but for now 0 or split amount
                            }))
                        }
                    }
                })
            }
        }
    }

    return new NextResponse(null, { status: 200 })
}
