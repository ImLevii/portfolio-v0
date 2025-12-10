"use server"

import { auth } from "@/auth"
import { db as prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export type SeasonalMode = "auto" | "winter" | "autumn" | "none"

export interface SeasonalSettingsConfig {
    mode: SeasonalMode
    enabled: boolean
    snowDensity: number // 1-100
    leavesDensity: number // 1-100
    musicEnabled: boolean
    musicDuration: number // seconds
    musicFadeOut: boolean
    audioVolume: number // 0-100
}

const DEFAULT_SETTINGS: SeasonalSettingsConfig = {
    mode: "auto",
    enabled: true,
    snowDensity: 50,
    leavesDensity: 30,
    musicEnabled: true,
    musicDuration: 15,
    musicFadeOut: true,
    audioVolume: 20
}

export async function getSeasonalSettings(): Promise<SeasonalSettingsConfig> {
    try {
        const settings = await prisma.siteSettings.findUnique({
            where: { key: "seasonal-effects" }
        })

        if (!settings) return DEFAULT_SETTINGS

        return { ...DEFAULT_SETTINGS, ...JSON.parse(settings.value) }
    } catch (error) {
        console.error("Failed to fetch seasonal settings:", error)
        return DEFAULT_SETTINGS
    }
}

export async function updateSeasonalSettings(data: Partial<SeasonalSettingsConfig>) {
    try {
        const session = await auth()
        if ((session?.user as any)?.role !== "ADMIN") {
            throw new Error("Unauthorized")
        }

        const current = await getSeasonalSettings()
        const updated = { ...current, ...data }

        await prisma.siteSettings.upsert({
            where: { key: "seasonal-effects" },
            update: { value: JSON.stringify(updated) },
            create: {
                key: "seasonal-effects",
                value: JSON.stringify(updated)
            }
        })

        revalidatePath("/")
        revalidatePath("/admin/seasonal")

        return { success: true, settings: updated }
    } catch (error) {
        console.error("Failed to update seasonal settings:", error)
        return { success: false, error: "Failed to update settings" }
    }
}
