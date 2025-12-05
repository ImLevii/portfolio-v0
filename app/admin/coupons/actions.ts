"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const CouponSchema = z.object({
    code: z.string().min(3).toUpperCase(),
    percent: z.number().min(1).max(100),
    maxUses: z.number().optional().nullable(),
    expiresAt: z.string().optional().nullable(),
})

export async function createCoupon(prevState: any, formData: FormData) {
    try {
        const code = formData.get("code") as string
        const percent = Number(formData.get("percent"))
        const maxUses = formData.get("maxUses") ? Number(formData.get("maxUses")) : null
        const expiresAt = formData.get("expiresAt") ? new Date(formData.get("expiresAt") as string) : null

        const validated = CouponSchema.parse({
            code,
            percent,
            maxUses,
            expiresAt: expiresAt ? expiresAt.toISOString() : null
        })

        await db.coupon.create({
            data: {
                code: validated.code,
                percent: validated.percent,
                maxUses: validated.maxUses,
                expiresAt: expiresAt
            }
        })

        revalidatePath("/admin/coupons")
        return { success: true }
    } catch (error) {
        return { error: "Failed to create coupon" }
    }
}

export async function deleteCoupon(id: string) {
    try {
        await db.coupon.delete({ where: { id } })
        revalidatePath("/admin/coupons")
        return { success: true }
    } catch (error) {
        return { error: "Failed to delete coupon" }
    }
}

export async function toggleCoupon(id: string, isActive: boolean) {
    try {
        await db.coupon.update({ where: { id }, data: { isActive } })
        revalidatePath("/admin/coupons")
        return { success: true }
    } catch (error) {
        return { error: "Failed to update coupon" }
    }
}
