import { getSeasonalSettings } from "@/actions/seasonal-settings"
import { SeasonalSettingsForm } from "@/components/admin/seasonal-settings-form"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Seasonal Settings | Admin",
    description: "Manage seasonal effects and audio",
}

export default async function SeasonalSettingsPage() {
    const settings = await getSeasonalSettings()

    return (
        <div className="space-y-8 p-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold font-orbitron text-white">Seasonal Settings</h1>
                <p className="text-gray-400">
                    Customize the visual effects and audio for seasonal events.
                </p>
            </div>

            <SeasonalSettingsForm settings={settings} />
        </div>
    )
}
