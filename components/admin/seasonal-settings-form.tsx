"use client"

import { useState } from "react"
import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { NeonSlider } from "@/components/ui/neon-slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save, Snowflake, Leaf, Music, Volume2, Clock, Activity, Wand2, Sparkles, ShoppingBag } from "lucide-react"
import { showTerminalToast } from "@/components/global/terminal-toast"
import { updateSeasonalSettings, SeasonalSettingsConfig, SeasonalMode } from "@/actions/seasonal-settings"
import { cn } from "@/lib/utils"

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
                showTerminalToast.success("Settings saved successfully")
            } else {
                showTerminalToast.error("Failed to save settings")
            }
        })
    }

    const handleChange = (key: keyof SeasonalSettingsConfig, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }))
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Visual Configuration */}
                <Card className="bg-black/40 border-white/5 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <CardHeader className="relative z-10">
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                                <Snowflake className="h-5 w-5 text-blue-400" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-blue-100 font-orbitron tracking-wide">Seasonal Effects</span>
                                <span className="text-xs text-blue-400/50 font-sans font-normal uppercase tracking-wider">Visual Ambience</span>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8 relative z-10">
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4 transition-colors hover:bg-white-[0.07]">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label className="text-base text-zinc-200">Effect Mode</Label>
                                        <p className="text-xs text-zinc-500">Choose the active seasonal theme</p>
                                    </div>
                                    <Select
                                        value={settings.mode}
                                        onValueChange={(val: SeasonalMode) => handleChange("mode", val)}
                                    >
                                        <SelectTrigger className="w-[180px] bg-black/40 border-white/10 text-zinc-300 focus:ring-blue-500/50">
                                            <SelectValue placeholder="Select mode" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#0a0a0a] border-zinc-800">
                                            <SelectItem value="auto">
                                                <div className="flex items-center gap-2">
                                                    <Sparkles className="h-3 w-3 text-amber-400" />
                                                    <span>Auto (Date-based)</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="winter">
                                                <div className="flex items-center gap-2">
                                                    <Snowflake className="h-3 w-3 text-cyan-400" />
                                                    <span>Winter (Snow)</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="autumn">
                                                <div className="flex items-center gap-2">
                                                    <Leaf className="h-3 w-3 text-orange-400" />
                                                    <span>Autumn (Leaves)</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="none">None</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                                    <div className="space-y-1">
                                        <Label className="text-base text-zinc-200">Enable Overlay</Label>
                                        <p className="text-xs text-zinc-500">Toggle all visual particle effects</p>
                                    </div>
                                    <Switch
                                        checked={settings.enabled}
                                        onCheckedChange={(val) => handleChange("enabled", val)}
                                        className="data-[state=checked]:bg-blue-600"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="flex items-center gap-2 text-zinc-300">
                                        <Snowflake className="h-4 w-4 text-cyan-400" />
                                        Snow Density
                                    </Label>
                                    <span className="font-mono text-xs text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20">{settings.snowDensity}%</span>
                                </div>
                                <NeonSlider
                                    value={[settings.snowDensity || 50]}
                                    min={1}
                                    max={100}
                                    step={1}
                                    onValueChange={(val) => handleChange("snowDensity", val[0])}
                                    className="data-[range=true]:bg-cyan-500 text-cyan-500"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="flex items-center gap-2 text-zinc-300">
                                        <Leaf className="h-4 w-4 text-orange-400" />
                                        Leaves Density
                                    </Label>
                                    <span className="font-mono text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20">{settings.leavesDensity}%</span>
                                </div>
                                <NeonSlider
                                    value={[settings.leavesDensity || 30]}
                                    min={1}
                                    max={100}
                                    step={1}
                                    onValueChange={(val) => handleChange("leavesDensity", val[0])}
                                    className="text-orange-500"
                                />
                            </div>
                        </div>
                    </CardContent>

                    {/* Decorative blurred blob */}
                    <div className="absolute -top-20 -right-20 h-40 w-40 bg-blue-500/20 rounded-full blur-[50px] pointer-events-none" />
                </Card>

                {/* Audio Configuration */}
                <Card className="bg-black/40 border-white/5 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <CardHeader className="relative z-10">
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                                <Music className="h-5 w-5 text-purple-400" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-purple-100 font-orbitron tracking-wide">Audio Immersion</span>
                                <span className="text-xs text-purple-400/50 font-sans font-normal uppercase tracking-wider">Background Soundscape</span>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8 relative z-10">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4 transition-colors hover:bg-white-[0.07]">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label className="text-base text-zinc-200">Enable Music</Label>
                                    <p className="text-xs text-zinc-500">Play thematic background audio on entry</p>
                                </div>
                                <Switch
                                    checked={settings.musicEnabled}
                                    onCheckedChange={(val) => handleChange("musicEnabled", val)}
                                    className="data-[state=checked]:bg-purple-600"
                                />
                            </div>

                            <div className="flex items-center justify-between border-t border-white/5 pt-4">
                                <Label className="flex items-center gap-2 text-zinc-300">
                                    <Activity className="h-4 w-4 text-pink-400" />
                                    Smart Fade Out
                                </Label>
                                <Switch
                                    checked={settings.musicFadeOut}
                                    onCheckedChange={(val) => handleChange("musicFadeOut", val)}
                                    className="data-[state=checked]:bg-pink-600"
                                />
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4 transition-colors hover:bg-white-[0.07]">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label className="text-base text-zinc-200">Shop Ambience</Label>
                                    <p className="text-xs text-zinc-500">Play impact sound when entering the shop</p>
                                </div>
                                <Switch
                                    checked={settings.shopSoundEnabled}
                                    onCheckedChange={(val) => handleChange("shopSoundEnabled", val)}
                                    className="data-[state=checked]:bg-amber-600"
                                />
                            </div>

                            {settings.shopSoundEnabled && (
                                <div className="space-y-4 border-t border-white/5 pt-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="flex items-center gap-2 text-zinc-300">
                                            <ShoppingBag className="h-4 w-4 text-amber-400" />
                                            Shop Impact Volume
                                        </Label>
                                        <span className="font-mono text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">{settings.shopSoundVolume}%</span>
                                    </div>
                                    <NeonSlider
                                        value={[settings.shopSoundVolume || 40]}
                                        min={0}
                                        max={100}
                                        step={1}
                                        onValueChange={(val) => handleChange("shopSoundVolume", val[0])}
                                        className="text-amber-500"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="flex items-center gap-2 text-zinc-300">
                                        <Clock className="h-4 w-4 text-purple-400" />
                                        Duration
                                    </Label>
                                    <span className="font-mono text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20">{settings.musicDuration}s</span>
                                </div>
                                <NeonSlider
                                    value={[settings.musicDuration || 15]}
                                    min={5}
                                    max={300}
                                    step={5}
                                    onValueChange={(val) => handleChange("musicDuration", val[0])}
                                    className="text-purple-500"
                                />
                                <p className="text-[10px] text-zinc-500 text-right">
                                    Music will auto-stop after this time
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="flex items-center gap-2 text-zinc-300">
                                        <Volume2 className="h-4 w-4 text-emerald-400" />
                                        Max Volume Limit
                                    </Label>
                                    <span className="font-mono text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">{settings.audioVolume}%</span>
                                </div>
                                <NeonSlider
                                    value={[settings.audioVolume || 20]}
                                    min={0}
                                    max={100}
                                    step={1}
                                    onValueChange={(val) => handleChange("audioVolume", val[0])}
                                    className="text-emerald-500"
                                />
                            </div>
                        </div>
                    </CardContent>

                    {/* Decorative blurred blob */}
                    <div className="absolute -bottom-20 -left-20 h-40 w-40 bg-purple-500/20 rounded-full blur-[50px] pointer-events-none" />
                </Card>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/5">
                <Button
                    onClick={handleSave}
                    disabled={isPending}
                    className="h-12 px-8 bg-[#0a0a0a] border border-white/10 hover:bg-neutral-900 text-white shadow-lg transition-all hover:scale-105 active:scale-95 rounded-xl group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Save className="mr-2 h-5 w-5 text-green-500 group-hover:text-green-400 group-hover:drop-shadow-[0_0_8px_rgba(74,222,128,0.8)] transition-all" />
                    <span className="font-orbitron font-bold tracking-wider text-green-500 group-hover:text-green-400 group-hover:drop-shadow-[0_0_8px_rgba(74,222,128,0.6)] transition-all">
                        {isPending ? "SAVING..." : "SAVE CONFIGURATION"}
                    </span>
                </Button>
            </div>
        </div>
    )
}
