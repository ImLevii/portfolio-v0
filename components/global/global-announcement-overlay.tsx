"use client"

import { playAnnouncementSound } from "@/lib/audio"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Bell } from "lucide-react"
import { getAnnouncement, type AnnouncementConfig } from "@/actions/announcements"

// Simple sound hook
const useNotificationSound = (type: 'notification' | 'alert' | 'none') => {
    const play = () => {
        if (type === 'none') return
        playAnnouncementSound()
    }
    return play
}

export function GlobalAnnouncementOverlay() {
    const [announcement, setAnnouncement] = useState<AnnouncementConfig | null>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Poll for new announcements
        const checkAnnouncement = async () => {
            const latest = await getAnnouncement()
            if (latest && latest.active) {
                const lastSeenStr = localStorage.getItem("lastSeenAnnouncementTime")
                const lastSeen = lastSeenStr ? parseInt(lastSeenStr) : 0

                // If this is a new announcement (newer than what we last saw)
                if (latest.timestamp > lastSeen) {
                    setAnnouncement(latest)
                    setIsVisible(true)

                    // Play sound
                    if (latest.soundType !== 'none') {
                        playAnnouncementSound()
                    }
                }
            } else {
                setIsVisible(false)
            }
        }

        checkAnnouncement()
        const interval = setInterval(checkAnnouncement, 10000) // Poll every 10s

        return () => clearInterval(interval)
    }, [])

    const handleDismiss = () => {
        setIsVisible(false)
        if (announcement) {
            localStorage.setItem("lastSeenAnnouncementTime", announcement.timestamp.toString())
        }
    }

    const getColors = (color: string) => {
        switch (color) {
            case 'green': return { border: 'border-green-500/30', glow: 'shadow-green-500/10', gradient: 'from-green-500 to-emerald-600', text: 'text-green-500', button: 'bg-green-600 hover:bg-green-500' }
            case 'blue': return { border: 'border-cyan-500/30', glow: 'shadow-cyan-500/10', gradient: 'from-cyan-500 to-blue-600', text: 'text-cyan-500', button: 'bg-cyan-600 hover:bg-cyan-500' }
            case 'purple': return { border: 'border-purple-500/30', glow: 'shadow-purple-500/10', gradient: 'from-purple-500 to-violet-600', text: 'text-purple-500', button: 'bg-purple-600 hover:bg-purple-500' }
            case 'red': return { border: 'border-red-500/30', glow: 'shadow-red-500/10', gradient: 'from-red-500 to-rose-600', text: 'text-red-500', button: 'bg-red-600 hover:bg-red-500' }
            case 'orange': return { border: 'border-orange-500/30', glow: 'shadow-orange-500/10', gradient: 'from-orange-500 to-amber-600', text: 'text-orange-500', button: 'bg-orange-600 hover:bg-orange-500' }
            default: return { border: 'border-green-500/30', glow: 'shadow-green-500/10', gradient: 'from-green-500 to-emerald-600', text: 'text-green-500', button: 'bg-green-600 hover:bg-green-500' }
        }
    }

    const colors = announcement ? getColors(announcement.color) : getColors('green')

    return (
        <AnimatePresence>
            {isVisible && announcement && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
                        onClick={handleDismiss}
                    />

                    {/* Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md pointer-events-auto"
                    >
                        <div className={`relative overflow-hidden rounded-2xl bg-[#0a0a0a] border ${colors.border} shadow-2xl ${colors.glow}`}>
                            {/* Decorative Top Line */}
                            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient}`} />

                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-opacity-10 ${colors.text.replace('text', 'bg')}`}>
                                            <Bell className={`h-5 w-5 animate-bounce ${colors.text}`} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white font-orbitron">Announcement</h3>
                                            <p className={`text-xs ${colors.text} opacity-70`}>Broadcast Message</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleDismiss}
                                        className="text-zinc-500 hover:text-white transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {announcement.imageUrl && (
                                    <div className="mb-4 overflow-hidden rounded-lg border border-zinc-800">
                                        <img
                                            src={announcement.imageUrl}
                                            alt="Announcement"
                                            className="w-full h-40 object-cover"
                                        />
                                    </div>
                                )}

                                <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
                                    <p className="text-zinc-200 leading-relaxed text-sm">
                                        {announcement.text}
                                    </p>
                                </div>

                                <button
                                    onClick={handleDismiss}
                                    className={`mt-6 w-full rounded-xl py-3 text-sm font-bold text-white transition-all shadow-lg ${colors.button}`}
                                >
                                    Got it!
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
