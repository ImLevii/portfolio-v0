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
    systemMessageTitle: z.string().min(1, "Title is required"),
    systemMessageText: z.string().min(1, "Message text is required"),
    pinnedContentEnabled: z.boolean(),
    pinnedImageUrl: z.string().optional(),
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
            systemMessageTitle: initialConfig.systemMessageTitle,
            systemMessageText: initialConfig.systemMessageText,
            pinnedContentEnabled: initialConfig.pinnedContentEnabled,
            pinnedImageUrl: initialConfig.pinnedImageUrl || "",
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

                    {/* System Message Settings */}
                    <Card className="border-cyan-500/20 bg-black/40 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-cyan-100">
                                <MessageSquare className="h-5 w-5 text-amber-500" />
                                System Message
                            </CardTitle>
                            <CardDescription>Configure the welcome message for users</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="systemMessageTitle"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-zinc-200">Sender Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} className="border-zinc-800 bg-zinc-900/50" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="systemMessageText"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-zinc-200">Message Text</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                className="min-h-[100px] border-zinc-800 bg-zinc-900/50"
                                                placeholder="Welcome message..."
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Supports basic markdown like **bold** text
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Pinned Content Settings */}
                    <Card className="border-cyan-500/20 bg-black/40 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-cyan-100">
                                <Pin className="h-5 w-5 text-blue-500" />
                                Pinned Content
                            </CardTitle>
                            <CardDescription>Featured content at the top of the chat</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="pinnedContentEnabled"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-cyan-500/10 p-4 shadow-sm transition-all hover:bg-cyan-500/5">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base text-cyan-100">Show Pinned Content</FormLabel>
                                            <FormDescription>
                                                Display a featured image/product area
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="data-[state=checked]:bg-blue-500"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="pinnedImageUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-zinc-200">Image URL</FormLabel>
                                        <FormControl>
                                            <Input {...field} className="border-zinc-800 bg-zinc-900/50" placeholder="/placeholder-logo.png" />
                                        </FormControl>
                                        <FormMessage />
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
