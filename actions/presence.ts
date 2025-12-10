"use server"

import { db as prisma } from "@/lib/db"

export async function updatePresence(id: string) {
    try {
        await prisma.presence.upsert({
            where: { id },
            update: { lastSeen: new Date() },
            create: { id, lastSeen: new Date() }
        })
        return { success: true }
    } catch (error) {
        console.error("Failed to update presence:", error)
        return { success: false }
    }
}

export async function getOnlineCount() {
    try {
        // Define "online" as seen in the last 60 seconds
        const cutoff = new Date(Date.now() - 60 * 1000)

        // Clean up old records (optional optimization to keep table small)
        // In a real high-scale app, this would be a cron job
        await prisma.presence.deleteMany({
            where: { lastSeen: { lt: cutoff } }
        })

        const count = await prisma.presence.count({
            where: { lastSeen: { gt: cutoff } }
        })

        return { count }
    } catch (error) {
        console.error("Failed to get online count:", error)
        return { count: 0 }
    }
}
