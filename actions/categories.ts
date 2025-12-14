"use server"

import { auth } from "@/auth"
import { db as prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

// Constants for allowed icons (could be expanded)
export const ALLOWED_ICONS = ["credit-card", "gamepad", "headphones", "dollar-sign", "shield-check", "message-square"]

export async function getSupportCategories() {
    try {
        const categories = await prisma.supportCategory.findMany({
            orderBy: { order: 'asc' }
        })
        return categories
    } catch (error) {
        console.error("Failed to fetch support categories:", error)
        return []
    }
}

export async function createSupportCategory(data: { title: string; subtitle?: string; icon: string; order?: number }) {
    try {
        const session = await auth()
        const role = (session?.user as any)?.role

        if (role !== "ADMIN" && role !== "Admin") {
            return { success: false, error: "Unauthorized" }
        }

        await prisma.supportCategory.create({
            data: {
                title: data.title,
                subtitle: data.subtitle,
                icon: data.icon,
                order: data.order || 0
            }
        })

        revalidatePath("/")
        revalidatePath("/admin/support")
        return { success: true }
    } catch (error) {
        console.error("Failed to create category:", error)
        return { success: false, error: "Failed to create category" }
    }
}

export async function updateSupportCategory(id: string, data: { title?: string; subtitle?: string; icon?: string; order?: number }) {
    try {
        const session = await auth()
        const role = (session?.user as any)?.role

        if (role !== "ADMIN" && role !== "Admin") {
            return { success: false, error: "Unauthorized" }
        }

        await prisma.supportCategory.update({
            where: { id },
            data
        })

        revalidatePath("/")
        revalidatePath("/admin/support")
        return { success: true }
    } catch (error) {
        console.error("Failed to update category:", error)
        return { success: false, error: "Failed to update category" }
    }
}

export async function deleteSupportCategory(id: string) {
    try {
        const session = await auth()
        const role = (session?.user as any)?.role

        if (role !== "ADMIN" && role !== "Admin") {
            return { success: false, error: "Unauthorized" }
        }

        await prisma.supportCategory.delete({
            where: { id }
        })

        revalidatePath("/")
        revalidatePath("/admin/support")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete category:", error)
        return { success: false, error: "Failed to delete category" }
    }
}
