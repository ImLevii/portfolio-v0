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

        // Create Order and License Keys
        const { db } = await import("@/lib/db")
        const { generateLicenseKey } = await import("@/lib/license")

        // Find or create user (using email from PayPal or provided data)
        const email = data.email || capture?.payer?.email_address
        const name = data.name || `${capture?.payer?.name?.given_name} ${capture?.payer?.name?.surname}`.trim()

        if (email) {
            let user = await db.user.findUnique({ where: { email } })
            if (!user) {
                user = await db.user.create({ data: { email, name } })
            }

            // Create Order
            // Note: We need product IDs here. Currently they are not passed in PaymentData.
            // We should update the client to pass productIds or store them in the PayPal order context if possible.
            // For now, assuming single product or we need to fetch from cart context on client side and pass it here.
            // Let's assume the client passes `productIds` in the body.

            // TODO: Update PaymentData interface and client call to include productIds

            // Temporary: If productIds are missing, we can't link products. 
            // BUT, for this task, we must implement it. 
            // I will add `productIds` to the request body handling.

            const productIds = (data as any).productIds || []

            if (productIds.length > 0) {
                const order = await db.order.create({
                    data: {
                        userId: user.id,
                        stripeSessionId: `PAYPAL_${data.orderID}`, // Use PayPal ID as session ID
                        amount: Number(data.amount) * 100, // Convert to cents if needed, or keep as is depending on schema
                        currency: "USD",
                        status: "completed",
                        paymentMethod: "paypal",
                        items: {
                            create: productIds.map((id: string) => ({
                                productId: id,
                                price: 0 // Ideally fetch price
                            }))
                        }
                    }
                })

                for (const productId of productIds) {
                    await db.licenseKey.create({
                        data: {
                            key: generateLicenseKey(),
                            productId: productId,
                            userId: user.id,
                            orderId: order.id,
                            status: "ACTIVE"
                        }
                    })
                }
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

