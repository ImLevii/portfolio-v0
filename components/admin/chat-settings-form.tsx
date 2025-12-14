"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2, Save, MessageSquare, Pin, Power, Type } from "lucide-react"

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
import { clearGlobalChat } from "@/actions/chat"
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    {/* General Settings */}
                    <Card className="border-cyan-500/20 bg-black/40 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-cyan-100">
                                <Power className="h-5 w-5 text-cyan-500" />
                                General Control
                            </CardTitle>
                            <CardDescription>Enable or disable the chat widget globally</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="enabled"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-cyan-500/10 p-4 shadow-sm transition-all hover:bg-cyan-500/5">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base text-cyan-100">Enable Live Chat</FormLabel>
                                            <FormDescription>
                                                Toggle the visibility of the widget for all users
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="data-[state=checked]:bg-cyan-500"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                </div>

                {/* Danger Zone */}
                <Card className="border-red-500/20 bg-black/40 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-500">
                            <AlertCircle className="h-5 w-5" />
                            Danger Zone
                        </CardTitle>
                        <CardDescription>Irreversible actions for chat management</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between rounded-lg border border-red-500/10 p-4 bg-red-500/5">
                            <div className="space-y-0.5">
                                <span className="text-base font-bold text-red-400">Clear Global Chat</span>
                                <p className="text-sm text-red-400/60">
                                    Permanently delete all public messages. Active tickets are preserved.
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={async () => {
                                    if (confirm("Are you sure? This will delete ALL public chat history for everyone. This cannot be undone.")) {
                                        const res = await clearGlobalChat();
                                        if (res.success) {
                                            toast.success("Global chat cleared successfully");
                                        } else {
                                            toast.error("Failed to clear chat");
                                        }
                                    }
                                }}
                                className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20"
                            >
                                Clear Chat History
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 md:w-auto"
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
            </form>
        </Form>
    )
}
