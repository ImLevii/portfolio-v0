"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2, Save, MessageSquare, Pin, Power, Type, Trash2 } from "lucide-react"

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
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { toast } from "sonner"
import { updateChatSettings, type ChatSettingsConfig } from "@/actions/chat-settings"
import { clearChat } from "@/actions/chat"
import { AlertCircle } from "lucide-react"

const formSchema = z.object({
    enabled: z.boolean(),
})

interface ChatSettingsFormProps {
    initialConfig: ChatSettingsConfig
}

export function ChatSettingsForm({ initialConfig }: ChatSettingsFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            enabled: initialConfig.enabled,
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(async () => {
            try {
                const result = await updateChatSettings(values as ChatSettingsConfig)
                if (result.success) {
                    toast.success("Chat settings updated successfully")
                    router.refresh()
                } else {
                    toast.error("Failed to update settings")
                }
            } catch (error) {
                toast.error("Something went wrong")
            }
        })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-5xl mx-auto">
                <div className="grid gap-8 md:grid-cols-2">
                    {/* General Settings */}
                    <Card className="border-cyan-500/20 bg-black/40 backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.05)] relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        <CardHeader className="relative z-10 pb-2">
                            <CardTitle className="flex items-center gap-3 text-xl">
                                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                                    <Power className="h-5 w-5 text-cyan-400" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-cyan-100 font-orbitron tracking-wide">Global Control</span>
                                    <span className="text-xs text-cyan-400/50 font-sans font-normal uppercase tracking-wider">Widget Visibility</span>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 relative z-10">
                            <FormField
                                control={form.control}
                                name="enabled"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-xl border border-cyan-500/10 p-5 bg-cyan-500/5 transition-all hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                                        <div className="space-y-1">
                                            <FormLabel className="text-base font-medium text-cyan-100">Live Chat System</FormLabel>
                                            <FormDescription className="text-cyan-400/60">
                                                Toggle this to instantly show/hide the chat widget for all visitors.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="data-[state=checked]:bg-cyan-500 data-[state=checked]:shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-red-500/20 bg-black/40 backdrop-blur-xl shadow-[0_0_30px_rgba(239,68,68,0.05)] relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        <CardHeader className="relative z-10 pb-2">
                            <CardTitle className="flex items-center gap-3 text-xl">
                                <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-red-100 font-orbitron tracking-wide">Danger Zone</span>
                                    <span className="text-xs text-red-500/50 font-sans font-normal uppercase tracking-wider">Irreversible Actions</span>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="flex items-center justify-between rounded-xl border border-red-500/20 p-5 bg-gradient-to-r from-red-950/30 to-red-900/10 transition-all hover:border-red-500/40">
                                <div className="space-y-1">
                                    <span className="text-base font-bold text-red-400 flex items-center gap-2">
                                        Clear Global Chat
                                    </span>
                                    <p className="text-xs text-red-400/60 max-w-[200px] md:max-w-none">
                                        Deletes all public messages. Support tickets are preserved.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    onClick={handleClearChat}
                                    className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all font-bold tracking-wide"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Clear History
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end pt-4 border-t border-white/5">
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="h-12 px-8 bg-[#0a0a0a] border border-white/10 hover:bg-neutral-900 text-white shadow-lg transition-all hover:scale-105 active:scale-95 rounded-xl group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin text-cyan-500" />
                                <span className="font-orbitron font-bold tracking-wider text-cyan-500">SAVING...</span>
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-5 w-5 text-cyan-500 group-hover:text-cyan-400 group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-all" />
                                <span className="font-orbitron font-bold tracking-wider text-cyan-500 group-hover:text-cyan-400 group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.6)] transition-all">
                                    SAVE CONFIGURATION
                                </span>
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
