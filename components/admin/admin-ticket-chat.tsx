"use client"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, User as UserIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { sendMessage } from "@/actions/chat"
import { useRouter } from "next/navigation"

export function AdminTicketChat({ ticket }: { ticket: any }) {
    const [input, setInput] = useState("")
    const scrollRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const [isSending, setIsSending] = useState(false)

    // Auto-scroll to bottom on mount
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [ticket.messages])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isSending) return

        setIsSending(true)
        try {
            await sendMessage(input, ticket.id)
            setInput("")
            router.refresh() // Refresh server component to get new messages
        } catch (error) {
            console.error("Failed to send", error)
        } finally {
            setIsSending(false)
        }
    }

    return (
        <>
            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* System Start Message */}
                <div className="flex justify-center">
                    <div className="bg-zinc-800/50 text-zinc-500 text-xs px-3 py-1 rounded-full border border-white/5">
                        Ticket Created on {new Date(ticket.createdAt).toLocaleDateString()}
                    </div>
                </div>

                {ticket.messages.map((msg: any) => {
                    const isAdmin = msg.senderRole === 'ADMIN' || msg.senderRole === 'Admin'

                    return (
                        <div key={msg.id} className={cn("flex gap-4 max-w-[80%]", isAdmin ? "ml-auto flex-row-reverse" : "")}>
                            <Avatar className={cn("h-8 w-8 border", isAdmin ? "border-emerald-500/50" : "border-zinc-700")}>
                                <AvatarImage src={msg.senderAvatar} />
                                <AvatarFallback className={cn("text-xs", isAdmin ? "bg-emerald-950 text-emerald-400" : "bg-zinc-800 text-zinc-400")}>
                                    {msg.senderName?.slice(0, 2).toUpperCase() || "US"}
                                </AvatarFallback>
                            </Avatar>

                            <div className={cn("flex flex-col gap-1", isAdmin ? "items-end" : "items-start")}>
                                <div className="flex items-baseline gap-2">
                                    <span className={cn("text-xs font-bold", isAdmin ? "text-emerald-400" : "text-zinc-300")}>
                                        {msg.senderName}
                                    </span>
                                    <span className="text-[10px] text-zinc-600">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className={cn("px-4 py-2.5 rounded-2xl text-sm shadow-sm",
                                    isAdmin
                                        ? "bg-emerald-600/20 border border-emerald-500/20 text-emerald-50 rounded-tr-sm"
                                        : "bg-zinc-800/80 border border-white/5 text-zinc-200 rounded-tl-sm"
                                )}>
                                    {msg.text}
                                </div>
                            </div>
                        </div>
                    )
                })}
                <div ref={scrollRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-zinc-900 border-t border-white/5">
                <form onSubmit={handleSend} className="relative flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={ticket.status === 'CLOSED' ? "Ticket is closed" : "Reply as Admin..."}
                        disabled={ticket.status === 'CLOSED' || isSending}
                        className="bg-black/40 border-white/10 focus-visible:ring-emerald-500/50"
                    />
                    <Button
                        type="submit"
                        disabled={ticket.status === 'CLOSED' || isSending}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </>
    )
}
