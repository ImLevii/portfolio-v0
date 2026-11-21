import { getSeasonalSettings } from "@/actions/seasonal-settings"
import { SeasonalSettingsForm } from "@/components/admin/seasonal-settings-form"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { Metadata } from "next"
import { Snowflake } from "lucide-react"

export const metadata: Metadata = {
    title: "Seasonal Settings | Admin",
    description: "Manage seasonal effects and audio",
}

export default async function SeasonalSettingsPage() {
    const settings = await getSeasonalSettings()

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Seasonal Control"
                description="Manage seasonal effects, overlays, and auditory experiences."
                icon={Snowflake}
                accent="blue"
            />

            <SeasonalSettingsForm settings={settings} />
        </div>
    )
}
