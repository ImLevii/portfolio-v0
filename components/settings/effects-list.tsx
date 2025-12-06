"use client"

import { useVisualEffectsStore } from "@/store/visual-effects-store"
import { cn } from "@/lib/utils"
import { SoundIcon, VisualIcon, NotificationIcon } from "@/components/settings/settings-icons"
import { motion } from "framer-motion"
import { useState } from "react"
import { SoundSettingsDialog } from "@/components/settings/sound-settings-dialog"
import { VisualSettingsDialog } from "@/components/settings/visual-settings-dialog"

export function EffectsList() {
    const {
        soundEffects, toggleSoundEffects,
        weatherEffects, toggleWeatherEffects,
        notifications, toggleNotifications
    } = useVisualEffectsStore()

    const [isSoundOpen, setIsSoundOpen] = useState(false)
    const [isVisualOpen, setIsVisualOpen] = useState(false)

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            <SettingsWidget
                label="Sound Effects"
                subLabel="Adjust system volume levels"
                isEnabled={soundEffects}
                onToggle={() => setIsSoundOpen(true)}
                Icon={SoundIcon}
            />
            <SettingsWidget
                label="Visual Effects"
                subLabel="Toggle immersive environment"
                isEnabled={weatherEffects}
                onToggle={() => setIsVisualOpen(true)}
                Icon={VisualIcon}
            />
            <SettingsWidget
                label="Notifications"
                subLabel="Manage system alerts"
                isEnabled={notifications}
                onToggle={toggleNotifications}
                Icon={NotificationIcon}
            />

            <SoundSettingsDialog open={isSoundOpen} onOpenChange={setIsSoundOpen} />
            <VisualSettingsDialog open={isVisualOpen} onOpenChange={setIsVisualOpen} />
        </div>
    )
}

function SettingsWidget({
    label,
    subLabel,
    isEnabled,
    onToggle,
    Icon
}: {
    label: string,
    subLabel: string,
    isEnabled: boolean,
    onToggle: () => void,
    Icon: any
}) {
    return (
        <div
            onClick={onToggle}
            className="flex items-center gap-3 px-3 py-2 rounded-md bg-transparent border border-white/20 hover:bg-white/5 transition-all duration-300 cursor-pointer group shadow-lg w-full"
            style={{
                boxShadow: `
                  0 4px 12px rgba(0, 0, 0, 0.3),
                  0 2px 4px rgba(0, 0, 0, 0.2),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                `,
            }}
        >
            {/* Icon */}
            <div className="flex-shrink-0">
                <Icon isActive={isEnabled} size={32} />
            </div>

            {/* Text Content */}
            <div className="flex flex-col flex-1 min-w-0">
                <span
                    className="font-bold text-xs uppercase tracking-wider truncate"
                    style={{
                        color: isEnabled ? '#22c55e' : '#94a3b8',
                        textShadow: `0 0 8px ${isEnabled ? 'rgba(34, 197, 94, 0.8)' : 'rgba(148, 163, 184, 0.2)'}`,
                        filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))'
                    }}
                >
                    {label}
                </span>
                <span
                    className="text-[10px] opacity-80 group-hover:opacity-100 transition-opacity truncate"
                    style={{
                        color: '#e2e8f0',
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                    }}
                >
                    {isEnabled ? 'Click to disable' : 'Click to enable'}
                </span>
            </div>

            {/* Chevron Animation */}
            <motion.div
                className="ml-2 flex-shrink-0 text-gray-400"
                animate={{
                    x: [0, 2, 0],
                    opacity: [0.8, 1, 0.8]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M9 18l6-6-6-6" />
                </svg>
            </motion.div>
        </div>
    )
}
