"use client"

import { useVisualEffectsStore } from "@/store/visual-effects-store"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Image as ImageIcon, X } from "lucide-react"
import { SettingsButton } from "./settings-button"
import { cn } from "@/lib/utils"

interface SettingsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function VisualSettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
    const {
        weatherEffects,
        toggleWeatherEffects
    } = useVisualEffectsStore()

    const renderToggleButton = (label: string, isActive: boolean, onClick: () => void) => (
        <button
            onClick={onClick}
            className={cn(
                "w-full py-3.5 rounded-md font-bold text-center transition-all text-sm border-2", // Matched snippet border-2
                isActive
                    ? "bg-transparent border-[#22c55e] text-white shadow-[0_0_10px_rgba(34,197,94,0.15)]" // Matched snippet shadow/bg
                    : "bg-transparent border-[#2b303b] text-[#64748b] hover:border-[#383d4a] hover:text-[#94a3b8]"
            )}
        >
            {label}
        </button>
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#171a21] border-[#1e2128] text-white p-0 overflow-hidden max-w-[360px] font-sans [&>button]:hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 px-6 border-b border-white/5">
                    <div className="w-6" />
                    <DialogTitle className="text-white font-bold text-center text-lg tracking-wide">
                        Visual Effects
                    </DialogTitle>
                    <div
                        onClick={() => onOpenChange(false)}
                        className="p-1 rounded-full bg-[#2b303b] hover:bg-[#383d4a] transition-colors cursor-pointer text-gray-400 hover:text-white"
                    >
                        <X size={14} strokeWidth={3} />
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 pb-2 flex flex-col items-center">
                    <div className="w-full bg-[#13151b] h-32 rounded-lg flex items-center justify-center mb-6 border border-white/5 shadow-inner">
                        <div className="w-16 h-16 rounded-full border-2 border-[#374151] flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-[#64748b]" />
                        </div>
                    </div>

                    <p className="text-[#868d96] text-sm text-center font-medium mb-6">
                        Control the effects independently.
                    </p>

                    <div className="w-full space-y-3">
                        {renderToggleButton("Weather Effects", weatherEffects, toggleWeatherEffects)}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 flex gap-3">
                    <SettingsButton
                        label="Confirm"
                        onClick={() => onOpenChange(false)}
                        className="flex-1 bg-green-500/10 text-green-500 border border-green-500/50 hover:bg-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.3)] py-3"
                    />
                    <SettingsButton
                        label="Cancel"
                        onClick={() => onOpenChange(false)}
                        className="flex-1 bg-transparent text-gray-400 border border-gray-800 hover:text-white hover:border-gray-600 hover:bg-white/5 py-3"
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}
