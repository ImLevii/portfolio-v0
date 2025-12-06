"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, Save, Snowflake, Leaf, Music, Volume2, Monitor } from "lucide-react"

import { updateSeasonalSettings, type SeasonalSettings } from "@/actions/seasonal-settings"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const seasonalSettingsSchema = z.object({
    mode: z.enum(["auto", "winter", "autumn", "none"]),
    snowDensity: z.number().min(0).max(100),
    leavesDensity: z.number().min(0).max(100),
    enableAudio: z.boolean(),
    musicVolume: z.number().min(0).max(100),
    soundEffectsVolume: z.number().min(0).max(100),
})

type SeasonalSettingsFormValues = z.infer<typeof seasonalSettingsSchema>

interface SeasonalSettingsFormProps {
    initialSettings: SeasonalSettings
}

export function SeasonalSettingsForm({ initialSettings }: SeasonalSettingsFormProps) {
    const [isPending, startTransition] = useTransition()

    const form = useForm<SeasonalSettingsFormValues>({
        resolver: zodResolver(seasonalSettingsSchema),
        defaultValues: initialSettings,
    })

    function onSubmit(data: SeasonalSettingsFormValues) {
        startTransition(async () => {
            const result = await updateSeasonalSettings(data)
            if (result.success) {
                toast.success("Seasonal settings updated successfully")
            } else {
                toast.error("Failed to update settings")
            }
        })
    }

    const currentMode = form.watch("mode")

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Seasonal Configuration</h2>
                        <p className="text-muted-foreground">Manage global visual and audio effects.</p>
                    </div>
                    <Button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700">
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Visual Effects Section */}
                    <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Monitor className="h-5 w-5 text-blue-400" />
                                Visual Effects
                            </CardTitle>
                            <CardDescription>Control snow and leaves animations.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="mode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Season Mode</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-white/5 border-white/10">
                                                    <SelectValue placeholder="Select a mode" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="auto">Auto (Date Based)</SelectItem>
                                                <SelectItem value="winter">Winter (Snow)</SelectItem>
                                                <SelectItem value="autumn">Autumn (Leaves)</SelectItem>
                                                <SelectItem value="none">Disabled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            "Auto" uses the current month to decide effects.
                                        </FormDescription>
                                    </FormItem>
                                )}
                            />

                            <Separator className="bg-white/10" />

                            <div className={currentMode === "autumn" || currentMode === "none" ? "opacity-50 pointer-events-none transition-opacity" : "transition-opacity"}>
                                <FormField
                                    control={form.control}
                                    name="snowDensity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <FormLabel className="flex items-center gap-2">
                                                    <Snowflake className="h-4 w-4 text-blue-300" /> Snow Density
                                                </FormLabel>
                                                <span className="text-sm font-mono text-muted-foreground">{field.value}%</span>
                                            </div>
                                            <FormControl>
                                                <Slider
                                                    min={0}
                                                    max={100}
                                                    step={1}
                                                    defaultValue={[field.value]}
                                                    onValueChange={(vals) => field.onChange(vals[0])}
                                                    className="py-4"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className={currentMode === "winter" || currentMode === "none" ? "opacity-50 pointer-events-none transition-opacity" : "transition-opacity"}>
                                <FormField
                                    control={form.control}
                                    name="leavesDensity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <FormLabel className="flex items-center gap-2">
                                                    <Leaf className="h-4 w-4 text-amber-500" /> Leaves Density
                                                </FormLabel>
                                                <span className="text-sm font-mono text-muted-foreground">{field.value}%</span>
                                            </div>
                                            <FormControl>
                                                <Slider
                                                    min={0}
                                                    max={100}
                                                    step={1}
                                                    defaultValue={[field.value]}
                                                    onValueChange={(vals) => field.onChange(vals[0])}
                                                    className="py-4"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Audio Effects Section */}
                    <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Music className="h-5 w-5 text-purple-400" />
                                Audio Settings
                            </CardTitle>
                            <CardDescription>Manage seasonal soundtrack and sound effects.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="enableAudio"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/5 p-4 shadow-sm bg-white/5">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Enable Audio</FormLabel>
                                            <FormDescription>
                                                Master switch for all seasonal audio.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <div className={!form.watch("enableAudio") ? "opacity-50 pointer-events-none transition-opacity space-y-6" : "transition-opacity space-y-6"}>
                                <FormField
                                    control={form.control}
                                    name="musicVolume"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <FormLabel className="flex items-center gap-2">
                                                    <Music className="h-4 w-4" /> Music Volume
                                                </FormLabel>
                                                <span className="text-sm font-mono text-muted-foreground">{field.value}%</span>
                                            </div>
                                            <FormControl>
                                                <Slider
                                                    min={0}
                                                    max={100}
                                                    step={1}
                                                    defaultValue={[field.value]}
                                                    onValueChange={(vals) => field.onChange(vals[0])}
                                                    className="py-4"
                                                />
                                            </FormControl>
                                            <FormDescription>Volume for background melodies (e.g. Christmas tune).</FormDescription>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="soundEffectsVolume"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <FormLabel className="flex items-center gap-2">
                                                    <Volume2 className="h-4 w-4" /> Sound Effects Volume
                                                </FormLabel>
                                                <span className="text-sm font-mono text-muted-foreground">{field.value}%</span>
                                            </div>
                                            <FormControl>
                                                <Slider
                                                    min={0}
                                                    max={100}
                                                    step={1}
                                                    defaultValue={[field.value]}
                                                    onValueChange={(vals) => field.onChange(vals[0])}
                                                    className="py-4"
                                                />
                                            </FormControl>
                                            <FormDescription>Volume for impacts and other SFX.</FormDescription>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </Form>
    )
}
