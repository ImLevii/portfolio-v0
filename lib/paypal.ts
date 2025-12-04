const PAYPAL_API_URL = "https://api-m.paypal.com"

export async function getPayPalAccessToken() {
    const clientId = "Aah3diQKlZaEyXnKZRGlcUOqwOqIpOGKfqLWC39j8Gdwhz1KdPp3Jjn06xyK01DYXfMg_XO7Fj5yMgfh"
    const clientSecret = "EEgnavQEtWZPpKWumZS-DMCJHyEHplJcraTtm26M5hSMtR-sWuyODxNXltv7QZz81Vxpx0U9e4hJWGcU"

    if (!clientId || !clientSecret) {
        throw new Error("Missing PayPal credentials")
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

    const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
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
    return data.access_token as string
}

export async function createPayPalOrder(amount: string) {
    const accessToken = await getPayPalAccessToken()

    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/shop/success?method=paypal`
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/shop?canceled=1`

    console.log("Creating PayPal Order:", { amount, returnUrl, cancelUrl })

    const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
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
    const accessToken = await getPayPalAccessToken()

    const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderID}/capture`, {
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
