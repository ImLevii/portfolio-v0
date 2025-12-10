"use client"

import { useState, useRef, useEffect, useTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send, Minus, Users, ThumbsUp, ThumbsDown, Heart, Reply, Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

import { type ChatSettingsConfig } from "@/actions/chat-settings"
import { updatePresence, getOnlineCount } from "@/actions/presence"
import { getRecentMessages, sendMessage, addReaction, type ChatMessageData } from "@/actions/chat"
import { getAnnouncement, type AnnouncementConfig } from "@/actions/announcements"

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

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end print:hidden">
            <AnimatePresence>
                {isOpen && !isMinimized && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="mb-4 flex h-[600px] w-[380px] flex-col overflow-hidden rounded-xl border border-zinc-800 bg-[#0a0a0a] shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-zinc-800 bg-[#111] p-3">
                            <div className="flex items-center gap-3">
                                <div className="relative flex h-3 w-3">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
                                    <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white">Live Chat</h3>
                                    <p className="text-xs text-zinc-400">Community discussion</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
                                    <Users className="h-3 w-3" />
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
                            <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 p-3 mx-4 mt-4 rounded-lg border border-purple-500/30 flex items-start gap-3">
                                <div className="mt-1 h-2 w-2 rounded-full bg-purple-400 animate-pulse shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-purple-300 mb-1">ANNOUNCEMENT</p>
                                    <p className="text-sm text-purple-100/90 leading-snug">{announcement.text}</p>
                                </div>
                            </div>
                        )}

                        {/* Messages */}
                        <ScrollArea className="flex-1 bg-[#050505] p-4">
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
                                    return (
                                        <div key={msg.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <div className="group">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Avatar className={cn("h-8 w-8 border", isAdmin ? "border-red-500/50" : "border-zinc-700")}>
                                                        <AvatarImage src={msg.senderAvatar || undefined} />
                                                        <AvatarFallback className={cn("text-xs", isAdmin ? "bg-red-950 text-red-400" : "bg-zinc-800 text-zinc-400")}>
                                                            {msg.senderName?.slice(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className={cn("text-sm font-bold", isAdmin ? "text-red-500" : "text-white")}>{msg.senderName}</span>
                                                        {isAdmin && (
                                                            <span className="rounded-full bg-red-500/20 px-1.5 py-0.5 text-[10px] font-medium text-red-500 border border-red-500/30">
                                                                ADMIN
                                                            </span>
                                                        )}
                                                        {!isAdmin && msg.senderRole === "user" && (
                                                            <span className="rounded-full bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-medium text-blue-400 border border-blue-500/30">
                                                                user
                                                            </span>
                                                        )}
                                                        <span className="text-[10px] text-zinc-500">
                                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="ml-10">
                                                    <div className={cn("rounded-2xl rounded-tl-sm border px-4 py-2 text-sm", isAdmin ? "border-red-500/20 bg-red-950/10 text-red-100" : "border-zinc-800 bg-zinc-900/50 text-zinc-200")}>
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
                        <div className="border-t border-zinc-800 bg-[#111] p-3">
                            {user ? (
                                <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                                    <Input
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder="Send a message..."
                                        disabled={isPending}
                                        className="h-10 rounded-full border-zinc-700 bg-zinc-900 pr-10 text-sm text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-zinc-600 focus-visible:ring-offset-0"
                                    />
                                    <Button
                                        type="submit"
                                        size="icon"
                                        disabled={isPending}
                                        className="h-10 w-10 shrink-0 rounded-lg bg-zinc-700 text-zinc-300 hover:bg-zinc-600 hover:text-white"
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
                                            className="h-10 rounded-full border-zinc-800 bg-zinc-900/50 text-sm placeholder:text-zinc-600 disabled:opacity-100"
                                        />
                                        <Button
                                            disabled
                                            size="icon"
                                            className="absolute right-0 top-0 h-10 w-10 rounded-l-none rounded-r-full bg-zinc-600 opacity-50"
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
                className="group relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#111] border border-zinc-800 shadow-xl transition-all hover:bg-zinc-800 hover:border-zinc-700"
                onClick={() => {
                    if (isOpen && isMinimized) {
                        setIsMinimized(false)
                    } else {
                        setIsOpen(!isOpen)
                    }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-green-500 border-2 border-[#111]"></span>

                {isOpen && !isMinimized ? (
                    <X className="h-8 w-8 text-zinc-400 group-hover:text-white" />
                ) : (
                    <MessageCircle className="h-8 w-8 text-zinc-400 group-hover:text-white" />
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
