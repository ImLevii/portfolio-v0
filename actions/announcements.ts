"use server"

import { auth } from "@/auth"
import { db as prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export interface AnnouncementConfig {
    active: boolean
    text: string
    imageUrl?: string
    soundType: 'notification' | 'alert' | 'none'
    color: 'green' | 'blue' | 'red' | 'purple' | 'orange' | 'pink' | 'yellow' | 'teal'
    timestamp: number // Used to detect "new" announcements on client
    autoHideAfter?: number // seconds, optional. 0 = permanent
    title?: string
    linkUrl?: string
}

export async function getAnnouncement(): Promise<AnnouncementConfig | null> {
    try {
        const settings = await prisma.siteSettings.findUnique({
            where: { key: "global-announcement" }
        })

        if (!settings) return null
        return JSON.parse(settings.value)
    } catch (error) {
        return null
    }
}

export async function broadcastAnnouncement(data: {
    text: string,
    imageUrl?: string,
    soundType: 'notification' | 'alert' | 'none',
    color: 'green' | 'blue' | 'red' | 'purple' | 'orange' | 'pink' | 'yellow' | 'teal',
    title?: string,
    linkUrl?: string,
    duration?: number
}) {
    try {
        const session = await auth()
        const role = (session?.user as any)?.role
        if (role !== "ADMIN" && role !== "Admin") {
            throw new Error("Unauthorized")
        }

        const config: AnnouncementConfig = {
            active: true,
            text: data.text,
            imageUrl: data.imageUrl,
            soundType: data.soundType,
            color: data.color || 'green',
            timestamp: Date.now(),
            autoHideAfter: data.duration !== undefined ? data.duration : 10,
            title: data.title,
            linkUrl: data.linkUrl
        }

        await prisma.siteSettings.upsert({
            where: { key: "global-announcement" },
            update: { value: JSON.stringify(config) },
            create: {
                key: "global-announcement",
                value: JSON.stringify(config)
            }
        })

        revalidatePath("/")
        return { success: true }
    } catch (error) {
        console.error("Broadcast failed:", error)
        return { success: false }
    }
}

export async function clearAnnouncement() {
    try {
        const session = await auth()
        const role = (session?.user as any)?.role
        if (role !== "ADMIN" && role !== "Admin") {
            throw new Error("Unauthorized")
        }

        const settings = await prisma.siteSettings.findUnique({ where: { key: "global-announcement" } })
        if (settings) {
            const current = JSON.parse(settings.value)
            const updated = { ...current, active: false }

            await prisma.siteSettings.update({
                where: { key: "global-announcement" },
                data: { value: JSON.stringify(updated) }
            })
        }

        revalidatePath("/")
        return { success: true }
    } catch (error) {
        return { success: false }
    }
}
