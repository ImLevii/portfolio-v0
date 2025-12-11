"use client"

import { useState, useRef, useEffect, useTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send, Minus, Users, ThumbsUp, ThumbsDown, Heart, Reply, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

import { type ChatSettingsConfig } from "@/actions/chat-settings"
import { updatePresence, getOnlineCount } from "@/actions/presence"
import { getRecentMessages, sendMessage, addReaction, deleteMessage, type ChatMessageData } from "@/actions/chat"
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

    // Ref to track previous message ID to detect NEW ones for sound
    const lastMessageIdRef = useRef<string | null>(null)

    useEffect(() => {
        // Generate a random ID for this session if not exists
        let presenceId = sessionStorage.getItem("presenceId")
        if (!presenceId) {
            presenceId = Math.random().toString(36).substring(7)
            sessionStorage.setItem("presenceId", presenceId)
        }

        const pollData = async () => {
            // 1. Heartbeat
            if (presenceId) await updatePresence(presenceId)

            // 2. Get Count
            const { count } = await getOnlineCount()
            setOnlineCount(count > 0 ? count : 1)

            // 3. Get Messages
            const dbMessages = await getRecentMessages()

            // 4. Get Announcement context
            const latestAnnouncement = await getAnnouncement()
            setAnnouncement(latestAnnouncement)

            // Sound Logic: If we have new messages that are NOT our own (crudely checked by timestamp or just ID change)
            if (dbMessages.length > 0) {
                const latestMsg = dbMessages[dbMessages.length - 1]
                const previousLastId = lastMessageIdRef.current

                // If we have a previous Record, and the new latest ID is different -> New Message
                if (previousLastId && latestMsg.id !== previousLastId) {
                    // Check if it's NOT me (optional, but good UX to hear your own send? User said "When SENT")
                    // Actually, usually you want to hear *others*. 
                    // Let's play it regardless for "Activity", or maybe skip if sender == me?
                    // User said "NEW MESSAGE IS SENT", ambiguous. 
                    // I will play it for ALL new messages for feedback.

                    // Only play if it was created recently (within last 5 seconds) to avoid spam on page load
                    const isRecent = new Date(latestMsg.createdAt).getTime() > Date.now() - 5000
                    if (isRecent) {
                        if (isOpen || isMinimized) {
                            // If open/minimized, play sound
                            playMessageSound()
                        } else {
                            // If closed, mark as unread (and sound will play on unlock/open if desired, OR play here if unlocked)
                            // Actually, sound usually plays when message arrives. 
                            // Let's set unread.
                            setHasUnread(true)
                            // Try to play sound if context is unlocked
                            playMessageSound()
                        }
                    }
                }
                lastMessageIdRef.current = latestMsg.id
            }

            // MergeDB messages with local System messages (if needed)
            // For now, we just use DB messages + System Message from config at HEAD if empty?
            // Actually, we want persistent history, so we just use dbMessages. 
            // BUT we need to inject the announcement if active.

            let displayMessages: ChatMessage[] = dbMessages.map(m => ({ ...m, type: 'user' }))

            // Inject Active Announcement at the very bottom (most recent) if active
            // OR distinct visual. For "Chat Stream", let's inject it if it's NEW.
            // Simplified: Just put it at the top of the chat list or render distinct?
            // User asked for "Inject Global Announcements into Chat Stream". 
            // We'll trust the Database for history. 
            // Layout: [Messages]

            // If system message is configured, we can prepend it cleanly if list is empty?
            // Or better: Just rely on DB. 

            setMessages(displayMessages)
        }

        // Initial call
        pollData()

        // Poll every 3 seconds for "Live" feel
        const interval = setInterval(pollData, 3000)

        return () => clearInterval(interval)
    }, [])

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
            await sendMessage(inputText)
            setInputText("")
            // Re-fetch immediately for responsiveness
            const dbMessages = await getRecentMessages()
            setMessages(dbMessages.map(m => ({ ...m, type: 'user' })))
        })
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

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end print:hidden">
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
                                <div className="relative flex h-3 w-3">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
                                    <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-emerald-500 tracking-[0.2em] uppercase drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">LIVE CHAT</h3>
                                    <p className="text-[10px] text-emerald-500/60 uppercase tracking-widest font-medium">Community</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-[10px] font-medium text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                    <Users className="h-3 w-3 text-emerald-500" />
                                    <span>{onlineCount}</span>
                                </div>
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
                                                    <Avatar className={cn("h-8 w-8 border", isAdmin ? "border-red-500/50" : "border-zinc-700")}>
                                                        <AvatarImage src={msg.senderAvatar || undefined} />
                                                        <AvatarFallback className={cn("text-xs", isAdmin ? "bg-red-950 text-red-400" : "bg-zinc-800 text-zinc-400")}>
                                                            {msg.senderName?.slice(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className={cn("text-xs font-bold tracking-wide", isAdmin ? "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "text-zinc-200")}>{msg.senderName}</span>
                                                        {isAdmin && (
                                                            <span className="text-[9px] font-bold text-red-500 opacity-80 tracking-widest border-l border-red-500/20 pl-2">
                                                                ADMIN
                                                            </span>
                                                        )}
                                                        {!isAdmin && msg.senderRole === "user" && (
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
