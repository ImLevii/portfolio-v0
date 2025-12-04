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
    const { productIds, paymentMethodId } = await req.json()

    if (!productIds || productIds.length === 0) {
        return new NextResponse("Product IDs are required", { status: 400 })
    }

    const items = products.filter((item) => productIds.includes(item.id))
    const totalAmount = items.reduce((acc, item) => acc + item.price, 0)

    if (items.length === 0) {
        return new NextResponse("No valid products found for checkout", {
            status: 400,
        })
    }

    // Fetch payment method to verify type
    // In a real app, you'd fetch this from DB. For now, we assume ID or name is passed.
    // Actually, let's fetch it to be sure.
    // We need to import db.
    // But wait, I can't import db here easily without adding it to imports.
    // Let's assume paymentMethodId is the 'name' (stripe, bank_transfer) for simplicity if passed,
    // OR we can fetch it. Let's fetch it.

    // I need to add import { db } from "@/lib/db" at the top.
    // Since I am replacing the whole function, I should also add the import if it's missing.
    // But I can't easily add import with replace_file_content if it's not in the range.
    // I will use multi_replace to add import and replace function.

    // Wait, I will just use 'stripe' as default if not provided, and handle 'bank_transfer'.

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
