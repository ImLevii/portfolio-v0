import { NextResponse } from "next/server"
import Stripe from "stripe"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { createPayPalOrder } from "@/lib/paypal"
import { generateLicenseKey } from "@/lib/license"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY! || process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!, {
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
    const session = await auth()
    const reqBody = await req.json()
    const { productIds, paymentMethodId } = reqBody

    // Determine Base URL dynamically
    const origin = req.headers.get("origin")
    const host = req.headers.get("host")
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https"

    // Prioritize NEXT_PUBLIC_APP_URL for production stability, fall back to request origin for previews/dev
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || origin || `${protocol}://${host}` || "http://localhost:3000"

    console.log("Checkout init:", {
        productIds,
        paymentMethodId,
        resolvedBaseUrl: baseUrl,
        envAppUrl: process.env.NEXT_PUBLIC_APP_URL,
        origin
    })

    if (!productIds || productIds.length === 0) {
        console.log("Checkout error: Product IDs are required")
        return NextResponse.json({ error: "Product IDs are required" }, { status: 400 })
    }

    const items = await db.product.findMany({
        where: {
            id: {
                in: productIds
            }
        }
    })

    // Validate Coupon if provided
    let discountPercent = 0
    let couponId = undefined

    if (reqBody.couponCode) {
        const coupon = await db.coupon.findUnique({
            where: { code: reqBody.couponCode }
        })

        if (coupon && coupon.isActive) {
            if ((!coupon.expiresAt || coupon.expiresAt > new Date()) &&
                (!coupon.maxUses || coupon.uses < coupon.maxUses)) {
                discountPercent = coupon.percent || 0
                couponId = coupon.id
            }
        }
    }

    const totalAmount = items.reduce((acc, item) => {
        let price = item.price
        if (discountPercent > 0) {
            price = Math.round(item.price * (1 - discountPercent / 100))
        }
        return acc + price
    }, 0)

    console.log("Checkout Check:", {
        foundItems: items.length,
        totalAmount,
        productIds,
        couponCode: reqBody.couponCode,
        discountPercent
    })

    if (items.length === 0) {
        console.log("Checkout error: No valid products found", { productIds })
        return NextResponse.json({
            error: "No valid products found for checkout",
            details: "The products you are trying to purchase do not exist or are invalid."
        }, { status: 400 })
    }

    // Handle Free Orders
    if (totalAmount === 0) {
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Authentication required for free orders" }, { status: 401 })
        }

        try {
            // Create Order
            const order = await db.order.create({
                data: {
                    userId: session.user.id as string,
                    stripeSessionId: `free_${Date.now()}_${Math.random().toString(36).substring(7)}`, // Mock ID for constraints
                    amount: 0,
                    currency: "usd",
                    status: "completed",
                    paymentMethod: "free",
                    couponCode: couponId ? (await db.coupon.findUnique({ where: { id: couponId } }))?.code : undefined,
                    items: {
                        create: items.map((item) => ({
                            productId: item.id,
                            price: 0
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
                        userId: session.user.id as string,
                        orderId: order.id,
                        status: "ACTIVE",
                        expiresAt: expiresAt
                    }
                })

                // Decrement Stock
                await db.product.update({
                    where: { id: item.id },
                    data: {
                        stock: {
                            decrement: 1
                        }
                    }
                }).catch(err => console.error(`Failed to decrement stock for product ${item.id}:`, err))
            }

            // Increment Coupon Usage
            if (couponId) {
                await db.coupon.update({
                    where: { id: couponId },
                    data: {
                        uses: { increment: 1 }
                    }
                }).catch(err => console.error("Failed to increment coupon usage:", err))
            }

            return NextResponse.json(
                { url: `${baseUrl}/shop/success?free=true` },
                { headers: corsHeaders }
            )

        } catch (error) {
            console.error("Free order creation error:", error)
            return NextResponse.json(
                { error: "Failed to process free order" },
                { status: 500, headers: corsHeaders }
            )
        }
    }

    // Prevent small charges that Stripe rejects
    if (totalAmount > 0 && totalAmount < 50) {
        const formattedTotal = (totalAmount / 100).toFixed(2)
        return NextResponse.json(
            { error: `Order total of $${formattedTotal} is below the minimum of $0.50 required for online payment.` },
            { status: 400, headers: corsHeaders }
        )
    }

    if (paymentMethodId === "paypal") {
        try {
            const formattedTotal = (totalAmount / 100).toFixed(2)
            const order = await createPayPalOrder(formattedTotal, baseUrl, {
                productIds: productIds,
                couponId: couponId || undefined // Explicitly undefined if falsey/empty to avoid clutter
            })

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

    if (paymentMethodId === "coinbase") {
        try {
            const amountString = (totalAmount / 100).toFixed(2)

            const coinbaseMethod = await db.paymentMethod.findUnique({ where: { name: "coinbase" } })
            const config = coinbaseMethod?.config ? JSON.parse(coinbaseMethod.config) : {}
            const apiKey = config.apiKey || process.env.COINBASE_API_KEY

            if (!apiKey) {
                throw new Error("Coinbase API Key not configured")
            }

            // Reverting to /charges as /checkouts requires different scope/auth.
            // ForbiddenError usually means the API key doesn't have permission for that specific endpoint.
            // We will try /charges again but handle it carefully.
            const payload = {
                name: "Purchase from Portfolio Shop",
                description: items.map((i) => i.name).join(", "),
                pricing_type: "fixed_price",
                local_price: {
                    amount: amountString,
                    currency: "USD",
                },
                metadata: {
                    userId: session?.user?.id,
                    productIds: JSON.stringify(productIds),
                    couponId: couponId || "",
                },
                redirect_url: `${baseUrl}/shop/success?coinbase=true`,
                cancel_url: `${baseUrl}/shop?canceled=1`,
            }

            const response = await fetch("https://api.commerce.coinbase.com/charges", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-CC-Api-Key": apiKey,
                    // Removing implicit version or setting to a neutral one might help if strict deprecation is enforced by version
                },
                body: JSON.stringify(payload),
            })

            const data = await response.json()

            if (!response.ok) {
                console.error("Coinbase error:", data)
                throw new Error(data.error?.message || "Failed to create Coinbase charge")
            }

            return NextResponse.json(
                { url: data.data.hosted_url },
                { headers: corsHeaders }
            )
        } catch (error: any) {
            console.error("Coinbase checkout error:", error)
            return NextResponse.json(
                { error: error.message || "Coinbase checkout failed" },
                { status: 500, headers: corsHeaders }
            )
        }
    }

    if (paymentMethodId === "crypto" || paymentMethodId === "bank_transfer") {
        try {
            // Create Pending Order
            const order = await db.order.create({
                data: {
                    userId: session?.user?.id as string,
                    stripeSessionId: `manual_${Date.now()}_${Math.random().toString(36).substring(7)}`, // Mock ID for constraints
                    amount: totalAmount,
                    currency: "usd",
                    status: "pending",
                    paymentMethod: paymentMethodId,
                    couponCode: couponId ? (await db.coupon.findUnique({ where: { id: couponId } }))?.code : undefined,
                    items: {
                        create: items.map((item) => {
                            let price = item.price
                            if (discountPercent > 0) {
                                price = Math.round(item.price * (1 - discountPercent / 100))
                            }
                            return {
                                productId: item.id,
                                price
                            }
                        })
                    }
                }
            })

            // Note: We do NOT generate license keys here. 
            // They should be generated when the admin marks the order as "completed".

            // Increment Coupon Usage
            if (couponId) {
                await db.coupon.update({
                    where: { id: couponId },
                    data: {
                        uses: { increment: 1 }
                    }
                }).catch((err) => console.error("Failed to increment coupon usage:", err))
            }

            return NextResponse.json(
                { url: `${baseUrl}/shop/success?manual=true&orderId=${order.id}` },
                { headers: corsHeaders }
            )

        } catch (error) {
            console.error("Manual order creation error:", error)
            return NextResponse.json(
                { error: "Failed to process order" },
                { status: 500, headers: corsHeaders }
            )
        }
    }

    // Default to Stripe
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = []

    items.forEach((item) => {
        // Check stock
        if (item.stock <= 0) {
            throw new Error(`Product ${item.name} is out of stock`)
        }

        let unitAmount = item.price
        if (discountPercent > 0) {
            unitAmount = Math.round(item.price * (1 - discountPercent / 100))
        }

        line_items.push({
            quantity: 1,
            price_data: {
                currency: 'USD',
                product_data: {
                    name: item.name,
                },
                unit_amount: unitAmount,
            },
        })
    })

    try {
        const stripeSession = await stripe.checkout.sessions.create({
            line_items,
            mode: "payment",
            billing_address_collection: "required",
            phone_number_collection: {
                enabled: true,
            },
            success_url: `${baseUrl}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/shop?canceled=1`,
            metadata: {
                productIds: JSON.stringify(productIds),
                couponId: couponId || ""
            },
            customer_email: session?.user?.email || undefined, // Prefill email if logged in
        })

        return NextResponse.json(
            { url: stripeSession.url },
            {
                headers: corsHeaders,
            }
        )
    } catch (error: any) {
        console.error("Stripe checkout error detailed:", JSON.stringify(error, null, 2))

        const message =
            error?.message ||
            "Unable to create checkout session. Please try again."

        const status = error?.statusCode && Number.isInteger(error.statusCode)
            ? error.statusCode
            : 500

        return NextResponse.json(
            { error: message, details: error.type },
            {
                status,
                headers: corsHeaders,
            }
        )
    }
}
