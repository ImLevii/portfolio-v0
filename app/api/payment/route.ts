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

            // Extract metadata from custom_id using the same logic as creation
            let productIds: string[] = []
            let couponId: string | undefined = undefined

            const customId = capture?.custom_id
            if (customId) {
                try {
                    const payload = JSON.parse(customId)
                    // Check if it's the full payload or the shortened one
                    if (payload.p && Array.isArray(payload.p)) {
                        productIds = payload.p
                    } else if (payload.p_count) {
                        // Fallback logic if we had to truncat (shouldn't happen often for small cart)
                        // If we truncated, we might have lost the IDs. 
                        // However, let's also check if client passed them in body as backup
                        console.warn("PayPal metadata was truncated, checking fallback body data")
                    }

                    if (payload.c) {
                        couponId = payload.c
                    }
                } catch (e) {
                    console.error("Failed to parse PayPal custom_id metadata", e)
                }
            }

            // Fallback to body data if metadata missing
            if (productIds.length === 0 && (data as any).productIds) {
                productIds = (data as any).productIds
            }

            // Fallback to couponID from body if not found in custom_id
            if (!couponId && (data as any).couponId) {
                couponId = (data as any).couponId
            }

            if (productIds.length > 0) {
                const order = await db.order.create({
                    data: {
                        userId: user.id,
                        stripeSessionId: `PAYPAL_${data.orderID}`, // Use PayPal ID as session ID
                        amount: Number(data.amount) * 100, // Convert to cents
                        currency: "USD",
                        status: "completed",
                        paymentMethod: "paypal",
                        couponCode: couponId ? (await db.coupon.findUnique({ where: { id: couponId } }))?.code : undefined,
                        items: {
                            create: productIds.map((id: string) => ({
                                productId: id,
                                price: 0 // Ideally fetch price or calculate based on total/count
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

                // Increment Coupon Usage
                if (couponId) {
                    await db.coupon.update({
                        where: { id: couponId },
                        data: {
                            uses: { increment: 1 }
                        }
                    }).catch(err => console.error("Failed to increment coupon usage:", err))
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

