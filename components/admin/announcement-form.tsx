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
import { showTerminalToast } from "@/components/global/terminal-toast"
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
            showTerminalToast.error("Message text is required")
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
                showTerminalToast.success("Announcement broadcasted successfully!")
                router.refresh()
            } else {
                showTerminalToast.error("Failed to broadcast")
            }
        })
    }

    const handleClear = () => {
        startTransition(async () => {
            const result = await clearAnnouncement()
            if (result.success) {
                showTerminalToast.success("Active announcement cleared")
                router.refresh()
            } else {
                showTerminalToast.error("Failed to clear")
            }
        })
    }

    return (
        <Card className="border-purple-500/20 bg-black/40 backdrop-blur-xl mt-8 shadow-[0_0_30px_rgba(168,85,247,0.05)] relative overflow-hidden group max-w-5xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <CardHeader className="relative z-10 pb-2">
                <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                        <Megaphone className="h-5 w-5 text-purple-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-purple-100 font-orbitron tracking-wide">Global Broadcast</span>
                        <span className="text-xs text-purple-400/50 font-sans font-normal uppercase tracking-wider">Live System Alerts</span>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-zinc-200 font-medium ml-1">Title (Optional)</Label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. MAINTENANCE ALERT"
                                className="bg-white/5 border-white/10 text-white font-bold h-11 focus-visible:border-purple-500/50 focus-visible:ring-0 rounded-xl transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-200 font-medium ml-1">Duration</Label>
                            <Select value={duration} onValueChange={setDuration}>
                                <SelectTrigger className="bg-white/5 border-white/10 text-white h-11 rounded-xl focus:ring-purple-500/50">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                                    <SelectItem value="5">5 Seconds</SelectItem>
                                    <SelectItem value="10">10 Seconds (Default)</SelectItem>
                                    <SelectItem value="30">30 Seconds</SelectItem>
                                    <SelectItem value="60">1 Minute</SelectItem>
                                    <SelectItem value="0" className="text-pink-400 font-bold">Permanent (Until Cleared)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-zinc-200 font-medium ml-1">Message Content</Label>
                        <Textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Type something exciting..."
                            className="bg-white/5 border-white/10 min-h-[116px] text-white resize-none rounded-xl focus-visible:border-purple-500/50 focus-visible:ring-0 transition-all text-base"
                        />
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                    <div className="space-y-2">
                        <Label className="text-zinc-300 font-medium text-xs uppercase tracking-wider ml-1">Action Link (Optional)</Label>
                        <Input
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="https://example.com/promo"
                            className="bg-black/20 border-white/10 text-blue-300 text-sm font-mono h-10 rounded-lg focus-visible:border-blue-500/50 focus-visible:ring-0"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label className="text-zinc-300 font-medium text-xs uppercase tracking-wider ml-1">Icon / Image URL</Label>
                            <Input
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="https://..."
                                className="bg-black/20 border-white/10 text-zinc-400 text-xs h-10 rounded-lg focus-visible:border-purple-500/50 focus-visible:ring-0"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-300 font-medium text-xs uppercase tracking-wider ml-1">Sound Effect</Label>
                            <Select value={sound} onValueChange={(v: any) => setSound(v)}>
                                <SelectTrigger className="bg-black/20 border-white/10 text-zinc-300 h-10 rounded-lg focus:ring-purple-500/50">
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
                            <Label className="text-zinc-300 font-medium text-xs uppercase tracking-wider ml-1">Theme Style</Label>
                            <Select value={color} onValueChange={(v: any) => setColor(v)}>
                                <SelectTrigger className="bg-black/20 border-white/10 text-zinc-300 h-10 rounded-lg focus:ring-purple-500/50">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-950 border-zinc-800 text-white max-h-[200px]">
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
                </div>

                <div className="pt-4 flex gap-4 border-t border-white/5">
                    <Button
                        onClick={handleBroadcast}
                        disabled={isPending}
                        className="flex-1 h-12 bg-[#0a0a0a] border border-white/10 hover:bg-neutral-900 text-white shadow-lg transition-all active:scale-[0.98] rounded-xl group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        {isPending ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin text-purple-500" />
                        ) : (
                            <Send className="mr-2 h-5 w-5 text-purple-500 group-hover:text-purple-400 group-hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] transition-all" />
                        )}
                        <span className="font-orbitron font-bold tracking-wider text-purple-500 group-hover:text-purple-400 group-hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.6)] transition-all">
                            BROADCAST ANNOUNCEMENT
                        </span>
                    </Button>
                    <Button
                        onClick={handleClear}
                        disabled={isPending}
                        variant="ghost"
                        className="h-12 px-6 bg-[#0a0a0a] border border-white/10 hover:bg-neutral-900 text-red-500 hover:text-red-400 hover:border-red-500/30 transition-all rounded-xl font-medium group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <Trash2 className="mr-2 h-4 w-4 group-hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                        <span className="font-orbitron font-bold tracking-wider group-hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]">
                            CLEAR ACTIVE
                        </span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
