"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { generateLicenseKey } from "@/lib/license"

export async function updateOrderStatus(orderId: string, status: string) {
    const session = await auth()
    // @ts-ignore
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "Admin") {
        return { error: "Unauthorized" }
    }

    try {
        const order = await db.order.findUnique({
            where: { id: orderId },
            include: { items: true }
        })

        if (!order) return { error: "Order not found" }

        // If status is changing to 'completed' and wasn't before
        if (status === "completed" && order.status !== "completed") {
            // Generate License Keys
            for (const item of order.items) {
                // Check if key already exists (unlikely for new manual order but good safety)
                const existingKey = await db.licenseKey.findFirst({
                    where: {
                        orderId: order.id,
                        productId: item.productId
                    }
                })

                if (!existingKey) {
                    // Fetch product to check duration
                    const product = await db.product.findUnique({ where: { id: item.productId } })
                    const expiresAt = product?.duration ? new Date(Date.now() + product.duration * 24 * 60 * 60 * 1000) : null

                    await db.licenseKey.create({
                        data: {
                            key: generateLicenseKey(),
                            productId: item.productId,
                            userId: order.userId,
                            orderId: order.id,
                            status: "ACTIVE",
                            expiresAt: expiresAt
                        }
                    })

                    // Decrement Stock
                    await db.product.update({
                        where: { id: item.productId },
                        data: {
                            stock: {
                                decrement: 1
                            }
                        }
                    }).catch(err => console.error(`Failed to decrement stock for product ${item.id}:`, err))
                }
            }
        }

        await db.order.update({
            where: { id: orderId },
            data: { status }
        })

        revalidatePath("/admin/orders")
        return { success: true }
    } catch (error) {
        console.error("Failed to update order:", error)
        return { error: "Failed to update order status" }
    }
}
