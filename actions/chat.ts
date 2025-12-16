"use server"

import { auth } from "@/auth"
import { db as prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { filterProfanity } from "@/lib/profanity"


export interface ChatMessageData {
    id: string
    text: string
    senderName: string
    senderId?: string | null
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

        // Ensure ticketId is handled correctly. If it's an empty string or "undefined", treat as null (Global).
        // If it's a valid string, use it.
        let effectiveTicketId: string | null = null
        if (ticketId && typeof ticketId === 'string' && ticketId.trim().length > 0 && ticketId !== "undefined" && ticketId !== "null") {
            effectiveTicketId = ticketId
        }

        console.log(`[sendMessage] Sender: ${user.name}, TicketId: ${effectiveTicketId} (Raw: ${ticketId})`)

        if (effectiveTicketId) {
            const ticket = await prisma.ticket.findUnique({
                where: { id: effectiveTicketId },
                select: { status: true }
            })

            if (!ticket) {
                return { success: false, error: "Ticket not found" }
            }

            if (ticket.status === 'CLOSED') {
                // Allow admins to reply to closed tickets (e.g. for final remarks)
                // Block customers/users
                const role = (user as any).role
                if (role !== "ADMIN" && role !== "Admin") {
                    return { success: false, error: "This ticket is closed. You cannot reply to it." }
                }
            }
        }

        await prisma.chatMessage.create({
            data: {
                text: cleanText,
                senderName: user.name || "Anonymous",
                senderId: user.id,
                senderAvatar: user.image,
                senderRole: (user as any).role || "USER",
                reactions: JSON.stringify({ likes: 0, dislikes: 0, hearts: 0 }),
                ticketId: effectiveTicketId
            }
        })

        return { success: true }
    } catch (error: any) {
        console.error("Failed to send message:", error)

        // Handle Foreign Key Constraint (Ticket deleted or invalid)
        if (error.code === 'P2003') {
            return { success: false, error: "This ticket strictly no longer exists." }
        }

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
        return { success: false, error: "Failed to delete" }
    }
}


export async function clearChat() {
    try {
        const session = await auth()
        const role = (session?.user as any)?.role

        if (role !== "ADMIN" && role !== "Admin") {
            return { success: false, error: "Unauthorized" }
        }

        // Delete ALL messages
        await prisma.chatMessage.deleteMany()

        revalidatePath("/")
        return { success: true }
    } catch (error) {
        console.error("Failed to clear chat:", error)
        return { success: false, error: "Failed to clear chat" }
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
            senderId: msg.senderId,
            senderAvatar: msg.senderAvatar,
            senderRole: msg.senderRole,
            createdAt: msg.createdAt,
            reactions: msg.reactions ? JSON.parse(msg.reactions) : { likes: 0, dislikes: 0, hearts: 0 }
        }))
    } catch (error) {
        return []
    }
}

export async function getChatUserProfile(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                image: true,
                role: true,
                createdAt: true // Join Date
            }
        })

        if (!user) return null

        // Calculate Stats
        const messagesSent = await prisma.chatMessage.count({
            where: { senderId: userId }
        })

        // Total likes received on their messages
        const likesReceived = await prisma.chatReaction.count({
            where: {
                message: {
                    senderId: userId
                },
                type: 'likes'
            }
        })

        const dislikesReceived = await prisma.chatReaction.count({
            where: {
                message: {
                    senderId: userId
                },
                type: 'dislikes'
            }
        })

        const heartsReceived = await prisma.chatReaction.count({
            where: {
                message: {
                    senderId: userId
                },
                type: 'hearts'
            }
        })

        return {
            ...user,
            stats: {
                messagesSent,
                likesReceived,
                dislikesReceived,
                heartsReceived
            }
        }

    } catch (error) {
        return null
    }
}

export async function addReaction(messageId: string, type: 'likes' | 'dislikes' | 'hearts') {
    try {
        const session = await auth()
        if (!session?.user?.id) return { success: false, error: "Must be logged in" }
        const userId = session.user.id

        // 0. Check Message & Prevent Self-Reaction
        const message = await prisma.chatMessage.findUnique({
            where: { id: messageId },
            select: { senderId: true }
        })

        if (!message) return { success: false, error: "Message not found" }

        if (message.senderId === userId) {
            return { success: false, error: "Cannot react to own message" }
        }

        // 1. Check if reaction exists (Toggle Logic)
        const existing = await prisma.chatReaction.findUnique({
            where: {
                messageId_userId_type: {
                    messageId,
                    userId,
                    type
                }
            }
        })

        if (existing) {
            // REMOVE reaction (Toggle Off)
            await prisma.chatReaction.delete({
                where: { id: existing.id }
            })
        } else {
            // ADD reaction
            await prisma.chatReaction.create({
                data: {
                    messageId,
                    userId,
                    type
                }
            })
        }

        // 2. Recalculate totals for the message to keep JSON cache in sync
        const counts = await prisma.chatReaction.groupBy({
            by: ['type'],
            where: { messageId },
            _count: true
        })

        const newReactions = { likes: 0, dislikes: 0, hearts: 0 }
        counts.forEach(c => {
            if (c.type === 'likes') newReactions.likes = c._count
            if (c.type === 'dislikes') newReactions.dislikes = c._count
            if (c.type === 'hearts') newReactions.hearts = c._count
        })

        await prisma.chatMessage.update({
            where: { id: messageId },
            data: { reactions: JSON.stringify(newReactions) }
        })

        return { success: true, newState: !existing }
    } catch (error) {
        console.error(error)
        return { success: false }
    }
}

export async function getChatProducts() {
    try {
        const products = await prisma.product.findMany({
            select: {
                id: true,
                name: true
            }
        })
        return products
    } catch (error) {
        return []
    }
}
