import { db } from "@/lib/db"

const PAYPAL_API_URL = "https://api-m.paypal.com"

export async function getPayPalAccessToken() {
    const method = await db.paymentMethod.findUnique({
        where: { name: "paypal" }
    })

    let clientId = process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
    let clientSecret = process.env.PAYPAL_CLIENT_SECRET || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_SECRET

    // Valid values: 'sandbox' or 'live'
    const envMode = process.env.PAYPAL_MODE || (process.env.NODE_ENV === "development" ? "sandbox" : "live")

    // Default to Live unless Env explicitly says Sandbox or provides a Sandbox URL
    let apiUrl = process.env.PAYPAL_API_URL || process.env.NEXT_PUBLIC_PAYPAL_API_URL ||
        (envMode === "sandbox" ? "https://api-m.sandbox.paypal.com" : PAYPAL_API_URL)

    // Trim Env vars if they exist
    if (clientId) clientId = clientId.trim()
    if (clientSecret) clientSecret = clientSecret.trim()
    if (apiUrl) apiUrl = apiUrl.trim()

    let useDbConfig = false

    // Check if we have a "Complete" Env set.
    // If we have ID but no Secret in Env, we cannot use Env.
    // We must ensure we don't mix Env ID with DB Secret.
    const isEnvComplete = !!clientId && !!clientSecret

    if (!isEnvComplete && method && method.config) {
        try {
            const config = JSON.parse(method.config)

            // If Env is incomplete, we switch ENTIRELY to DB config if available.
            // This prevents "Public Env ID" + "DB Secret" mismatch.
            if (config.clientId && config.clientSecret) {
                clientId = config.clientId.trim()
                clientSecret = config.clientSecret.trim()
                useDbConfig = true
                console.log("PayPal: Environment credentials incomplete. Switched to Database configuration.")
            }

            // Fix: Override URL based on DB mode if URL wasn't explicitly set by Env var (custom URL)
            // We check if the current apiUrl is just the default one.
            // If we are using DB config, we should respect DB mode
            if (useDbConfig && !process.env.PAYPAL_API_URL && !process.env.NEXT_PUBLIC_PAYPAL_API_URL) {
                if (config.mode === "sandbox") {
                    apiUrl = "https://api-m.sandbox.paypal.com"
                } else {
                    apiUrl = PAYPAL_API_URL
                }
            }
        } catch (e) {
            console.error("Failed to parse PayPal config from DB", e)
        }
    }

    // Logging to debug source of truth without leaking secrets
    const source = useDbConfig ? "DB (Fallback)" : "Env"
    const isSandbox = apiUrl.includes("sandbox")
    const maskedId = clientId ? `${clientId.substring(0, 4)}...${clientId.substring(clientId.length - 4)}` : "MISSING"

    console.log(`PayPal Config Debug: Source=[${source}], Mode=[${isSandbox ? "SANDBOX" : "LIVE"}]`)
    console.log(`PayPal Config Detail: URL=[${apiUrl}], ClientID=[${maskedId}]`)

    if (!clientId || !clientSecret) {
        throw new Error("Missing PayPal credentials. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env.local or Admin Dashboard.")
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
        console.error("PayPal Auth Failed. Response Status:", response.status)
        console.error("PayPal Token Error Response:", error)
        console.error("Used Client ID:", maskedId) // Log masked ID to verify correct one used
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
