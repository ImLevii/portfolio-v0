"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function deleteProduct(id: string) {
    try {
        await db.product.delete({
            where: {
                id: id
            }
        })
        revalidatePath("/admin/products")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete product:", error)
        return { success: false, error: "Failed to delete product" }
    }
}

export async function toggleProductListing(id: string, isListed: boolean) {
    try {
        await db.product.update({
            where: { id },
            data: { isListed }
        })
        revalidatePath("/admin/products")
        revalidatePath("/shop")
        return { success: true }
    } catch (error) {
        console.error("Failed to toggle product listing:", error)
        return { success: false, error: "Failed to toggle product listing" }
    }
}

export async function deleteOrder(id: string) {
    try {
        await db.order.delete({
            where: { id }
        })
        revalidatePath("/admin/orders")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete order:", error)
        return { success: false, error: "Failed to delete order" }
    }
}
