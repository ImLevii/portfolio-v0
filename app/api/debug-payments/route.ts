import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getPayPalAccessToken } from "@/lib/paypal"
import Stripe from "stripe"

export async function GET() {
    try {
        // --- PAYPAL CHECK ---
        const paypalMethod = await db.paymentMethod.findUnique({
            where: { name: "paypal" }
        })

        let ppAuthResult = "Not attempted"
        let ppAuthError = null
        let ppUsedApiUrl = null

        try {
            const result = await getPayPalAccessToken()
            ppAuthResult = "Success"
            ppUsedApiUrl = result.apiUrl
        } catch (e: any) {
            ppAuthResult = "Failed"
            ppAuthError = e.message
        }

        // --- STRIPE CHECK ---
        const stripeKey = process.env.STRIPE_SECRET_KEY || process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY
        let stripeAuthResult = "Not attempted"
        let stripeAuthError = null

        if (stripeKey) {
            try {
                const stripe = new Stripe(stripeKey, { typescript: true })
                // Simple API call to verify key
                await stripe.balance.retrieve()
                stripeAuthResult = "Success"
            } catch (e: any) {
                stripeAuthResult = "Failed"
                stripeAuthError = e.message
            }
        } else {
            stripeAuthResult = "Failed: No Key Found"
        }

        return NextResponse.json({
            paypal: {
                dbConfig: paypalMethod,
                env: {
                    PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID ? "Set" : "Unset",
                    NEXT_PUBLIC_PAYPAL_CLIENT_ID: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ? "Set" : "Unset",
                },
                authTest: {
                    result: ppAuthResult,
                    error: ppAuthError,
                    usedApiUrl: ppUsedApiUrl
                }
            },
            stripe: {
                env: {
                    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? "Set" : "Unset",
                    NEXT_PUBLIC_STRIPE_SECRET_KEY: process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY ? "Set" : "Unset",
                    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? "Set" : "Unset",
                    NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET: process.env.NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET ? "Set" : "Unset",
                },
                authTest: {
                    result: stripeAuthResult,
                    error: stripeAuthError
                }
            }
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
