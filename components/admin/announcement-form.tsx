"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Megaphone, Trash2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { broadcastAnnouncement, clearAnnouncement } from "@/actions/announcements"

export function AnnouncementForm() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    // Simple state form
    const [text, setText] = useState("")
    const [imageUrl, setImageUrl] = useState("")
    const [sound, setSound] = useState<'notification' | 'alert' | 'none'>('notification')

    const handleBroadcast = () => {
        if (!text) {
            toast.error("Message text is required")
            return
        }

        startTransition(async () => {
            const result = await broadcastAnnouncement({
                text,
                imageUrl,
                soundType: sound
            })
            if (result.success) {
                toast.success("Announcement broadcasted successfully!")
                router.refresh()
            } else {
                toast.error("Failed to broadcast")
            }
        })
    }

    const handleClear = () => {
        startTransition(async () => {
            const result = await clearAnnouncement()
            if (result.success) {
                toast.success("Active announcement cleared")
                router.refresh()
            } else {
                toast.error("Failed to clear")
            }
        })
    }

    return (
        <Card className="border-cyan-500/20 bg-black/40 backdrop-blur-xl mt-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyan-100">
                    <Megaphone className="h-5 w-5 text-purple-500" />
                    Global Announcement
                </CardTitle>
                <CardDescription>Send a live pop-up message to all active users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-zinc-200">Message</Label>
                    <Textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Types something exciting..."
                        className="bg-zinc-900/50 border-zinc-800 min-h-[100px]"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-zinc-200">Image URL (Optional)</Label>
                        <Input
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://..."
                            className="bg-zinc-900/50 border-zinc-800"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-zinc-200">Sound Effect</Label>
                        <Select value={sound} onValueChange={(v: any) => setSound(v)}>
                            <SelectTrigger className="bg-zinc-900/50 border-zinc-800">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="notification">Notification (Ding)</SelectItem>
                                <SelectItem value="alert">Alert (Siren)</SelectItem>
                                <SelectItem value="none">Silent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="pt-4 flex gap-3">
                    <Button
                        onClick={handleBroadcast}
                        disabled={isPending}
                        className="flex-1 bg-purple-600 hover:bg-purple-500"
                    >
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Broadcast Now
                    </Button>
                    <Button
                        onClick={handleClear}
                        disabled={isPending}
                        variant="outline"
                        className="border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear Active
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
