"use client"

import { useState } from "react"
import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save, Snowflake, Leaf, Music, Volume2, Clock, Activity } from "lucide-react"
import { toast } from "sonner"
import { updateSeasonalSettings, SeasonalSettingsConfig, SeasonalMode } from "@/actions/seasonal-settings"

interface SeasonalSettingsFormProps {
    settings: SeasonalSettingsConfig
}

export function SeasonalSettingsForm({ settings: initialSettings }: SeasonalSettingsFormProps) {
    const [settings, setSettings] = useState(initialSettings)
    const [isPending, startTransition] = useTransition()

    const handleSave = () => {
        startTransition(async () => {
            const result = await updateSeasonalSettings(settings)
            if (result.success) {
                toast.success("Settings saved successfully")
            } else {
                toast.error("Failed to save settings")
            }
        })
    }

    const handleChange = (key: keyof SeasonalSettingsConfig, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }))
    }

    return (
        <div className="space-y-6">
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Snowflake className="h-5 w-5 text-blue-400" />
                        Seasonal Configuration
                    </CardTitle>
                    <CardDescription>
                        Control the seasonal effects displayed across the site.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Effect Mode</Label>
                            <Select
                                value={settings.mode}
                                onValueChange={(val: SeasonalMode) => handleChange("mode", val)}
                            >
                                <SelectTrigger className="w-[180px] bg-white/5 border-white/10">
                                    <SelectValue placeholder="Select mode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="auto">Auto (Date-based)</SelectItem>
                                    <SelectItem value="winter">Winter (Snow)</SelectItem>
                                    <SelectItem value="autumn">Autumn (Leaves)</SelectItem>
                                    <SelectItem value="none">None</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between">
                            <Label>Enable Effects</Label>
                            <Switch
                                checked={settings.enabled}
                                onCheckedChange={(val) => handleChange("enabled", val)}
                            />
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/10">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="flex items-center gap-2">
                                    <Snowflake className="h-4 w-4 text-blue-400" />
                                    Snow Density
                                </Label>
                                <span className="text-sm text-muted-foreground">{settings.snowDensity}%</span>
                            </div>
                            <Slider
                                value={[settings.snowDensity]}
                                min={1}
                                max={100}
                                step={1}
                                onValueChange={(val) => handleChange("snowDensity", val[0])}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="flex items-center gap-2">
                                    <Leaf className="h-4 w-4 text-orange-400" />
                                    Leaves Density
                                </Label>
                                <span className="text-sm text-muted-foreground">{settings.leavesDensity}%</span>
                            </div>
                            <Slider
                                value={[settings.leavesDensity]}
                                min={1}
                                max={100}
                                step={1}
                                onValueChange={(val) => handleChange("leavesDensity", val[0])}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Music className="h-5 w-5 text-purple-400" />
                        Audio Settings
                    </CardTitle>
                    <CardDescription>
                        Configure seasonal background music and sound effects.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <Label>Enable Music</Label>
                        <Switch
                            checked={settings.musicEnabled}
                            onCheckedChange={(val) => handleChange("musicEnabled", val)}
                        />
                    </div>

                    {settings.musicEnabled && (
                        <>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-blue-400" />
                                        Duration (seconds)
                                    </Label>
                                    <span className="text-sm text-muted-foreground">{settings.musicDuration}s</span>
                                </div>
                                <Slider
                                    value={[settings.musicDuration]}
                                    min={5}
                                    max={300}
                                    step={5}
                                    onValueChange={(val) => handleChange("musicDuration", val[0])}
                                />
                                <p className="text-xs text-muted-foreground">
                                    How long the music plays before stopping (or fading out).
                                </p>
                            </div>

                            <div className="flex items-center justify-between">
                                < Label className="flex items-center gap-2" >
                                    <Activity className="h-4 w-4 text-pink-400" />
                                    Fade Out Effect
                                </Label>
                                <Switch
                                    checked={settings.musicFadeOut}
                                    onCheckedChange={(val) => handleChange("musicFadeOut", val)}
                                />
                            </div>
                        </>
                    )}


                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="flex items-center gap-2">
                                <Volume2 className="h-4 w-4" />
                                Default Volume Limit
                            </Label>
                            <span className="text-sm text-muted-foreground">{settings.audioVolume}%</span>
                        </div>
                        <Slider
                            value={[settings.audioVolume]}
                            min={0}
                            max={100}
                            step={1}
                            onValueChange={(val) => handleChange("audioVolume", val[0])}
                        />
                        <p className="text-xs text-muted-foreground">
                            Limits the maximum volume users experience. Users can still lower it further in their local settings.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={isPending}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>
        </div >
    )
}
