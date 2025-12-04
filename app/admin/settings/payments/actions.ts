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
        const methods = await db.paymentMethod.findMany({
            orderBy: { name: "asc" },
        })
        return methods
    } catch (error) {
        console.error("Failed to fetch payment methods:", error)
        return []
    }
}
