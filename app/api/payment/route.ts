import { capturePayPalOrder } from "@/lib/paypal"
import { NextResponse } from "next/server"

interface PaymentData {
    name?: string
    email?: string
    amount?: string
    orderID: string
}

export async function POST(req: Request) {
    try {
        const data = (await req.json()) as PaymentData

        if (!data.orderID) {
            return NextResponse.json(
                { error: "Missing required orderID" },
                { status: 400 }
            )
        }

        const captureData = await capturePayPalOrder(data.orderID)

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

        if (data.amount) {
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

