import { getSeasonalSettings } from "@/actions/seasonal-settings"
import { SeasonalSettingsForm } from "@/components/admin/seasonal-settings-form"
import { Metadata } from "next"
import { Snowflake } from "lucide-react"

export const metadata: Metadata = {
    title: "Seasonal Settings | Admin",
    description: "Manage seasonal effects and audio",
}

export default async function SeasonalSettingsPage() {
    const settings = await getSeasonalSettings()

    return (
        <div className="space-y-8 p-4 md:p-8">
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    <Snowflake className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight font-orbitron text-white">Seasonal Control</h1>
                    <p className="text-zinc-400">Manage seasonal effects, overlays, and auditory experiences.</p>
                </div>
            </div>

            <SeasonalSettingsForm settings={settings} />
        </div>
    )
}
