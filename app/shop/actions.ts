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

export async function validateCoupon(code: string) {
    try {
        const coupon = await db.coupon.findUnique({
            where: { code },
        })

        if (!coupon) {
            return { error: "Invalid coupon code" }
        }

        if (!coupon.isActive) {
            return { error: "This coupon is no longer active" }
        }

        if (coupon.expiresAt && coupon.expiresAt < new Date()) {
            return { error: "This coupon has expired" }
        }

        if (coupon.maxUses && coupon.uses >= coupon.maxUses) {
            return { error: "This coupon has reached its usage limit" }
        }

        return {
            success: true,
            coupon: {
                code: coupon.code,
                percent: coupon.percent,
                amount: coupon.amount
            }
        }
    } catch (error) {
        console.error("Coupon validation error:", error)
        return { error: "Failed to validate coupon" }
    }
}
