"use client"

import { useState, useEffect } from "react"
import { type SponsoredMessageData, deleteSponsoredMessage } from "@/actions/sponsored"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Plus, Megaphone, ExternalLink, RefreshCw } from "lucide-react"
import { SponsoredMessageForm } from "./sponsored-message-form"
import { useRouter } from "next/navigation"

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
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold font-orbitron text-emerald-500 flex items-center gap-2">
                        <Megaphone className="h-6 w-6" />
                        Sponsored Messages
                    </h2>
                    <p className="text-zinc-400 text-sm mt-1">Manage automated announcements in the live chat.</p>
                </div>
                <Button
                    onClick={handleCreate}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    New Message
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {messages.map((msg) => (
                    <Card key={msg.id} className="bg-zinc-900/50 border-zinc-800 hover:border-emerald-500/30 transition-all overflow-hidden group relative">
                        {/* Preview "Live" Badge */}
                        <div className="absolute top-2 right-2">
                            <Badge variant={msg.isActive ? "default" : "secondary"} className={msg.isActive ? "bg-emerald-500 text-white" : "bg-zinc-800 text-zinc-500"}>
                                {msg.isActive ? "Active" : "Inactive"}
                            </Badge>
                        </div>

                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-bold text-zinc-100 flex items-center gap-2 pr-12">
                                {msg.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-zinc-400 line-clamp-3 min-h-[60px]">
                                {msg.description}
                            </p>

                            {/* Preview specific fields */}
                            <div className="flex flex-col gap-2 mt-2">
                                <div className="text-xs space-y-1 text-zinc-500">
                                    <div className="flex items-center gap-2 truncate">
                                        <ExternalLink className="h-3 w-3" />
                                        {msg.linkUrl ? <span className="text-blue-400">{msg.linkUrl}</span> : "No link"}
                                    </div>
                                    <div className="flex items-center gap-2 truncate">
                                        <RefreshCw className="h-3 w-3" />
                                        <span className="text-emerald-500 font-mono">Run Frequency: Every {msg.frequency}m</span>
                                    </div>
                                </div>
                                {/* Simulated Timer Badge */}
                                <div className="bg-zinc-950/50 rounded-md p-2 border border-white/5 flex items-center justify-between">
                                    <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Timer</span>
                                    <span className="text-xs font-mono text-emerald-400 animate-pulse">
                                        {msg.frequency}:00
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-0 flex justify-end gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-zinc-400 hover:text-white"
                                onClick={() => handleEdit(msg)}
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                onClick={() => handleDelete(msg.id)}
                                disabled={isDeleting === msg.id}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
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
