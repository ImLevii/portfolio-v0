"use server"

import { auth } from "@/auth"
import { db as prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createTicket(category: string, guestId?: string) {
    try {
        const session = await auth()
        const userId = session?.user?.id

        if (!userId && !guestId) {
            return { success: false, error: "Authentication required" }
        }

        const ticket = await prisma.ticket.create({
            data: {
                category,
                userId: userId,
                guestId: guestId,
                status: "OPEN"
            }
        })

        return { success: true, ticket }
    } catch (error) {
        console.error("Failed to create ticket:", error)
        return { success: false, error: "Failed to create ticket" }
    }
}

export async function getUserTickets(guestId?: string) {
    try {
        const session = await auth()
        const userId = session?.user?.id

        if (!userId && !guestId) {
            return []
        }

        // Find tickets for either the logged-in user OR the guest ID
        const tickets = await prisma.ticket.findMany({
            where: {
                OR: [
                    userId ? { userId } : {},
                    guestId ? { guestId } : {}
                ]
            },
            orderBy: { updatedAt: 'desc' },
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        })

        return tickets
    } catch (error) {
        console.error("Failed to fetch tickets:", error)
        return []
    }
}

export async function getTicket(ticketId: string) {
    try {
        // In a real app, verify ownership here (user/admin)
        const ticket = await prisma.ticket.findUnique({
            where: { id: ticketId },
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 50
                }
            }
        })

        if (ticket) {
            ticket.messages.reverse()
        }

        return ticket
    } catch (error) {
        return null
    }
}

export async function getAllTickets(status?: string) {
    try {
        const session = await auth()
        const role = (session?.user as any)?.role

        if (role !== "ADMIN" && role !== "Admin") {
            // Basic protection, though this is a server action so route protection is key too
            return []
        }

        const where = status ? { status } : {}

        const tickets = await prisma.ticket.findMany({
            where,
            orderBy: { updatedAt: 'desc' },
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        })

        return tickets
    } catch (error) {
        console.error("Failed to fetch admin tickets:", error)
        return []
    }
}

export async function closeTicket(ticketId: string) {
    try {
        await prisma.ticket.update({
            where: { id: ticketId },
            data: { status: "CLOSED" }
        })
        revalidatePath('/admin/support')
        revalidatePath('/') // Revalidate home for user chat
        return { success: true }
    } catch (error) {
        return { success: false }
    }
}

export async function deleteTicket(ticketId: string) {
    try {
        await prisma.ticket.delete({
            where: { id: ticketId }
        })
        revalidatePath('/admin/support')
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error("Failed to delete ticket", error)
        return { success: false }
    }
}
