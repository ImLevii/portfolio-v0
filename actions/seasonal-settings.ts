"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

const SETTINGS_KEY = "seasonal-effects"

export interface SeasonalSettings {
    mode: "auto" | "winter" | "autumn" | "none"
    snowDensity: number // 1-100
    leavesDensity: number // 1-100
    enableAudio: boolean // Master toggle for seasonal audio
    musicVolume: number // 0-100 (default for soundtrack)
    soundEffectsVolume: number // 0-100 (impacts, etc)
}

const DEFAULT_SETTINGS: SeasonalSettings = {
    mode: "auto",
    snowDensity: 50,
    leavesDensity: 50,
    enableAudio: true,
    musicVolume: 5,
    soundEffectsVolume: 10,
}

export async function getSeasonalSettings(): Promise<SeasonalSettings> {
    try {
        const settings = await db.siteSettings.findUnique({
            where: { key: SETTINGS_KEY },
        })

        if (!settings) {
            return DEFAULT_SETTINGS
        }

        return { ...DEFAULT_SETTINGS, ...JSON.parse(settings.value) }
    } catch (error) {
        console.error("Failed to fetch seasonal settings:", error)
        return DEFAULT_SETTINGS
    }
}

export async function updateSeasonalSettings(data: SeasonalSettings) {
    try {
        await db.siteSettings.upsert({
            where: { key: SETTINGS_KEY },
            update: { value: JSON.stringify(data) },
            create: { key: SETTINGS_KEY, value: JSON.stringify(data) },
        })

        revalidatePath("/")
        revalidatePath("/admin/seasonal")
        return { success: true }
    } catch (error) {
        console.error("Failed to update seasonal settings:", error)
        return { success: false, error: "Failed to update settings" }
    }
}
