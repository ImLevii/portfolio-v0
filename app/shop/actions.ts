"use server"

import { db } from "@/lib/db"

export async function getEnabledPaymentMethods() {
    try {
        const methods = await db.paymentMethod.findMany({
            where: { isEnabled: true },
            orderBy: { name: "asc" },
        })
        return methods
    } catch (error) {
        console.error("Failed to fetch payment methods:", error)
        return []
    }
}
