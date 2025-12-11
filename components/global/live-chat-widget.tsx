"use client"

import { useState, useRef, useEffect, useTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send, Minus, Users, ThumbsUp, ThumbsDown, Heart, Reply, Trash2, HeadphonesIcon, CreditCard, Gamepad2, ShieldCheck, DollarSign, Gauge, ArrowLeft, Search, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

import { type ChatSettingsConfig } from "@/actions/chat-settings"
import { updatePresence, getOnlineCount } from "@/actions/presence"
import { getRecentMessages, sendMessage, addReaction, deleteMessage, type ChatMessageData } from "@/actions/chat"
import { createTicket, getTicket, getUserTickets, closeTicket } from "@/actions/tickets"
import { getAnnouncement, type AnnouncementConfig } from "@/actions/announcements"
import { SimpleEmojiPicker } from "@/components/global/simple-emoji-picker"
import { playMessageSound, unlockAudioContext } from "@/lib/audio"

interface ChatMessage extends ChatMessageData {
    type?: 'system' | 'user' | 'announcement' // 'user' is default for DB messages
}

export function LiveChatWidget({ user, config }: { user?: any, config?: ChatSettingsConfig }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)
    const [isPending, startTransition] = useTransition()

    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [onlineCount, setOnlineCount] = useState(1)
    const [announcement, setAnnouncement] = useState<AnnouncementConfig | null>(null)
    const [hasUnread, setHasUnread] = useState(false)
    const [activeTicket, setActiveTicket] = useState<{ id: string; category: string; status: string } | null>(null)
    const [userTickets, setUserTickets] = useState<any[]>([])

    // Ref to track previous message ID to detect NEW ones for sound
    const lastMessageIdRef = useRef<string | null>(null)

    // 1. Initialize & Restore Session (Run ONCE)
    useEffect(() => {
        // Generate a random ID for this session if not exists
        let presenceId = sessionStorage.getItem("presenceId")
        if (!presenceId) {
            presenceId = Math.random().toString(36).substring(7)
            sessionStorage.setItem("presenceId", presenceId)
        }

        // Restore active ticket session
        const restoreSession = async () => {
            const tickets = await getUserTickets(presenceId || undefined)
            const active = tickets.find((t: any) => t.status !== 'CLOSED')
            if (active) {
                // Check if we actually need to update to avoid unnecessary re-renders (though empty dep array prevents loop)
                setActiveTicket({ id: active.id, category: active.category, status: active.status })
            }
        }
        restoreSession()
    }, [])

    // 2. Polling Logic (Runs when activeTicket changes + interval)
    useEffect(() => {
        let isCurrent = true
        const presenceId = sessionStorage.getItem("presenceId")

        // Reset messages immediately when switching contexts to prevent ghosting
        setMessages([])
        lastMessageIdRef.current = null

        const pollData = async () => {
            // 1. Heartbeat
            if (presenceId) await updatePresence(presenceId)
            if (!isCurrent) return

            // 2. Get Count
            const { count } = await getOnlineCount()
            if (isCurrent) setOnlineCount(count > 0 ? count : 1)

            // 3. Get Messages
            let dbMessages: ChatMessageData[] = []

            if (activeTicket) {
                const ticketData = await getTicket(activeTicket.id)
                if (ticketData) {
                    dbMessages = ticketData.messages.map(m => ({
                        id: m.id,
                        text: m.text,
                        senderName: m.senderName,
                        senderAvatar: m.senderAvatar,
                        senderRole: m.senderRole,
                        createdAt: m.createdAt,
                        reactions: m.reactions ? JSON.parse(m.reactions) : { likes: 0, dislikes: 0, hearts: 0 }
                    }))
                }
            } else {
                dbMessages = await getRecentMessages()
            }

            if (!isCurrent) return

            // 4. Get Announcement context
            const latestAnnouncement = await getAnnouncement()
            if (isCurrent) setAnnouncement(latestAnnouncement)

            // Sound Logic: If we have new messages that are NOT our own (crudely checked by timestamp or just ID change)
            if (dbMessages.length > 0) {
                const latestMsg = dbMessages[dbMessages.length - 1]
                const previousLastId = lastMessageIdRef.current

                // If we have a previous Record, and the new latest ID is different -> New Message
                if (previousLastId && latestMsg.id !== previousLastId) {
                    // Only play if it was created recently (within last 5 seconds) to avoid spam on page load
                    const isRecent = new Date(latestMsg.createdAt).getTime() > Date.now() - 5000
                    if (isRecent) {
                        if (isOpen || isMinimized) {
                            // If open/minimized, play sound
                            playMessageSound()
                        } else {
                            if (isCurrent) setHasUnread(true)
                            playMessageSound()
                        }
                    }
                }
                lastMessageIdRef.current = latestMsg.id
            }

            let displayMessages: ChatMessage[] = dbMessages.map(m => ({ ...m, type: 'user' }))
            if (isCurrent) setMessages((prev) => {
                // Optional: Reduce flicker by checking if content actually changed, 
                // but for now simple replacement is strict and correct for "ghosting"
                return displayMessages
            })
        }

        // Initial call
        pollData()

        // Poll every 3 seconds for "Live" feel
        const interval = setInterval(pollData, 3000)

        return () => {
            isCurrent = false
            clearInterval(interval)
        }
    }, [activeTicket, isOpen, isMinimized]) // Added isOpen/isMinimized for sound logic context if needed, though ref checks are better. Kept activeTicket.

    const [inputText, setInputText] = useState("")
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isOpen && scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, isOpen, isMinimized])

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!inputText.trim()) return

        // Optimistic UI update could go here, but with 3s poll it might flicker.
        // Let's just send and wait for poll or manually trigger fetch.

        startTransition(async () => {
            const res = await sendMessage(inputText, activeTicket?.id)
            if (!res.success) {
                if (res.error === "This ticket strictly no longer exists.") {
                    setActiveTicket(null)
                    setView('support')
                    // Force refresh ticket list
                    const presenceId = sessionStorage.getItem("presenceId")
                    const tickets = await getUserTickets(presenceId || undefined)
                    setUserTickets(tickets)
                }
            } else {
                setInputText("")
                // Re-fetch immediately for responsiveness
            }
        })
    }

    const handleCreateTicket = async (category: string) => {
        const presenceId = sessionStorage.getItem("presenceId")
        const res = await createTicket(category, presenceId || undefined)

        if (res.success && res.ticket) {
            setActiveTicket({ id: res.ticket.id, category: res.ticket.category, status: 'OPEN' })
            // Refresh ticket list
            const tickets = await getUserTickets(presenceId || undefined)
            setUserTickets(tickets)

            setView('chat')
            // Inject a local system message for immediate feedback
            setMessages([{
                id: 'temp-sys',
                text: `**System:** Support request regarding **${category}** created. A staff member will be with you shortly.`,
                senderName: "System",
                createdAt: new Date(),
                reactions: { likes: 0, dislikes: 0, hearts: 0 },
                type: 'system',
                senderRole: "SYSTEM"
            }])
        }
    }

    const handleCloseTicket = async () => {
        if (!activeTicket) return

        const ticketId = activeTicket.id
        // Optimistic close
        setActiveTicket(null)
        setView('support')

        try {
            await closeTicket(ticketId)
        } catch (error) {
            console.error("Failed to close ticket", error)
        }

        // Force refresh ticket list
        const presenceId = sessionStorage.getItem("presenceId")
        const tickets = await getUserTickets(presenceId || undefined)
        setUserTickets(tickets)
    }

    const handleResumeTicket = (ticket: any) => {
        setActiveTicket({ id: ticket.id, category: ticket.category, status: ticket.status })
        setView('chat')
    }

    const handleDeleteMessage = async (msgId: string) => {
        if (!confirm("Delete this message?")) return

        // Optimistic UI
        setMessages(prev => prev.filter(m => m.id !== msgId))
        await deleteMessage(msgId)
    }

    const handleEmojiSelect = (emoji: string) => {
        setInputText(prev => prev + emoji)
    }

    const handleReaction = async (msgId: string, type: 'likes' | 'dislikes' | 'hearts') => {
        // Optimistic update
        setMessages(prev => prev.map(msg => {
            if (msg.id === msgId) {
                return {
                    ...msg,
                    reactions: {
                        ...msg.reactions,
                        [type]: msg.reactions[type] + 1
                    }
                }
            }
            return msg
        }))

        // Server action
        await addReaction(msgId, type)
    }

    const getAnnouncementColor = (color: string = 'green') => {
        switch (color) {
            case 'green': return { bg: 'from-green-900/40 to-emerald-900/40', border: 'border-green-500/30', text: 'text-green-300', icon: 'bg-green-400' }
            case 'blue': return { bg: 'from-cyan-900/40 to-blue-900/40', border: 'border-cyan-500/30', text: 'text-cyan-300', icon: 'bg-cyan-400' }
            case 'red': return { bg: 'from-red-900/40 to-rose-900/40', border: 'border-red-500/30', text: 'text-red-300', icon: 'bg-red-400' }
            case 'purple': return { bg: 'from-purple-900/40 to-violet-900/40', border: 'border-purple-500/30', text: 'text-purple-300', icon: 'bg-purple-400' }
            case 'orange': return { bg: 'from-orange-900/40 to-amber-900/40', border: 'border-orange-500/30', text: 'text-orange-300', icon: 'bg-orange-400' }
            default: return { bg: 'from-green-900/40 to-emerald-900/40', border: 'border-green-500/30', text: 'text-green-300', icon: 'bg-green-400' }
        }
    }

    // Helper to parse mild markdown for system messages (bolding)
    const parseText = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g)
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <span key={i} className="font-bold text-white">{part.slice(2, -2)}</span>
            }
            return part
        })
    }

    // Check if config enabled
    if (config && !config.enabled) return null

    const annColors = announcement ? getAnnouncementColor(announcement.color) : getAnnouncementColor('green')

    const [view, setView] = useState<'chat' | 'support'>('chat')

    // Support Hub Data
    const supportCategories = [
        { id: 'deposits', title: 'Deposits', subtitle: 'We are here if you have any m...', time: '8:44 PM', icon: <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-500"><CreditCard className="h-5 w-5" /></div> },
        { id: 'game_issues', title: 'Game Issues', subtitle: 'We are here if you have any m...', time: '1:59 AM', icon: <div className="p-2 rounded-full bg-red-500/10 text-red-500"><Gamepad2 className="h-5 w-5" /></div> },
        { id: 'kyc', title: 'KYC', subtitle: 'Hi,', time: '', icon: <div className="p-2 rounded-full bg-blue-500/10 text-blue-500"><ShieldCheck className="h-5 w-5" /></div> },
        { id: 'support', title: 'Support', subtitle: 'Let us know if you need anyth...', time: '1:33 AM', icon: <div className="p-2 rounded-full bg-purple-500/10 text-purple-500"><HeadphonesIcon className="h-5 w-5" /></div> },
        { id: 'limits', title: 'Withdrawal Limits', subtitle: 'Thank you for your message. ...', time: '', icon: <div className="p-2 rounded-full bg-orange-500/10 text-orange-500"><Gauge className="h-5 w-5" /></div> },
        { id: 'withdrawals', title: 'Withdrawals', subtitle: 'Hi,', time: '', icon: <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-500"><DollarSign className="h-5 w-5" /></div> },
    ]

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end print:hidden">
            <AnimatePresence>
                {isOpen && !isMinimized && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="mb-4 flex h-[70vh] w-[calc(100vw-32px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/60 shadow-2xl backdrop-blur-xl sm:h-[600px] sm:w-[380px]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-white/5 bg-white/5 p-4 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                {view === 'support' ? (
                                    <button
                                        onClick={() => setView('chat')}
                                        className="mr-1 p-1 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                    </button>
                                ) : (
                                    <div className="relative flex h-3 w-3">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
                                        <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-sm font-black text-emerald-500 tracking-[0.2em] uppercase drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                                        {view === 'support' ? 'SUPPORT HUB' : (activeTicket ? `SUPPORT: ${activeTicket.category}` : 'LIVE CHAT')}
                                    </h3>
                                    <p className="text-[10px] text-emerald-500/60 uppercase tracking-widest font-medium">
                                        {view === 'support' ? 'Help Center' : (activeTicket ? `Ticket #${activeTicket.id.slice(-4)}` : 'Community')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {activeTicket && view === 'chat' && (
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={handleCloseTicket}
                                            className="group relative flex items-center gap-1.5 rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-1 text-[10px] font-bold text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)] transition-all hover:bg-red-500/20 hover:text-red-400 hover:shadow-[0_0_20px_rgba(239,68,68,0.6)] mr-2"
                                            title="Permanently Close Ticket"
                                        >
                                            <span className="absolute inset-0 rounded-lg bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            <X className="h-3 w-3 relative z-10" />
                                            <span className="relative z-10">CLOSE TICKET</span>
                                        </button>

                                        <button
                                            onClick={() => {
                                                setActiveTicket(null)
                                                setView('support')
                                            }}
                                            className="group relative flex items-center gap-1.5 rounded-lg border border-zinc-500/30 bg-zinc-500/10 px-3 py-1 text-[10px] font-bold text-zinc-400 shadow-[0_0_10px_rgba(113,113,122,0.1)] transition-all hover:bg-zinc-500/20 hover:text-white hover:border-zinc-500/50 hover:shadow-[0_0_15px_rgba(113,113,122,0.3)]"
                                            title="Exit Chat (Keep Ticket Open)"
                                        >
                                            <ArrowLeft className="h-3 w-3 relative z-10" />
                                            <span className="relative z-10">EXIT</span>
                                        </button>
                                    </div>
                                )}
                                {view === 'chat' && !activeTicket && (
                                    <button
                                        onClick={() => setView('support')}
                                        className="group relative flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)] transition-all hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/60 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                                        title="Support Hub"
                                    >
                                        <HeadphonesIcon className="h-3 w-3 relative z-10" />
                                        <span className="relative z-10">SUPPORT</span>
                                    </button>
                                )}
                                <div className="flex items-center gap-1 ml-1">
                                    <button onClick={() => setIsMinimized(true)} className="text-zinc-400 hover:text-white">
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {view === 'support' ? (
                            /* SUPPORT VIEW */
                            <div className="flex flex-col h-full bg-black/40">
                                <ScrollArea className="flex-1">
                                    <div className="p-2 space-y-1">
                                        {/* My Tickets Section */}
                                        {userTickets.length > 0 && (
                                            <div className="mb-4">
                                                <h4 className="px-4 py-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">Your Tickets</h4>
                                                {userTickets.map((ticket) => (
                                                    <button
                                                        key={ticket.id}
                                                        onClick={() => handleResumeTicket(ticket)}
                                                        className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all text-left group border border-transparent hover:border-white/5 mx-1"
                                                    >
                                                        <div className={cn("p-2 rounded-full",
                                                            ticket.status === 'CLOSED' ? "bg-zinc-800 text-zinc-500" : "bg-emerald-500/10 text-emerald-500"
                                                        )}>
                                                            <MessageSquare className="h-4 w-4" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-start">
                                                                <span className={cn("font-bold text-sm", ticket.status === 'CLOSED' ? "text-zinc-500" : "text-zinc-200")}>
                                                                    {ticket.category}
                                                                </span>
                                                                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded",
                                                                    ticket.status === 'OPEN' ? "bg-green-500/20 text-green-400" : "bg-zinc-800 text-zinc-500"
                                                                )}>
                                                                    {ticket.status}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-zinc-500 truncate">
                                                                {new Date(ticket.updatedAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </button>
                                                ))}
                                                <div className="my-2 border-t border-white/5 mx-4" />
                                            </div>
                                        )}

                                        <h4 className="px-4 py-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">New Request</h4>
                                        {supportCategories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => handleCreateTicket(cat.title)}
                                                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all text-left group border border-transparent hover:border-white/5"
                                            >
                                                {cat.icon}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-0.5">
                                                        <span className="font-bold text-sm text-zinc-200 group-hover:text-white transition-colors">
                                                            {cat.title}
                                                        </span>
                                                        {cat.time && (
                                                            <span className="text-[10px] text-zinc-500 font-medium">
                                                                {cat.time}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-zinc-500 truncate group-hover:text-zinc-400 transition-colors">
                                                        {cat.subtitle}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </ScrollArea>

                                {/* FAQs Search Placeholder */}
                                <div className="p-4 border-t border-white/5 bg-black/20">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                        <Input
                                            placeholder="Search FAQs..."
                                            className="pl-9 bg-white/5 border-white/10 text-sm focus-visible:ring-emerald-500/50"
                                        />
                                    </div>
                                    <div className="mt-3 flex justify-center">
                                        <span className="flex items-center gap-1 text-[10px] text-zinc-600 font-medium">
                                            Powered by <span className="text-emerald-500/80">Levik.dev</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* CHAT VIEW */
                            <>
                                {/* Pinned / Content Area */}
                                {config?.pinnedContentEnabled && (
                                    <div className="border-b border-blue-900/30 bg-blue-950/10 p-4">
                                        <div className="flex items-center justify-center rounded-lg border border-blue-500/20 bg-black/40 p-2">
                                            <img
                                                src={config.pinnedImageUrl || "/placeholder-logo.png"}
                                                alt="Pinned Content"
                                                className="h-12 w-auto object-contain opacity-80"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Global Announcement In-Chat Injection */}
                                {announcement && announcement.active && (
                                    <div className={`bg-gradient-to-r ${annColors.bg} p-3 mx-4 mt-4 rounded-lg border ${annColors.border} flex items-start gap-3`}>
                                        <div className={`mt-1 h-2 w-2 rounded-full ${annColors.icon} animate-pulse shrink-0`} />
                                        <div>
                                            <p className={`text-xs font-bold ${annColors.text} mb-1`}>ANNOUNCEMENT</p>
                                            <p className={`text-sm ${annColors.text} opacity-90 leading-snug`}>{announcement.text}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Messages */}
                                <ScrollArea className="flex-1 bg-transparent p-4">
                                    <div className="flex flex-col gap-4">
                                        {/* System Welcome Message */}
                                        {config?.systemMessageText && (
                                            <div className="rounded-xl border border-amber-500/20 bg-amber-950/10 p-3 text-center">
                                                <div className="mb-1 flex items-center justify-center gap-2 text-xs font-semibold text-amber-500">
                                                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                                                    {config.systemMessageTitle || "System"}
                                                </div>
                                                <p className="text-sm leading-relaxed text-amber-200/90">
                                                    {parseText(config.systemMessageText)}
                                                </p>
                                            </div>
                                        )}

                                        {messages.map((msg) => {
                                            const isAdmin = msg.senderRole === "ADMIN" || msg.senderRole === "Admin"
                                            const isSupport = msg.senderRole === "SUPPORT" || msg.senderRole === "Support"
                                            const isSelf = msg.senderName === user?.name // weak check but sufficient for UI
                                            const canDelete = (user as any)?.role === "ADMIN" || (user as any)?.role === "Admin"

                                            return (
                                                <div key={msg.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                    <div className="group relative">
                                                        {canDelete && (
                                                            <button
                                                                onClick={() => handleDeleteMessage(msg.id)}
                                                                className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-500/10 rounded transition-all"
                                                                title="Delete Message"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </button>
                                                        )}

                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Avatar className={cn("h-8 w-8 border",
                                                                isAdmin ? "border-red-500/50" :
                                                                    isSupport ? "border-emerald-500/50" : "border-zinc-700"
                                                            )}>
                                                                <AvatarImage src={msg.senderAvatar || undefined} />
                                                                <AvatarFallback className={cn("text-xs",
                                                                    isAdmin ? "bg-red-950 text-red-400" :
                                                                        isSupport ? "bg-emerald-950 text-emerald-400" : "bg-zinc-800 text-zinc-400"
                                                                )}>
                                                                    {msg.senderName?.slice(0, 2).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex items-baseline gap-2">
                                                                <span className={cn("text-xs font-bold tracking-wide",
                                                                    isAdmin ? "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" :
                                                                        isSupport ? "text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "text-zinc-200"
                                                                )}>{msg.senderName}</span>
                                                                {isAdmin && (
                                                                    <span className="text-[9px] font-bold text-red-500 opacity-80 tracking-widest border-l border-red-500/20 pl-2">
                                                                        ADMIN
                                                                    </span>
                                                                )}
                                                                {isSupport && (
                                                                    <span className="text-[9px] font-bold text-emerald-500 opacity-80 tracking-widest border-l border-emerald-500/20 pl-2">
                                                                        SUPPORT
                                                                    </span>
                                                                )}
                                                                {!isAdmin && !isSupport && msg.senderRole === "user" && (
                                                                    <span className="text-[9px] font-medium text-blue-400/80 tracking-widest border-l border-blue-500/20 pl-2">
                                                                        USER
                                                                    </span>
                                                                )}
                                                                <span className="text-[10px] text-zinc-500">
                                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="ml-10">
                                                            <div className={cn("relative rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm backdrop-blur-md shadow-sm border transition-all duration-300",
                                                                isAdmin
                                                                    ? "bg-gradient-to-br from-red-600/10 to-red-900/5 border-red-500/10 text-red-100/90"
                                                                    : isSupport
                                                                        ? "bg-gradient-to-br from-emerald-600/10 to-emerald-900/5 border-emerald-500/10 text-emerald-100/90"
                                                                        : "bg-gradient-to-br from-zinc-800/40 to-zinc-900/40 border-white/5 text-zinc-200 hover:border-white/10"
                                                            )}>
                                                                {msg.text}
                                                            </div>

                                                            {/* Reaction Bar */}
                                                            <div className="mt-1 flex items-center gap-4 px-2 opacity-50 transition-opacity group-hover:opacity-100">
                                                                <button
                                                                    onClick={() => handleReaction(msg.id, 'likes')}
                                                                    className="flex items-center gap-1 text-xs text-zinc-400 hover:text-green-400 transition-colors"
                                                                >
                                                                    <ThumbsUp className="h-3 w-3" /> {msg.reactions?.likes || 0}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReaction(msg.id, 'dislikes')}
                                                                    className="flex items-center gap-1 text-xs text-zinc-400 hover:text-red-400 transition-colors"
                                                                >
                                                                    <ThumbsDown className="h-3 w-3" /> {msg.reactions?.dislikes || 0}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReaction(msg.id, 'hearts')}
                                                                    className="flex items-center gap-1 text-xs text-zinc-400 hover:text-pink-400 transition-colors"
                                                                >
                                                                    <Heart className="h-3 w-3" /> {msg.reactions?.hearts || 0}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        <div ref={scrollRef} />
                                    </div>
                                </ScrollArea>

                                {/* Input Area */}
                                <div className="border-t border-white/5 bg-black/40 p-3 backdrop-blur-md">
                                    {user ? (
                                        <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                                            <SimpleEmojiPicker onSelect={handleEmojiSelect} disabled={isPending} />
                                            <Input
                                                value={inputText}
                                                onChange={(e) => setInputText(e.target.value)}
                                                placeholder="Send a message..."
                                                disabled={isPending}
                                                className="h-10 rounded-xl border-white/5 bg-white/5 pr-10 text-sm text-zinc-200 placeholder:text-zinc-500 focus-visible:border-emerald-500/50 focus-visible:ring-0 focus-visible:shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all"
                                            />
                                            <Button
                                                type="submit"
                                                size="icon"
                                                disabled={isPending}
                                                className="h-10 w-10 shrink-0 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all border border-emerald-500/20"
                                            >
                                                <Send className="h-4 w-4" />
                                            </Button>
                                        </form>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            <div className="relative">
                                                <Input
                                                    disabled
                                                    placeholder="Please login to chat..."
                                                    className="h-10 rounded-xl border-white/5 bg-white/5 text-sm placeholder:text-zinc-600 disabled:opacity-50"
                                                />
                                                <Button
                                                    disabled
                                                    size="icon"
                                                    className="absolute right-0 top-0 h-10 w-10 rounded-l-none rounded-r-xl bg-zinc-800 opacity-50"
                                                >
                                                    <Send className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <p className="text-center text-xs text-zinc-500">
                                                <span className="font-bold text-white hover:underline cursor-pointer">Login</span> or <span className="font-bold text-white hover:underline cursor-pointer">Sign up</span> to join the conversation
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Toggle */}
            <motion.button
                className={cn(
                    "group relative flex h-14 w-14 items-center justify-center rounded-2xl border bg-[#0a0a0a] transition-all duration-500",
                    "border-emerald-500/30",
                    "shadow-[0_0_15px_rgba(16,185,129,0.2)]",
                    "hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:border-emerald-500/50 hover:scale-105 active:scale-95",
                    // Pulse glow when unread
                    hasUnread && !isOpen && "animate-pulse shadow-[0_0_30px_rgba(16,185,129,0.6)] border-emerald-500"
                )}
                onClick={() => {
                    if (isOpen && isMinimized) {
                        setIsMinimized(false)
                    } else {
                        if (!isOpen) {
                            // Play sound on open to unlock AudioContext for iOS/Chrome autoplay policies
                            unlockAudioContext()
                            setHasUnread(false)
                        }
                        setIsOpen(!isOpen)
                    }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                {hasUnread && !isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
                    </span>
                )}

                {isOpen && !isMinimized ? (
                    <X className="h-6 w-6 text-emerald-500/80 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)] group-hover:text-emerald-400" />
                ) : (
                    <MessageCircle className="h-6 w-6 text-emerald-500/80 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)] group-hover:text-emerald-400" />
                )}
            </motion.button>


            {/* Minimzed Tooltip */}
            {isOpen && isMinimized && (
                <div className="absolute bottom-16 right-0 rounded-lg bg-[#111] border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 shadow-lg whitespace-nowrap">
                    Chat minimized
                </div>
            )}
        </div>
    )
}
