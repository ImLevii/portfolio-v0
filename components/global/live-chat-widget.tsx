"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send, Minus, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface Message {
    id: string
    text: string
    sender: 'user' | 'agent'
    timestamp: Date
}

export function LiveChatWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hello! I'm Levi's AI assistant. How can I help you today?",
            sender: 'agent',
            timestamp: new Date()
        }
    ])
    const [inputText, setInputText] = useState("")
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Auto-scroll to bottom of chat
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, isOpen])

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!inputText.trim()) return

        const newMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date()
        }

        setMessages(prev => [...prev, newMessage])
        setInputText("")

        // Simulate response (mock)
        setTimeout(() => {
            const responseMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "Thanks for your message! Levi will get back to you soon.",
                sender: 'agent',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, responseMessage])
        }, 1000)
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && !isMinimized && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="mb-4 w-[350px] overflow-hidden rounded-xl border border-cyan-500/50 bg-black/80 backdrop-blur-xl shadow-[0_0_30px_-5px_rgba(6,182,212,0.3)]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-cyan-500/30 bg-cyan-950/30 p-4">
                            <div className="flex items-center gap-2">
                                <div className="relative flex h-3 w-3">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                                    <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"></span>
                                </div>
                                <h3 className="font-orbitron text-sm font-bold tracking-wider text-cyan-100">
                                    LIVE CHAT
                                </h3>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-cyan-400 hover:bg-cyan-900/50 hover:text-cyan-200"
                                    onClick={() => setIsMinimized(true)}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-cyan-400 hover:bg-cyan-900/50 hover:text-cyan-200"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className="h-[400px] flex flex-col">
                            <ScrollArea className="flex-1 p-4">
                                <div className="flex flex-col gap-3">
                                    {messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={cn(
                                                "max-w-[80%] rounded-lg p-3 text-sm",
                                                msg.sender === 'user'
                                                    ? "self-end bg-cyan-600/20 text-cyan-50 border border-cyan-500/30 rounded-br-none"
                                                    : "self-start bg-zinc-800/80 text-zinc-100 border border-white/10 rounded-bl-none"
                                            )}
                                        >
                                            {msg.text}
                                        </div>
                                    ))}
                                    <div ref={scrollRef} />
                                </div>
                            </ScrollArea>

                            {/* Input Area */}
                            <form onSubmit={handleSendMessage} className="border-t border-cyan-500/30 p-4 bg-black/40">
                                <div className="flex gap-2">
                                    <Input
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder="Type a message..."
                                        className="bg-black/50 border-cyan-500/30 focus-visible:ring-cyan-500/50 text-cyan-50 placeholder:text-cyan-500/40"
                                    />
                                    <Button
                                        type="submit"
                                        size="icon"
                                        className="bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] border border-cyan-400/50"
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-black border-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)] transition-all hover:scale-110 hover:shadow-[0_0_30px_rgba(6,182,212,0.8)]"
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
                <span className="absolute inset-0 rounded-full bg-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity blur-md" />
                {isOpen && !isMinimized ? (
                    <X className="h-7 w-7 text-cyan-400 group-hover:text-cyan-200 transition-colors" />
                ) : (
                    <MessageCircle className="h-7 w-7 text-cyan-400 group-hover:text-cyan-200 transition-colors" />
                )}

                {/* Notification Badge (mock) */}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg animate-bounce">
                        1
                    </span>
                )}
            </motion.button>
        </div>
    )
}
