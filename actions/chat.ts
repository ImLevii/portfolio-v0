"use server"

import { auth } from "@/auth"
import { db as prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

import { filterProfanity } from "@/lib/profanity"

export interface ChatMessageData {
    id: string
    text: string
    senderName: string
    senderAvatar?: string | null
    senderRole?: string | null
    createdAt: Date
    reactions: {
        likes: number
        dislikes: number
        hearts: number
    }
}

export async function sendMessage(text: string, ticketId?: string) {
    try {
        const session = await auth()
        const user = session?.user

        if (!user) {
            return { success: false, error: "Unauthorized" }
        }

        const cleanText = filterProfanity(text)

        await prisma.chatMessage.create({
            data: {
                text: cleanText,
                senderName: user.name || "Anonymous",
                senderAvatar: user.image,
                senderRole: (user as any).role || "USER",
                reactions: JSON.stringify({ likes: 0, dislikes: 0, hearts: 0 }),
                ticketId: ticketId || null
            }
        })

        return { success: true }
    } catch (error) {
        console.error("Failed to send message:", error)
        return { success: false, error: "Failed to send message" }
    }
}

export async function deleteMessage(messageId: string) {
    try {
        const session = await auth()
        const role = (session?.user as any)?.role

        if (role !== "ADMIN" && role !== "Admin") {
            return { success: false, error: "Unauthorized" }
        }

        await prisma.chatMessage.delete({
            where: { id: messageId }
        })

        return { success: true }
    } catch (error) {
        console.error("Failed to delete message:", error)
        return { success: false, error: "Failed to delete" }
    }
}

export async function getRecentMessages(): Promise<ChatMessageData[]> {
    try {
        const messages = await prisma.chatMessage.findMany({
            where: { ticketId: null },
            orderBy: { createdAt: 'desc' },
            take: 50
        })

        return messages.reverse().map(msg => ({
            id: msg.id,
            text: msg.text,
            senderName: msg.senderName,
            senderAvatar: msg.senderAvatar,
            senderRole: msg.senderRole,
            createdAt: msg.createdAt,
            reactions: msg.reactions ? JSON.parse(msg.reactions) : { likes: 0, dislikes: 0, hearts: 0 }
        }))
    } catch (error) {
        return []
    }
}

export async function addReaction(messageId: string, type: 'likes' | 'dislikes' | 'hearts') {
    try {
        const message = await prisma.chatMessage.findUnique({ where: { id: messageId } })
        if (!message) return { success: false }

        const reactions = message.reactions ? JSON.parse(message.reactions) : { likes: 0, dislikes: 0, hearts: 0 }
        reactions[type]++

        await prisma.chatMessage.update({
            where: { id: messageId },
            data: { reactions: JSON.stringify(reactions) }
        })

        return { success: true }
    } catch (error) {
        return { success: false }
    }
}
