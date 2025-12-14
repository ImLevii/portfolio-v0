"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"

export async function updatePaymentMethod(
    id: string,
    data: {
        isEnabled?: boolean
        config?: string
    }
) {
    try {
        await db.paymentMethod.update({
            where: { id },
            data,
        })

        revalidatePath("/admin/settings/payments")
        return { success: true }
    } catch (error) {
        console.error("Failed to update payment method:", error)
        return { success: false, error: "Failed to update payment method" }
    }
}

export async function getPaymentMethods() {
    try {
        let methods = await db.paymentMethod.findMany({
            orderBy: { name: "asc" },
        })

        if (methods.length === 0) {
            // Seed default payment methods
            const defaults = [
                {
                    name: "stripe",
                    displayName: "Stripe",
                    isEnabled: false,
                    config: JSON.stringify({ publishableKey: "", secretKey: "" })
                },
                {
                    name: "paypal",
                    displayName: "PayPal",
                    isEnabled: false,
                    config: JSON.stringify({ clientId: "", clientSecret: "" })
                },
                {
                    name: "crypto",
                    displayName: "Crypto",
                    isEnabled: false,
                    config: JSON.stringify({ walletAddress: "" })
                },
                {
                    name: "bank_transfer",
                    displayName: "Bank Transfer",
                    isEnabled: false,
                    config: JSON.stringify({ bankName: "", accountNumber: "" })
                }
            ]

            for (const method of defaults) {
                await db.paymentMethod.create({ data: method })
            }

            methods = await db.paymentMethod.findMany({
                orderBy: { name: "asc" },
            })
        }

        return methods
    } catch (error) {
        console.error("Failed to fetch payment methods:", error)
        return []
    }
}
