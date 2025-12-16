"use client"

import { useState, useEffect } from "react"
import { type SponsoredMessageData, deleteSponsoredMessage } from "@/actions/sponsored"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Plus, Megaphone, ExternalLink, RefreshCw } from "lucide-react"
import { SponsoredMessageForm } from "./sponsored-message-form"
import { useRouter } from "next/navigation"
import { LiveTimer } from "./live-timer"

interface SponsoredMessageListProps {
    initialMessages: SponsoredMessageData[]
}


export function SponsoredMessageList({ initialMessages }: SponsoredMessageListProps) {
    const router = useRouter()
    const [messages, setMessages] = useState(initialMessages)

    useEffect(() => {
        setMessages(initialMessages)
    }, [initialMessages])

    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingMessage, setEditingMessage] = useState<SponsoredMessageData | null>(null)
    const [isDeleting, setIsDeleting] = useState<string | null>(null)

    const handleCreate = () => {
        setEditingMessage(null)
        setIsFormOpen(true)
    }

    const handleEdit = (msg: SponsoredMessageData) => {
        setEditingMessage(msg)
        setIsFormOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this message?")) return

        setIsDeleting(id)
        const res = await deleteSponsoredMessage(id)

        if (res.success) {
            setMessages(prev => prev.filter(m => m.id !== id))
            router.refresh()
        } else {
            alert("Failed to delete message")
        }
        setIsDeleting(null)
    }

    const handleFormSuccess = () => {
        router.refresh()
        // Ideally we fetch the new list, or rely on router.refresh() (server components)
        // Since we are in client, we can't easily auto-update without re-fetching or passing updated data.
        // For now, let's rely on router.refresh(). 
        // A better UX would be to optimistically add to the list, but let's keep it simple.
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between p-6 glass-panel rounded-2xl border border-gray-800/60 bg-black/40">
                <div>
                    <h2 className="text-2xl font-bold font-orbitron text-white flex items-center gap-2">
                        <Megaphone className="h-6 w-6 text-emerald-500" />
                        Sponsored Messages
                    </h2>
                    <p className="text-zinc-400 text-sm mt-1">Manage automated announcements in the live chat.</p>
                </div>
                <Button
                    onClick={handleCreate}
                    className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all active:scale-[0.98] font-bold"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    New Message
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {messages.map((msg) => (
                    <div key={msg.id} className="glass-panel rounded-2xl border border-gray-800/60 bg-gray-900/30 overflow-hidden hover:border-emerald-500/50 transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] group relative flex flex-col h-full">
                        {/* Preview "Live" Badge */}
                        <div className="absolute top-3 right-3 z-10">
                            <Badge variant={msg.isActive ? "default" : "secondary"} className={`${msg.isActive ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-zinc-800 text-zinc-500"} backdrop-blur-sm border`}>
                                {msg.isActive ? "Active" : "Inactive"}
                            </Badge>
                        </div>

                        <div className="p-5 pb-0 flex-1">
                            <h3 className="text-lg font-bold text-white font-orbitron pr-16 mb-3 line-clamp-1">
                                {msg.title}
                            </h3>

                            <p className="text-sm text-gray-400 line-clamp-3 min-h-[60px] leading-relaxed">
                                {msg.description}
                            </p>

                            {/* Preview specific fields */}
                            <div className="flex flex-col gap-3 mt-4 p-3 rounded-xl bg-black/40 border border-white/5">
                                <div className="text-xs space-y-2 text-zinc-400">
                                    <div className="flex items-center gap-2 truncate">
                                        <ExternalLink className="h-3 w-3 text-emerald-500" />
                                        {msg.linkUrl ? <span className="text-blue-400 hover:underline">{msg.linkUrl}</span> : <span className="text-zinc-600">No link</span>}
                                    </div>
                                    <div className="flex items-center gap-2 truncate">
                                        <RefreshCw className="h-3 w-3 text-emerald-500" />
                                        <span className="text-emerald-400 font-mono">Run Frequency: Every {msg.frequency}m</span>
                                    </div>
                                </div>
                                {/* Live Timer Badge */}
                                <div className="">
                                    <LiveTimer frequency={msg.frequency} />
                                </div>
                            </div>
                        </div>
                        <div className="p-4 pt-4 flex justify-end gap-2 border-t border-white/5 mt-4 bg-black/20">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                onClick={() => handleEdit(msg)}
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                onClick={() => handleDelete(msg.id)}
                                disabled={isDeleting === msg.id}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {messages.length === 0 && (
                <div className="text-center py-20 bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-800">
                    <Megaphone className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-zinc-500">No sponsored messages yet</h3>
                    <p className="text-zinc-600 mt-2">Create one to start broadcasting announcements.</p>
                </div>
            )}

            <SponsoredMessageForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                initialData={editingMessage}
                onSuccess={handleFormSuccess}
            />
        </div>
    )
}
