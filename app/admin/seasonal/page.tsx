import { getSeasonalSettings } from "@/actions/seasonal-settings"
import { SeasonalSettingsForm } from "@/components/admin/seasonal-settings-form"
import { Separator } from "@/components/ui/separator"

export default async function SeasonalSettingsPage() {
    const settings = await getSeasonalSettings()

    return (
        <div className="space-y-6 pt-10 pb-10 pr-10">
            <div className="space-y-0.5">
                <h2 className="text-2xl font-bold tracking-tight font-orbitron">Seasonal Settings</h2>
                <p className="text-muted-foreground">
                    Customize global seasonal effects and audio.
                </p>
            </div>
            <Separator className="my-6 bg-white/10" />
            <SeasonalSettingsForm initialSettings={settings} />
        </div>
    )
}
