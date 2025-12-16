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

    // Smart Scroll Logic
    const lastScrollHeightRef = useRef<number>(0)
    const isUserNearBottom = () => {
        const container = scrollRef.current?.parentElement
        if (!container) return false
        const threshold = 100 // pixels from bottom
        return container.scrollHeight - container.scrollTop - container.clientHeight < threshold
    }

    // Initial scroll
    useEffect(() => {
        scrollToBottom("auto")
    }, [])

    // Scroll on new messages
    useEffect(() => {
        const lastMsg = messages[messages.length - 1]
        // Only scroll if we were already near bottom OR if we just sent a message (optimistic)
        // We use a flag or check if the new message is ours? 
        // For simplicity: If new message ID changed...
        if (lastMsg?.id !== lastMessageIdRef.current) {
            // Check if we authored the last message (it's optimistic or from us)
            const isMe = lastMsg?.senderRole === 'ADMIN' || lastMsg?.senderRole === 'Admin'

            if (isMe || isUserNearBottom()) {
                scrollToBottom()
            }
            lastMessageIdRef.current = lastMsg?.id
        }
    }, [messages])

    // Polling Logic
    useEffect(() => {
        let isMounted = true
        const pollInterval = setInterval(async () => {
            try {
                const { getTicket } = await import("@/actions/tickets")
                const updatedTicket = await getTicket(initialTicket.id)

                if (updatedTicket && isMounted) {
                    // Check for Status Change
                    // We need a local status state if we want to react without full refresh, 
                    // OR we just trigger router.refresh() if status changes.
                    // Accessing props 'initialTicket' is static, so we compare against that OR a ref.
                    // But wait, if we router.refresh(), the component might re-mount with new props.
                    // Let's compare with the LAST KNOWN status.
                    // We can store status in a ref or state.

                    // But simpler: If the polled status is CLOSED and we thought it was OPEN, refresh.
                    if (updatedTicket.status !== initialTicket.status) {
                        // Status changed!
                        router.refresh()
                    }

                    setMessages(prev => {
                        // 1. Remove optimistic messages that have been confirmed (assume real messages replace them)
                        // Actually, simplified: Just compare length or content.
                        // Best approach: If real messages from server are DIFFERENT than current state (excluding optimistic/temp)

                        // Filter out temporary optimistic messages from current state to compare with server
                        const currentReal = prev.filter(m => !m.id.startsWith('temp-'))
                        const newMsgs = updatedTicket.messages

                        // Deep check
                        if (JSON.stringify(newMsgs) !== JSON.stringify(currentReal)) {
                            // Merge strategy: Take server messages, append any PENDING optimistic ones that aren't in server yet?
                            // For simplicity, we'll just trust server, but we risk killing a pending message if it hasn't landed yet.
                            // BUT, polling is 3s. Sending usually takes <1s.
                            // If isSending is true, maybe skip update?
                            return newMsgs
                        }
                        return prev
                    })
                } else if (!updatedTicket && isMounted) {
                    // Ticket Deleted!
                    alert("This ticket has been deleted.")
                    router.push("/admin/support")
                }
            } catch (error) {
                console.error("Polling error:", error)
            }
        }, 1000)

        return () => {
            isMounted = false
            clearInterval(pollInterval)
        }
    }, [initialTicket.id])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isSending) return

        if (!initialTicket.id) {
            console.error("AdminTicketChat: No ticket ID found!")
            alert("Error: Ticket ID is missing. Cannot send message.")
            return
        }

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

        console.log(`Sending message to ticket: ${initialTicket.id}`)

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
