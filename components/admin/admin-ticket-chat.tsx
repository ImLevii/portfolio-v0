"use client"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, User as UserIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { sendMessage } from "@/actions/chat"
import { useRouter } from "next/navigation"

export function AdminTicketChat({ ticket: initialTicket }: { ticket: any }) {
    const [messages, setMessages] = useState<any[]>(initialTicket.messages || [])
    const [input, setInput] = useState("")
    const scrollRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const [isSending, setIsSending] = useState(false)
    const lastMessageIdRef = useRef<string | null>(null)

    // Scroll to bottom helper
    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior })
        }
    }

    // Initial scroll
    useEffect(() => {
        scrollToBottom("auto")
    }, [])

    // Scroll on new messages
    useEffect(() => {
        const lastMsg = messages[messages.length - 1]
        if (lastMsg?.id !== lastMessageIdRef.current) {
            scrollToBottom()
            lastMessageIdRef.current = lastMsg?.id
        }
    }, [messages])

    // Polling Logic
    useEffect(() => {
        const pollInterval = setInterval(async () => {
            // Re-fetch ticket data to get new messages
            // We use the imported server action. Note: ensure getTicket is importable/usable here.
            // If getTicket is server-only and not exposed to client bundles effectively, we might need a wrapper.
            // But usually server actions can be imported. 
            // If `getTicket` in actions/tickets.ts is "use server", it's fine.
            try {
                const { getTicket } = await import("@/actions/tickets")
                const updatedTicket = await getTicket(initialTicket.id)

                if (updatedTicket) {
                    // Update messages if changed
                    setMessages(prev => {
                        const newMsgs = updatedTicket.messages
                        if (JSON.stringify(newMsgs) !== JSON.stringify(prev)) {
                            return newMsgs
                        }
                        return prev
                    })
                }
            } catch (error) {
                console.error("Polling error:", error)
            }
        }, 3000)

        return () => clearInterval(pollInterval)
    }, [initialTicket.id])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isSending) return

        const tempId = `temp-${Date.now()}`
        const optimisticMsg = {
            id: tempId,
            text: input,
            senderName: "Admin", // Fallback, real name comes from DB
            senderRole: "ADMIN",
            createdAt: new Date(),
            senderAvatar: null,
            reactions: JSON.stringify({ likes: 0, dislikes: 0, hearts: 0 })
        }

        setIsSending(true)
        // Optimistic Update
        setMessages(prev => [...prev, optimisticMsg])
        setInput("")

        // Immediate scroll
        setTimeout(() => scrollToBottom(), 10)

        try {
            await sendMessage(optimisticMsg.text, initialTicket.id)
            // Fetch immediately to replace optimistic with real
            const { getTicket } = await import("@/actions/tickets")
            const updatedTicket = await getTicket(initialTicket.id)
            if (updatedTicket) {
                setMessages(updatedTicket.messages)
            }
            router.refresh() // Syncs server components (like header status)
        } catch (error) {
            console.error("Failed to send", error)
            // Revert on failure (simple remove)
            setMessages(prev => prev.filter(m => m.id !== tempId))
            alert("Failed to send message")
        } finally {
            setIsSending(false)
        }
    }

    const { status } = initialTicket // We might want to poll status too, but messages are priority.

    return (
        <>
            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* System Start Message */}
                <div className="flex justify-center">
                    <div className="bg-zinc-800/50 text-zinc-500 text-[10px] px-3 py-0.5 rounded-full border border-white/5">
                        Ticket Created on {new Date(initialTicket.createdAt).toLocaleDateString()}
                    </div>
                </div>

                {messages.map((msg: any) => {
                    const isAdmin = msg.senderRole === 'ADMIN' || msg.senderRole === 'Admin'

                    return (
                        <div key={msg.id} className={cn("flex gap-3 max-w-[85%]", isAdmin ? "ml-auto flex-row-reverse" : "")}>
                            <Avatar className={cn("h-7 w-7 border", isAdmin ? "border-emerald-500/50" : "border-zinc-700")}>
                                <AvatarImage src={msg.senderAvatar} />
                                <AvatarFallback className={cn("text-[10px]", isAdmin ? "bg-emerald-950 text-emerald-400" : "bg-zinc-800 text-zinc-400")}>
                                    {msg.senderName?.slice(0, 2).toUpperCase() || "AD"}
                                </AvatarFallback>
                            </Avatar>

                            <div className={cn("flex flex-col gap-0.5", isAdmin ? "items-end" : "items-start")}>
                                <div className="flex items-baseline gap-2">
                                    <span className={cn("text-[11px] font-bold", isAdmin ? "text-emerald-400" : "text-zinc-300")}>
                                        {msg.senderName}
                                    </span>
                                    <span className="text-[9px] text-zinc-600">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className={cn("px-3.5 py-2 rounded-2xl text-sm shadow-sm",
                                    isAdmin
                                        ? "bg-emerald-600/20 border border-emerald-500/20 text-emerald-50 rounded-tr-none"
                                        : "bg-zinc-800/80 border border-white/5 text-zinc-200 rounded-tl-none"
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
                        placeholder={status === 'CLOSED' ? "Ticket is closed" : "Reply as Admin..."}
                        disabled={status === 'CLOSED' || isSending}
                        className="bg-black/40 border-white/10 focus-visible:ring-emerald-500/50"
                    />
                    <Button
                        type="submit"
                        disabled={status === 'CLOSED' || isSending}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </>
    )
}
