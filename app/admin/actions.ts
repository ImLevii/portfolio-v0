"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export type SystemHealth = {
    status: 'online' | 'degraded' | 'offline'
    latency: number
    message: string
    timestamp: number
}

export async function checkSystemHealth(): Promise<SystemHealth> {
    try {
        const start = performance.now()
        // Simple query to check DB connectivity
        await db.$queryRaw`SELECT 1`
        const end = performance.now()
        const latency = Math.round(end - start)

        let status: SystemHealth['status'] = 'online'
        let message = 'System Operational'

        if (latency > 500) {
            status = 'degraded'
            message = 'High Latency'
        }

        return {
            status,
            latency,
            message,
            timestamp: Date.now()
        }
    } catch (error) {
        console.error("Health check failed:", error)
        return {
            status: 'offline',
            latency: 0,
            message: 'Database Connection Failed',
            timestamp: Date.now()
        }
    }
}

export async function deleteOrder(orderId: string) {
    try {
        await db.order.delete({
            where: { id: orderId }
        })
        revalidatePath("/admin/orders")
    } catch (error) {
        console.error("Failed to delete order:", error)
        throw new Error("Failed to delete order")
    }
}
