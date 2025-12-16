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
    const [title, setTitle] = useState("")
    const [text, setText] = useState("")
    const [imageUrl, setImageUrl] = useState("")
    const [linkUrl, setLinkUrl] = useState("")
    const [sound, setSound] = useState<'notification' | 'alert' | 'none'>('notification')
    const [color, setColor] = useState<'green' | 'blue' | 'red' | 'purple' | 'orange' | 'pink' | 'yellow' | 'teal'>('green')
    const [duration, setDuration] = useState<string>("10") // string for select, parsed to number

    const handleBroadcast = () => {
        if (!text) {
            toast.error("Message text is required")
            return
        }

        startTransition(async () => {
            const result = await broadcastAnnouncement({
                text,
                title,
                imageUrl,
                linkUrl,
                soundType: sound,
                color,
                duration: parseInt(duration) // 0 = permanent
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-zinc-200">Title (Optional)</Label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. MAINTENANCE ALERT"
                            className="bg-zinc-900/50 border-zinc-800 text-white font-bold"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-zinc-200">Duration</Label>
                        <Select value={duration} onValueChange={setDuration}>
                            <SelectTrigger className="bg-zinc-900/50 border-zinc-800 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                                <SelectItem value="5">5 Seconds</SelectItem>
                                <SelectItem value="10">10 Seconds (Default)</SelectItem>
                                <SelectItem value="30">30 Seconds</SelectItem>
                                <SelectItem value="60">1 Minute</SelectItem>
                                <SelectItem value="0" className="text-red-400 font-bold">Permanent (Until Cleared)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-zinc-200">Message</Label>
                    <Textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Types something exciting..."
                        className="bg-zinc-900/50 border-zinc-800 min-h-[80px] text-white"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-zinc-200">Link URL (Optional)</Label>
                    <Input
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://example.com/promo"
                        className="bg-zinc-900/50 border-zinc-800 text-white text-sm font-mono"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label className="text-zinc-200">Image URL (Optional)</Label>
                        <Input
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://..."
                            className="bg-zinc-900/50 border-zinc-800 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-zinc-200">Sound Effect</Label>
                        <Select value={sound} onValueChange={(v: any) => setSound(v)}>
                            <SelectTrigger className="bg-zinc-900/50 border-zinc-800 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                                <SelectItem value="notification">Notification (Ding)</SelectItem>
                                <SelectItem value="alert">Alert (Siren)</SelectItem>
                                <SelectItem value="none">Silent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-zinc-200">Theme Color</Label>
                        <Select value={color} onValueChange={(v: any) => setColor(v)}>
                            <SelectTrigger className="bg-zinc-900/50 border-zinc-800 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                                <SelectItem value="green" className="text-green-500 font-bold">Neon Green</SelectItem>
                                <SelectItem value="blue" className="text-cyan-500 font-bold">Cyber Blue</SelectItem>
                                <SelectItem value="purple" className="text-purple-500 font-bold">Royal Purple</SelectItem>
                                <SelectItem value="red" className="text-red-500 font-bold">Alert Red</SelectItem>
                                <SelectItem value="orange" className="text-orange-500 font-bold">Warning Orange</SelectItem>
                                <SelectItem value="pink" className="text-pink-500 font-bold">Hot Pink</SelectItem>
                                <SelectItem value="yellow" className="text-yellow-500 font-bold">Electric Yellow</SelectItem>
                                <SelectItem value="teal" className="text-teal-500 font-bold">Aqua Teal</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="pt-4 flex gap-3">
                    <Button
                        onClick={handleBroadcast}
                        disabled={isPending}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-0 shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] transition-all active:scale-[0.98]"
                    >
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Broadcast Now
                    </Button>
                    <Button
                        onClick={handleClear}
                        disabled={isPending}
                        variant="outline"
                        className="border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear Active
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
