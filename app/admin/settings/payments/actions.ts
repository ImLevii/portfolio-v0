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
                    name: "Stripe",
                    isEnabled: false,
                    config: JSON.stringify({ publishableKey: "", secretKey: "" }),
                    icon: "credit-card"
                },
                {
                    name: "PayPal",
                    isEnabled: false,
                    config: JSON.stringify({ clientId: "", clientSecret: "" }),
                    icon: "dollar-sign"
                },
                {
                    name: "Crypto",
                    isEnabled: false,
                    config: JSON.stringify({ walletAddress: "" }),
                    icon: "bitcoin"
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
