"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export interface SponsoredMessageData {
    id: string
    title: string
    description: string
    imageUrl: string | null
    linkUrl: string | null
    frequency: number
    isActive: boolean
}

// Admin: Get all sponsored messages
export async function getSponsoredMessages() {
    try {
        const session = await auth()
        const user = session?.user

        if (!user || (user as any).role !== "ADMIN") {
            return { success: false, error: "Unauthorized" }
        }

        const messagesRaw = await db.sponsoredMessage.findMany({
            orderBy: { createdAt: 'desc' }
        })

        const messages: SponsoredMessageData[] = messagesRaw.map(msg => ({
            id: msg.id,
            title: msg.title,
            description: msg.description,
            imageUrl: msg.imageUrl,
            linkUrl: msg.linkUrl,
            frequency: msg.frequency,
            isActive: msg.isActive
        }))

        return { success: true, messages }
    } catch (error) {
        console.error("Failed to fetch sponsored messages:", error)
        return { success: false, error: "Failed to fetch messages" }
    }
}

// Client: Get a single random active sponsored message
export async function getActiveSponsoredMessage() {
    try {
        const messages = await db.sponsoredMessage.findMany({
            where: { isActive: true }
        })

        if (messages.length === 0) return null

        // Pick one randomly
        const randomIndex = Math.floor(Math.random() * messages.length)
        return messages[randomIndex]
    } catch (error) {
        return null
    }
}

// Admin: Create 
export async function createSponsoredMessage(data: {
    title: string
    description: string
    imageUrl?: string
    linkUrl?: string
    frequency: number
}) {
    try {
        const session = await auth()
        if ((session?.user as any)?.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" }
        }

        await db.sponsoredMessage.create({
            data: {
                title: data.title,
                description: data.description,
                imageUrl: data.imageUrl || null,
                linkUrl: data.linkUrl || null,
                frequency: data.frequency || 15,
                isActive: true
            }
        })

        revalidatePath("/admin/sponsored")
        return { success: true }
    } catch (error) {
        console.error("Failed to create sponsored message:", error)
        return { success: false, error: "Failed to create" }
    }
}

// Admin: Update
export async function updateSponsoredMessage(id: string, data: Partial<SponsoredMessageData>) {
    try {
        const session = await auth()
        if ((session?.user as any)?.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" }
        }

        await db.sponsoredMessage.update({
            where: { id },
            data
        })

        revalidatePath("/admin/sponsored")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to update" }
    }
}

// Admin: Delete
export async function deleteSponsoredMessage(id: string) {
    try {
        const session = await auth()
        if ((session?.user as any)?.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" }
        }

        await db.sponsoredMessage.delete({
            where: { id }
        })

        revalidatePath("/admin/sponsored")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete" }
    }
}
