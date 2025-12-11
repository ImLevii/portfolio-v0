"use server"

import { auth } from "@/auth"
import { db as prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export interface ChatSettingsConfig {
    enabled: boolean
    systemMessageTitle: string
    systemMessageText: string
    pinnedContentEnabled: boolean
    pinnedImageUrl: string
}

const DEFAULT_SETTINGS: ChatSettingsConfig = {
    enabled: true,
    systemMessageTitle: "System",
    systemMessageText: "System Initialized. █ Welcome to the main terminal. How can I assist you with your project today? <span class='animate-pulse'>_</span>",
    pinnedContentEnabled: true,
    pinnedImageUrl: "/placeholder-logo.png"
}

export async function getChatSettings(): Promise<ChatSettingsConfig> {
    try {
        const settings = await prisma.siteSettings.findUnique({
            where: { key: "chat-settings" }
        })

        if (!settings) return DEFAULT_SETTINGS

        return { ...DEFAULT_SETTINGS, ...JSON.parse(settings.value) }
    } catch (error: any) {
        const isPlanLimit = error?.code === 'P6003' || error?.code === 'P5000' || error?.message?.includes('planLimitReached')
        if (!isPlanLimit) {
            console.error("Failed to fetch chat settings:", error)
        }
        return DEFAULT_SETTINGS
    }
}

export async function updateChatSettings(data: Partial<ChatSettingsConfig>) {
    try {
        const session = await auth()
        const role = (session?.user as any)?.role
        if (role !== "ADMIN" && role !== "Admin") {
            throw new Error("Unauthorized - Admin access required")
        }

        const current = await getChatSettings()
        const updated = { ...current, ...data }

        await prisma.siteSettings.upsert({
            where: { key: "chat-settings" },
            update: { value: JSON.stringify(updated) },
            create: {
                key: "chat-settings",
                value: JSON.stringify(updated)
            }
        })

        revalidatePath("/")
        revalidatePath("/admin/chat")

        return { success: true, settings: updated }
    } catch (error) {
        console.error("Failed to update chat settings:", error)
        return { success: false, error: "Failed to update settings" }
    }
}
