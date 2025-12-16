import { db } from "@/lib/db"

const PAYPAL_API_URL = "https://api-m.paypal.com"

export async function getPayPalAccessToken() {
    const method = await db.paymentMethod.findUnique({
        where: { name: "paypal" }
    })

    let clientId = process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
    let clientSecret = process.env.PAYPAL_CLIENT_SECRET || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_SECRET
    let apiUrl = process.env.PAYPAL_API_URL || process.env.NEXT_PUBLIC_PAYPAL_API_URL || PAYPAL_API_URL

    if (method && method.config) {
        try {
            const config = JSON.parse(method.config)

            // Only use DB config if ENV vars are not present (ENV takes priority)
            if (config.clientId && !process.env.PAYPAL_CLIENT_ID && !process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) {
                clientId = config.clientId
            }
            if (config.clientSecret && !process.env.PAYPAL_CLIENT_SECRET && !process.env.NEXT_PUBLIC_PAYPAL_CLIENT_SECRET) {
                clientSecret = config.clientSecret
            }
            if (config.mode === "sandbox" && !process.env.PAYPAL_API_URL && !process.env.NEXT_PUBLIC_PAYPAL_API_URL) {
                apiUrl = "https://api-m.sandbox.paypal.com"
            }
        } catch (e) {
            console.error("Failed to parse PayPal config from DB", e)
        }
    }

    // Fallback if DB lookup failed or was empty, to the hardcoded ones (or env vars)
    // NOTE: Ideally remove hardcoded credentials in production!
    if (!clientId) clientId = "Aah3diQKlZaEyXnKZRGlcUOqwOqIpOGKfqLWC39j8Gdwhz1KdPp3Jjn06xyK01DYXfMg_XO7Fj5yMgfh"
    if (!clientSecret) clientSecret = "EEgnavQEtWZPpKWumZS-DMCJHyEHplJcraTtm26M5hSMtR-sWuyODxNXltv7QZz81Vxpx0U9e4hJWGcU"

    if (!clientId || !clientSecret) {
        throw new Error("Missing PayPal credentials")
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

    const response = await fetch(`${apiUrl}/v1/oauth2/token`, {
        method: "POST",
        headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`PayPal auth failed: ${error}`)
    }

    const data = await response.json()
    return { accessToken: data.access_token as string, apiUrl }
}

export async function createPayPalOrder(amount: string, baseUrl: string, metadata?: { productIds: string[], couponId?: string }) {
    const { accessToken, apiUrl } = await getPayPalAccessToken()

    const returnUrl = `${baseUrl}/shop/success?method=paypal`
    const cancelUrl = `${baseUrl}/shop?canceled=1`

    console.log("Creating PayPal Order:", { amount, returnUrl, cancelUrl, metadata })

    // Serialize metadata for custom_id (PayPal limit 127 chars)
    // We prioritize couponId as it's small, and list product IDs if space permits
    let customId = ""
    if (metadata) {
        try {
            const payload = {
                c: metadata.couponId,
                p: metadata.productIds
            }
            customId = JSON.stringify(payload)
            if (customId.length > 127) {
                // If too long, just send coupon and count of products
                customId = JSON.stringify({
                    c: metadata.couponId,
                    p_count: metadata.productIds.length
                })
            }
        } catch (e) {
            console.error("Failed to serialize PayPal metadata", e)
        }
    }

    const response = await fetch(`${apiUrl}/v2/checkout/orders`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: "USD",
                        value: amount,
                    },
                    custom_id: customId || undefined
                },
            ],
            application_context: {
                return_url: returnUrl,
                cancel_url: cancelUrl,
            },
        }),
    })

    if (!response.ok) {
        const error = await response.text()
        console.error("PayPal Order Creation Failed:", error)
        throw new Error(`PayPal order creation failed: ${error}`)
    }

    const data = await response.json()
    console.log("PayPal Order Created:", JSON.stringify(data, null, 2))
    return data
}

export async function capturePayPalOrder(orderID: string) {
    const { accessToken, apiUrl } = await getPayPalAccessToken()

    const response = await fetch(`${apiUrl}/v2/checkout/orders/${orderID}/capture`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`PayPal capture failed: ${error}`)
    }

    return response.json()
}
