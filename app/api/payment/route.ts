import { NextResponse } from "next/server"

interface PaymentData {
    name?: string
    email?: string
    amount: string
    orderID: string
}

const PAYPAL_API_URL = process.env.PAYPAL_API_URL || "https://api-m.sandbox.paypal.com"

async function getPayPalAccessToken() {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET

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

async function capturePayPalOrder(orderID: string, accessToken: string) {
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

export async function POST(req: Request) {
    try {
        const data = (await req.json()) as PaymentData

        if (!data.amount || !data.orderID) {
            return NextResponse.json(
                { error: "Missing required payment fields" },
                { status: 400 }
            )
        }

        const accessToken = await getPayPalAccessToken()
        const captureData = await capturePayPalOrder(data.orderID, accessToken)

        if (captureData.status !== "COMPLETED") {
            return NextResponse.json(
                { error: `Payment capture failed with status ${captureData.status}` },
                { status: 400 }
            )
        }

        const capture =
            captureData?.purchase_units?.[0]?.payments?.captures?.[0]
        const captureAmount = capture?.amount?.value
        const captureCurrency = capture?.amount?.currency_code

        if (!captureAmount || !captureCurrency) {
            return NextResponse.json(
                { error: "Unable to verify captured amount" },
                { status: 400 }
            )
        }

        const normalizedClientAmount = Number.parseFloat(data.amount).toFixed(2)

        if (
            normalizedClientAmount !== Number.parseFloat(captureAmount).toFixed(2) ||
            captureCurrency !== "USD"
        ) {
            return NextResponse.json(
                { error: "Captured amount does not match order total" },
                { status: 400 }
            )
        }

        return NextResponse.json(
            {
                success: true,
                data: {
                    orderID: data.orderID,
                    captureID: capture?.id ?? captureData.id,
                    captureStatus: captureData.status,
                    name: data.name,
                    email: data.email,
                    amount: data.amount,
                },
            },
            { status: 200 }
        )
    } catch (error) {
        console.error("PayPal payment error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

export async function GET() {
    return NextResponse.json({ status: "ok" })
}

