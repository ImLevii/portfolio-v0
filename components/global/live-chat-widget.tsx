"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send, Minus, Users, ThumbsUp, ThumbsDown, Heart, Reply, Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface ChatMessage {
    id: string
    type: 'system' | 'user'
    text: string
    sender?: {
        name: string
        avatar?: string
        isUser?: boolean
    }
    timestamp: string
    reactions?: {
        likes: number
        dislikes: number
        hearts: number
    }
}

export function LiveChatWidget({ user }: { user?: any }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)

    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'sys-1',
            type: 'system',
            text: "Ahoy! Welcome aboard our streaming ship, matey! ⚓ Say hello to **VEE**! 👋",
            timestamp: "01:26 PM"
        },
        {
            id: 'msg-1',
            type: 'user',
            text: "movies like if bale street could talk",
            sender: {
                name: "squirr",
                isUser: true, // Simulate "user" badge
                avatar: "/placeholder-user.jpg"
            },
            timestamp: "01:47 PM",
            reactions: { likes: 0, dislikes: 0, hearts: 0 }
        },
        {
            id: 'sys-2',
            type: 'system',
            text: "🎨 Welcome to the greatest streaming community!",
            timestamp: "03:56 PM"
        }
    ])

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

        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'user',
            text: inputText,
            sender: {
                name: user?.name || "Guest",
                avatar: user?.image,
                isUser: true
            },
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            reactions: { likes: 0, dislikes: 0, hearts: 0 }
        }

        setMessages(prev => [...prev, newMessage])
        setInputText("")
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
                                    <span>96</span>
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
                        <div className="border-b border-blue-900/30 bg-blue-950/10 p-4">
                            <div className="flex items-center justify-center rounded-lg border border-blue-500/20 bg-black/40 p-2">
                                <img
                                    src="/placeholder-logo.png"
                                    alt="Pinned Content"
                                    className="h-12 w-auto object-contain opacity-80"
                                />
                            </div>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 bg-[#050505] p-4">
                            <div className="flex flex-col gap-4">
                                {messages.map((msg) => (
                                    <div key={msg.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        {msg.type === 'system' ? (
                                            <div className="rounded-xl border border-amber-500/20 bg-amber-950/10 p-3 text-center">
                                                <div className="mb-1 flex items-center justify-center gap-2 text-xs font-semibold text-amber-500">
                                                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                                                    System
                                                    <span className="text-[10px] font-normal text-amber-500/70 ml-auto">{msg.timestamp}</span>
                                                </div>
                                                <p className="text-sm leading-relaxed text-amber-200/90">
                                                    {parseText(msg.text)}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="group">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Avatar className="h-8 w-8 border border-zinc-700">
                                                        <AvatarImage src={msg.sender?.avatar} />
                                                        <AvatarFallback className="bg-zinc-800 text-xs text-zinc-400">
                                                            {msg.sender?.name?.slice(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-sm font-bold text-white">{msg.sender?.name}</span>
                                                        {msg.sender?.isUser && (
                                                            <span className="rounded-full bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-medium text-blue-400 border border-blue-500/30">
                                                                user
                                                            </span>
                                                        )}
                                                        <span className="text-[10px] text-zinc-500">{msg.timestamp}</span>
                                                    </div>
                                                </div>

                                                <div className="ml-10">
                                                    <div className="rounded-2xl rounded-tl-sm border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm text-zinc-200">
                                                        {msg.text}
                                                    </div>

                                                    {/* Reaction Bar */}
                                                    <div className="mt-1 flex items-center gap-4 px-2 opacity-50 transition-opacity group-hover:opacity-100">
                                                        <button className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors">
                                                            <ThumbsUp className="h-3 w-3" /> {msg.reactions?.likes}
                                                        </button>
                                                        <button className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors">
                                                            <ThumbsDown className="h-3 w-3" /> {msg.reactions?.dislikes}
                                                        </button>
                                                        <button className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors">
                                                            <Heart className="h-3 w-3" /> {msg.reactions?.hearts}
                                                        </button>
                                                        <button className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors ml-auto">
                                                            <Reply className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
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
                                        className="h-10 rounded-full border-zinc-700 bg-zinc-900 pr-10 text-sm text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-zinc-600 focus-visible:ring-offset-0"
                                    />
                                    <Button
                                        type="submit"
                                        size="icon"
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
                className="group relative flex h-12 w-12 items-center justify-center rounded-xl bg-[#111] border border-zinc-800 shadow-xl transition-all hover:bg-zinc-800 hover:border-zinc-700"
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
                <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-green-500 border-2 border-[#111]"></span>

                {isOpen && !isMinimized ? (
                    <X className="h-5 w-5 text-zinc-400 group-hover:text-white" />
                ) : (
                    <MessageCircle className="h-5 w-5 text-zinc-400 group-hover:text-white" />
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
