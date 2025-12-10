"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Megaphone, Bell } from "lucide-react"
import { getAnnouncement, type AnnouncementConfig } from "@/actions/announcements"

// Simple sound hook
const useNotificationSound = (type: 'notification' | 'alert' | 'none') => {
    const play = () => {
        if (type === 'none') return
        // Using a public placeholder sound or browser API would be ideal.
        // For now, let's assume we have a simple beep or use a data URI for a tiny blip.
        // A simple "glass ping" sound data URI (shortened for brevity, use real file in prod)
        // This is a placeholder; in real app, user should provide "/sounds/notification.mp3"
        // I will attempt to play a standard HTML5 audio if file exists, else silent.
        const audio = new Audio('/sounds/notification.mp3') // Assuming user has this or I need to create it. 
        // fallback to silent for now to avoid errors if file missing.
        audio.play().catch(e => console.log("Audio play failed (user interaction needed first usually):", e))
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
                        const audio = new Audio(latest.soundType === 'alert'
                            ? 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' // Alert
                            : 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3') // Notification (using same placeholder)
                        audio.volume = 0.5
                        audio.play().catch(() => { })
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
                        <div className="relative overflow-hidden rounded-2xl bg-[#0a0a0a] border border-cyan-500/30 shadow-2xl shadow-cyan-500/10">
                            {/* Decorative Top Line */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-600" />

                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-500">
                                            <Bell className="h-5 w-5 animate-bounce" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white font-orbitron">Announcement</h3>
                                            <p className="text-xs text-cyan-400/70">Broadcast Message</p>
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
                                    className="mt-6 w-full rounded-xl bg-cyan-600 py-3 text-sm font-bold text-white hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-500/20"
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
