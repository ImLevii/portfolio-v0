import { NextResponse } from "next/server"
import Stripe from "stripe"

import { db } from "@/lib/db"
import { createPayPalOrder } from "@/lib/paypal"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // apiVersion: "2025-02-24.acacia", // Use latest or what's available
    typescript: true,
})

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(req: Request) {
    const { productIds, paymentMethodId } = await req.json()

    console.log("Checkout request:", { productIds, paymentMethodId })

    if (!productIds || productIds.length === 0) {
        console.log("Checkout error: Product IDs are required")
        return new NextResponse("Product IDs are required", { status: 400 })
    }

    const items = await db.product.findMany({
        where: {
            id: {
                in: productIds
            }
        }
    })

    const totalAmount = items.reduce((acc, item) => acc + item.price, 0)

    if (items.length === 0) {
        console.log("Checkout error: No valid products found", { productIds })
        return new NextResponse("No valid products found for checkout", {
            status: 400,
        })
    }

    if (paymentMethodId === "paypal") {
        try {
            const formattedTotal = (totalAmount / 100).toFixed(2)
            const order = await createPayPalOrder(formattedTotal)

            const approveLink = order.links.find((link: any) => link.rel === "approve")

            if (!approveLink) {
                throw new Error("No approval link found in PayPal response")
            }

            return NextResponse.json(
                { url: approveLink.href },
                { headers: corsHeaders }
            )
        } catch (error: any) {
            console.error("PayPal checkout error:", error)
            return NextResponse.json(
                { error: error.message || "PayPal checkout failed" },
                { status: 500, headers: corsHeaders }
            )
        }
    }

    // Default to Stripe
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = []

    items.forEach((item) => {
        line_items.push({
            quantity: 1,
            price_data: {
                currency: 'USD',
                product_data: {
                    name: item.name,
                },
                unit_amount: item.price,
            },
        })
    })

    try {
        const session = await stripe.checkout.sessions.create({
            line_items,
            mode: "payment",
            billing_address_collection: "required",
            phone_number_collection: {
                enabled: true,
            },
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/shop?canceled=1`,
            metadata: {
                productIds: JSON.stringify(productIds),
            },
        })

        return NextResponse.json(
            { url: session.url },
            {
                headers: corsHeaders,
            }
        )
    } catch (error: any) {
        console.error("Stripe checkout error:", error)

        const message =
            error?.message ||
            "Unable to create checkout session. Please try again."

        const status = error?.statusCode && Number.isInteger(error.statusCode)
            ? error.statusCode
            : 500

        return NextResponse.json(
            { error: message },
            {
                status,
                headers: corsHeaders,
            }
        )
    }
}
