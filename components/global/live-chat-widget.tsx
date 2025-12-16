"use client"

import { useState, useRef, useEffect, useTransition } from "react"
import Link from "next/link"
import { motion, AnimatePresence, useDragControls } from "framer-motion"
import { MessageCircle, X, Send, Minus, Users, ThumbsUp, ThumbsDown, Heart, Reply, Trash2, HeadphonesIcon, CreditCard, Gamepad2, ShieldCheck, DollarSign, Gauge, ArrowLeft, Search, MessageSquare, Megaphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

import { type ChatSettingsConfig } from "@/actions/chat-settings"
import { updatePresence, getOnlineCount } from "@/actions/presence"
import { getRecentMessages, sendMessage, addReaction, deleteMessage, type ChatMessageData, getChatProducts } from "@/actions/chat"
import { createTicket, getTicket, getUserTickets, closeTicket } from "@/actions/tickets"
import { getAnnouncement, type AnnouncementConfig } from "@/actions/announcements"
import { getActiveSponsoredMessage, type SponsoredMessageData } from "@/actions/sponsored"
import { SponsoredMessageCard } from "@/components/global/sponsored-message-card"
import { SimpleEmojiPicker } from "@/components/global/simple-emoji-picker"
import { playMessageSound, unlockAudioContext } from "@/lib/audio"

interface ChatMessage extends ChatMessageData {
    type?: 'system' | 'user' | 'announcement' | 'sponsored' // 'user' is default for DB messages
    sponsoredData?: SponsoredMessageData
}


const MAX_CHARS = 500

export function LiveChatWidget({ user, config }: { user?: any, config?: ChatSettingsConfig }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)
    const [isPending, startTransition] = useTransition()
    const dragControls = useDragControls()
    const isDraggingRef = useRef(false)

    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [onlineCount, setOnlineCount] = useState(1)
    const [announcement, setAnnouncement] = useState<AnnouncementConfig | null>(null)
    const [hasUnread, setHasUnread] = useState(false)
    const [activeTicket, setActiveTicket] = useState<{ id: string; category: string; status: string } | null>(null)
    const [userTickets, setUserTickets] = useState<any[]>([])
    const [view, setView] = useState<'chat' | 'support'>('chat')
    const [products, setProducts] = useState<{ id: string, name: string }[]>([])
    const [localSystemMessages, setLocalSystemMessages] = useState<ChatMessage[]>([])

    // Clear local messages when context changes to prevent leaks (e.g. global ads in private tickets)
    useEffect(() => {
        setLocalSystemMessages([])
    }, [activeTicket?.id, view])


    // Ref to track previous message ID to detect NEW ones for sound
    const lastMessageIdRef = useRef<string | null>(null)
    // Ref to track last sponsored message injection time
    const lastSponsoredTimeRef = useRef<number>(0)
    // Ref to throttle DB checks for sponsored messages
    const lastSponsoredCheckRef = useRef<number>(0)

    // Force refresh tickets when entering Support View to ensure "My Tickets" is up to date
    useEffect(() => {
        if (view === 'support') {
            const fetchTickets = async () => {
                const presenceId = sessionStorage.getItem("presenceId")
                const tickets = await getUserTickets(presenceId || undefined)
                setUserTickets(tickets)
            }
            fetchTickets()
        }
    }, [view])

    // ... (useEffect deps logic remains same for restoreSession)

    // 2. Polling Logic (Runs when activeTicket changes + interval)
    useEffect(() => {
        let isCurrent = true
        const presenceId = sessionStorage.getItem("presenceId")

        // Reset messages immediately when switching contexts to prevent ghosting
        setMessages([])
        lastMessageIdRef.current = null

        const pollData = async () => {
            // ... (Presence & Count logic same)A
            if (presenceId) await updatePresence(presenceId)
            if (!isCurrent) return

            const { count } = await getOnlineCount()
            if (isCurrent) setOnlineCount(count > 0 ? count : 1)

            // ... (Get Messages Logic)
            let dbMessages: ChatMessageData[] = []
            if (activeTicket) {
                const ticketData = await getTicket(activeTicket.id)

                if (!ticketData) {
                    // Ticket has been deleted
                    if (isCurrent) {
                        setActiveTicket(null)
                        setView('support')
                        // Force refresh ticket list
                        const presenceId = sessionStorage.getItem("presenceId")
                        const tickets = await getUserTickets(presenceId || undefined)
                        setUserTickets(tickets)
                    }
                    return
                }

                // Check for Status Change (e.g. Closed)
                if (ticketData.status !== activeTicket.status) {
                    if (isCurrent) {
                        setActiveTicket(prev => prev ? { ...prev, status: ticketData.status } : null)

                        // If closed, maybe add a system message locally if not already there
                        if (ticketData.status === 'CLOSED' && activeTicket.status !== 'CLOSED') {
                            setLocalSystemMessages(prev => [...prev, {
                                id: `sys-close-${Date.now()}`,
                                text: "**System:** This ticket has been closed.",
                                senderName: "System",
                                senderRole: "SYSTEM",
                                createdAt: new Date(),
                                reactions: { likes: 0, dislikes: 0, hearts: 0 },
                                type: 'system'
                            }])
                        }
                    }
                }

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

            // Check for expiration
            let validAnnouncement = latestAnnouncement
            if (latestAnnouncement?.active && latestAnnouncement.autoHideAfter && latestAnnouncement.autoHideAfter > 0) {
                const expiresAt = latestAnnouncement.timestamp + (latestAnnouncement.autoHideAfter * 1000)
                if (Date.now() > expiresAt) {
                    validAnnouncement = null
                }
            }

            if (isCurrent) setAnnouncement(validAnnouncement)

            // Sound Logic
            if (dbMessages.length > 0) {
                const latestMsg = dbMessages[dbMessages.length - 1]
                const previousLastId = lastMessageIdRef.current
                if (previousLastId && latestMsg.id !== previousLastId) {
                    const isRecent = new Date(latestMsg.createdAt).getTime() > Date.now() - 5000
                    if (isRecent) {
                        if (isOpen || isMinimized) {
                            playMessageSound()
                        } else {
                            if (isCurrent) setHasUnread(true)
                            playMessageSound()
                        }
                    }
                }
                lastMessageIdRef.current = latestMsg.id
            }

            // 5. Sponsored Message Injection Logic
            if (!activeTicket && view === 'chat') {
                const now = Date.now()
                // Throttle DB checks to every 10 seconds (was 60) for better responsiveness
                // We use a separate ref for the "check" vs the "injection"
                if (!lastSponsoredCheckRef.current || now - lastSponsoredCheckRef.current > 10 * 1000) {
                    lastSponsoredCheckRef.current = now // Update check time immediately
                    console.log("SPONSORED_DEBUG: Sponsored Check initiated.")
                    // Fetch to see what's active
                    const sponsored = await getActiveSponsoredMessage()
                    console.log("SPONSORED_DEBUG: Fetched sponsored message:", sponsored)

                    if (sponsored && isCurrent) {
                        // Check if enough time passed since LAST INJECTION based on THIS message's frequency
                        // Default to 15m if frequency is missing/0
                        const frequencyMs = (sponsored.frequency || 15) * 60 * 1000
                        const timeSinceLast = now - lastSponsoredTimeRef.current

                        console.log(`SPONSORED_DEBUG: Time since last: ${timeSinceLast}ms, Required: ${frequencyMs}ms`)

                        if (timeSinceLast > frequencyMs) {
                            console.log("SPONSORED_DEBUG: INJECTING MESSAGE NOW")
                            const newMessage: ChatMessage = {
                                id: `sponsored-${now}`,
                                text: sponsored.title,
                                senderName: "System",
                                senderRole: "ADMIN",
                                createdAt: new Date(),
                                type: 'sponsored',
                                sponsoredData: sponsored,
                                reactions: { likes: 0, dislikes: 0, hearts: 0 }
                            }
                            setLocalSystemMessages(prev => [...prev, newMessage])
                            lastSponsoredTimeRef.current = now
                        } else {
                            console.log("SPONSORED_DEBUG: Not time yet.")
                        }
                    }
                }
            }

            if (isCurrent) {
                setMessages((prev) => {
                    const nextDisplayMessages = dbMessages.map(m => ({ ...m, type: 'user' as const }))
                    const nextAll = [...nextDisplayMessages, ...localSystemMessages].sort(
                        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                    )

                    // Deep compare to prevent re-renders if nothing changed
                    // Since specific object references change, we compare structure
                    const prevStr = JSON.stringify(prev.map(m => ({ id: m.id, reactions: m.reactions })))
                    const nextStr = JSON.stringify(nextAll.map(m => ({ id: m.id, reactions: m.reactions })))

                    // Optimization: If IDs and Reactions are same, text is likely same (chats are append-only usually)
                    // But for safety, full compare might be safer but slower. 
                    // Let's settle on a "smart" compare: standard JSON stringify of the whole array is fast enough for <100 msgs.
                    if (JSON.stringify(prev) === JSON.stringify(nextAll)) {
                        return prev
                    }

                    return nextAll
                })
            }
        }


        // Initial call
        pollData()

        // Poll every 1 second for "Live" feel
        const interval = setInterval(pollData, 1000)

        return () => {
            isCurrent = false
            clearInterval(interval)
        }
    }, [activeTicket, isOpen, isMinimized, view, localSystemMessages]) // Added view and localSystemMessages to deps

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

        if (inputText.length > MAX_CHARS) {
            alert(`Message too long. Max ${MAX_CHARS} characters.`)
            return
        }

        if (inputText.includes('```')) {
            alert("Code blocks are not allowed in chat.")
            return
        }

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
        } else {
            alert(res.error || "Failed to create ticket")
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
            case 'pink': return { bg: 'from-pink-900/40 to-fuchsia-900/40', border: 'border-pink-500/30', text: 'text-pink-300', icon: 'bg-pink-400' }
            case 'yellow': return { bg: 'from-yellow-900/40 to-amber-900/40', border: 'border-yellow-500/30', text: 'text-yellow-300', icon: 'bg-yellow-400' }
            case 'teal': return { bg: 'from-teal-900/40 to-emerald-900/40', border: 'border-teal-500/30', text: 'text-teal-300', icon: 'bg-teal-400' }
            default: return { bg: 'from-green-900/40 to-emerald-900/40', border: 'border-green-500/30', text: 'text-green-300', icon: 'bg-green-400' }
        }
    }

    // Helper to parse mild markdown for system messages (bolding) + License Keys + Mentions
    const parseText = (text: string) => {
        // Regex patterns
        // License Key: 4 groups of 4 alphanumeric chars (e.g. A1B2-C3D4-E5F6-G7H8)
        const licenseRegex = /(\b[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}\b)/g
        // Mentions: @Name
        const mentionRegex = /(@[a-zA-Z0-9_]+)/g

        // 1. Split by Bold
        const parts = text.split(/(\*\*.*?\*\*)/g)

        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <span key={`bold-${i}`} className="font-bold text-white">{part.slice(2, -2)}</span>
            }

            // 2. Split by License Key
            const subParts = part.split(licenseRegex)
            return subParts.map((subPart, j) => {
                if (/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(subPart)) {
                    return (
                        <span
                            key={`license-${i}-${j}`}
                            className="inline-flex items-center gap-1 font-mono text-[10px] sm:text-xs bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 select-all cursor-pointer hover:bg-emerald-500/20 transition-colors"
                            title="License Key"
                            onClick={() => {
                                navigator.clipboard.writeText(subPart)
                                // Optional: Toast feedback could go here
                            }}
                        >
                            <ShieldCheck className="h-3 w-3" />
                            {subPart}
                        </span>
                    )
                }

                // 3. Split by Mentions
                const subSubParts = subPart.split(mentionRegex)
                return subSubParts.map((subSubPart, k) => {
                    if (subSubPart.startsWith('@')) {
                        // Check if it matches a known product (fuzzy: ignore spaces)
                        const mentionHandle = subSubPart.slice(1).toLowerCase()
                        const product = products.find(p => p.name.replace(/\s+/g, '').toLowerCase() === mentionHandle)

                        if (product) {
                            return (
                                <Link
                                    key={`mention-${i}-${j}-${k}`}
                                    href={`/shop/${product.id}`}
                                    target="_blank"
                                    className="font-bold text-blue-400 hover:text-blue-300 hover:underline cursor-pointer transition-colors"
                                    title={`View ${product.name}`}
                                >
                                    {subSubPart}
                                </Link>
                            )
                        }

                        // Default highlight
                        return (
                            <span
                                key={`mention-${i}-${j}-${k}`}
                                className="font-bold text-blue-400 hover:text-blue-300 hover:underline cursor-pointer transition-colors"
                            >
                                {subSubPart}
                            </span>
                        )
                    }
                    return subSubPart
                })
            })
        })
    }

    // Check if config enabled
    if (config && !config.enabled) return null

    const annColors = announcement ? getAnnouncementColor(announcement.color) : getAnnouncementColor('green')


    // Support Hub Data
    const [supportCategories, setSupportCategories] = useState<{ id: string, title: string, subtitle: string, icon: string, time?: string }[]>([])

    useEffect(() => {
        const fetchCategories = async () => {
            // We can import the server action directly here as it's a "use server" function
            const { getSupportCategories } = await import("@/actions/categories")
            const cats = await getSupportCategories()

            setSupportCategories(cats.map(c => ({
                id: c.id,
                title: c.title,
                subtitle: c.subtitle || "",
                icon: c.icon, // string name
                time: "" // We removed time from the model, can leave empty or remove from UI
            })))
        }
        fetchCategories()
    }, [])

    // Map string icons to components
    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'credit-card': return <CreditCard className="h-5 w-5" />
            case 'gamepad': return <Gamepad2 className="h-5 w-5" />
            case 'headphones': return <HeadphonesIcon className="h-5 w-5" />
            case 'dollar-sign': return <DollarSign className="h-5 w-5" />
            case 'shield-check': return <ShieldCheck className="h-5 w-5" />
            case 'message-square': return <MessageSquare className="h-5 w-5" />
            default: return <HeadphonesIcon className="h-5 w-5" />
        }
    }

    const getIconColor = (iconName: string) => {
        switch (iconName) {
            case 'credit-card': return "bg-emerald-500/10 text-emerald-500"
            case 'gamepad': return "bg-red-500/10 text-red-500"
            case 'headphones': return "bg-purple-500/10 text-purple-500"
            case 'dollar-sign': return "bg-emerald-500/10 text-emerald-500"
            default: return "bg-blue-500/10 text-blue-500"
        }
    }

    return (
        <motion.div
            drag
            dragListener={false}
            dragControls={dragControls}
            dragMomentum={false}
            onDragStart={() => { isDraggingRef.current = true }}
            onDragEnd={() => { setTimeout(() => isDraggingRef.current = false, 100) }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end print:hidden"
        >
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
                        <div
                            onPointerDown={(e) => dragControls.start(e)}
                            onTouchStart={(e) => dragControls.start(e)}
                            className="flex items-center justify-between border-b border-white/5 bg-white/5 p-4 backdrop-blur-md cursor-move touch-none"
                        >
                            <div className="flex items-center gap-3">
                                {view === 'support' ? (
                                    <button
                                        onClick={() => setView('chat')}
                                        className="mr-1 p-1 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                    </button>
                                ) : !activeTicket ? (
                                    /* LIVE USER COUNT PILL (Only in Global Chat to save space in Ticket view) */
                                    <div className="flex items-center gap-2 bg-zinc-800/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/5 shadow-inner">
                                        <div className="relative">
                                            <Users className="h-3.5 w-3.5 text-zinc-400" />
                                            {onlineCount > 1 && <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                            </span>}
                                        </div>
                                        <span className="text-[11px] font-bold text-zinc-300 tabular-nums leading-none pt-0.5">
                                            {onlineCount}
                                        </span>
                                    </div>
                                ) : null}
                                <div>
                                    <h3 className="text-sm font-black text-emerald-500 tracking-[0.2em] uppercase drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                                        {view === 'support' ? 'SUPPORT HUB' : (activeTicket ? activeTicket.category : 'LIVE CHAT')}
                                    </h3>
                                    <p className="text-[10px] text-emerald-500/60 uppercase tracking-widest font-medium">
                                        {view === 'support' ? 'Help Center' : (activeTicket ? `Ticket #${activeTicket.id.slice(-4)}` : 'Community')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {activeTicket && view === 'chat' && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleCloseTicket}
                                            className="group relative flex h-7 w-auto px-3 items-center justify-center gap-1.5 rounded-lg border border-red-500/50 bg-red-500/10 text-[10px] font-bold text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)] transition-all hover:bg-red-500/20 hover:text-red-400 hover:shadow-[0_0_20px_rgba(239,68,68,0.6)]"
                                            title="Permanently Close Ticket"
                                        >
                                            <span className="absolute inset-0 rounded-lg bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            <X className="h-3 w-3 relative z-10" />
                                            <span className="relative z-10">CLOSE</span>
                                        </button>

                                        <button
                                            onClick={() => {
                                                setActiveTicket(null)
                                                setView('support')
                                            }}
                                            className="group relative flex h-7 w-auto px-3 items-center justify-center gap-1.5 rounded-lg border border-zinc-500/30 bg-zinc-500/10 text-[10px] font-bold text-zinc-400 shadow-[0_0_10px_rgba(113,113,122,0.1)] transition-all hover:bg-zinc-500/20 hover:text-white hover:border-zinc-500/50 hover:shadow-[0_0_15px_rgba(113,113,122,0.3)]"
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
                                                <div className={`p-2 rounded-full ${getIconColor(cat.icon)}`}>
                                                    {getIcon(cat.icon)}
                                                </div>
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


                                {/* Global Announcement In-Chat Injection - ONLY for Global Chat, not Tickets */}
                                {!activeTicket && announcement && announcement.active && (
                                    <div className={`bg-gradient-to-r ${annColors.bg} p-3 mx-4 mt-4 rounded-lg border ${annColors.border} flex items-start gap-3 relative overflow-hidden group/ann`}>
                                        {announcement.imageUrl ? (
                                            <div className="shrink-0 h-10 w-10 mt-0.5 rounded-md overflow-hidden border border-white/20 shadow-sm relative">
                                                <img
                                                    src={announcement.imageUrl}
                                                    alt="Announcement"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="shrink-0 h-10 w-10 mt-0.5 rounded-md overflow-hidden bg-white/10 flex items-center justify-center border border-white/20 shadow-sm relative">
                                                <Megaphone className={`h-5 w-5 ${annColors.text} animate-pulse`} />
                                            </div>
                                        )}
                                        <div className="flex-1 relative z-10">
                                            {announcement.title && (
                                                <p className={`text-xs font-black uppercase tracking-wider ${annColors.text} mb-0.5`}>
                                                    {announcement.title}
                                                </p>
                                            )}
                                            <p className={`text-sm ${annColors.text} opacity-90 leading-snug`}>
                                                {announcement.text}
                                            </p>
                                            {announcement.linkUrl && (
                                                <a
                                                    href={announcement.linkUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-2 inline-flex items-center text-[10px] font-bold uppercase tracking-widest border border-white/20 px-2 py-1 rounded hover:bg-white/10 transition-colors"
                                                >
                                                    Open Link <ArrowLeft className="h-3 w-3 ml-1 rotate-180" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Messages */}
                                <ScrollArea className="flex-1 bg-transparent p-4">
                                    <div className="flex flex-col gap-4">


                                        {messages.map((msg) => {
                                            // 1. Sponsored Message
                                            if (msg.type === 'sponsored' && msg.sponsoredData) {
                                                return (
                                                    <div key={msg.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                        <SponsoredMessageCard
                                                            title={msg.sponsoredData.title}
                                                            description={msg.sponsoredData.description}
                                                            imageUrl={msg.sponsoredData.imageUrl}
                                                            linkUrl={msg.sponsoredData.linkUrl}
                                                            time={new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        />
                                                    </div>
                                                )
                                            }

                                            // 2. Standard Message
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
                                        <div className="flex flex-col gap-1 w-full">
                                            {inputText.length > 0 && (
                                                <div className={cn(
                                                    "text-[10px] text-right font-medium transition-colors",
                                                    inputText.length > MAX_CHARS ? "text-red-500" : "text-zinc-500"
                                                )}>
                                                    {inputText.length}/{MAX_CHARS}
                                                </div>
                                            )}
                                            <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                                                <SimpleEmojiPicker onSelect={handleEmojiSelect} disabled={isPending || activeTicket?.status === 'CLOSED'} />
                                                <Input
                                                    value={inputText}
                                                    onChange={(e) => setInputText(e.target.value)}
                                                    placeholder={activeTicket?.status === 'CLOSED' ? "This ticket is closed." : "Send a message..."}
                                                    disabled={isPending || activeTicket?.status === 'CLOSED'}
                                                    maxLength={MAX_CHARS}
                                                    className="h-10 rounded-xl border-white/5 bg-white/5 pr-10 text-sm text-zinc-200 placeholder:text-zinc-500 focus-visible:border-emerald-500/50 focus-visible:ring-0 focus-visible:shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                />
                                                <Button
                                                    type="submit"
                                                    size="icon"
                                                    disabled={isPending || activeTicket?.status === 'CLOSED' || inputText.length > MAX_CHARS}
                                                    className="h-10 w-10 shrink-0 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all border border-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Send className="h-4 w-4" />
                                                </Button>
                                            </form>
                                        </div>
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
                    if (isDraggingRef.current) return
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
                onPointerDown={(e) => dragControls.start(e)}
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
        </motion.div>
    )
}
