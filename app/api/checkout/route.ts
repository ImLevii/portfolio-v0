import { NextResponse } from "next/server"
import Stripe from "stripe"

import { products } from "@/lib/products"

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
    const { productIds } = await req.json()

    if (!productIds || productIds.length === 0) {
        return new NextResponse("Product IDs are required", { status: 400 })
    }

    const items = products.filter((item) => productIds.includes(item.id))

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

    const session = await stripe.checkout.sessions.create({
        line_items,
        mode: 'payment',
        billing_address_collection: 'required',
        phone_number_collection: {
            enabled: true,
        },
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/shop?canceled=1`,
        metadata: {
            productIds: JSON.stringify(productIds),
        },
    })

    return NextResponse.json({ url: session.url }, {
        headers: corsHeaders
    })
}
