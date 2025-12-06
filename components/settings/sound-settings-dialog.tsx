"use client"

import * as React from "react"
import { useVisualEffectsStore } from "@/store/visual-effects-store"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { Volume2, X } from "lucide-react"
import { SettingsButton } from "./settings-button"
import { cn } from "@/lib/utils"

// Custom Slider (Neon Green Square Thumb)
const Slider = React.forwardRef<
    React.ElementRef<typeof SliderPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
    <SliderPrimitive.Root
        ref={ref}
        className={cn(
            "relative flex w-full touch-none select-none items-center",
            className
        )}
        {...props}
    >
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-[#2b303b]">
            <SliderPrimitive.Range className="absolute h-full bg-[#22c55e]" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-[4px] border-none bg-[#22c55e] shadow-[0_0_10px_rgba(34,197,94,0.6)] ring-offset-background transition-all duration-300 hover:scale-110 hover:shadow-[0_0_15px_rgba(34,197,94,0.8)] active:scale-95 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50" />
    </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

interface SettingsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SoundSettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
    const {
        generalVolume,
        soundtrackVolume,
        setGeneralVolume,
        setSoundtrackVolume,
        resetSoundToDefault
    } = useVisualEffectsStore()

    const renderSlider = (label: string, value: number, setValue: (val: number) => void) => (
        <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
                <span className="text-[#868d96] font-bold">{label}</span>
                <span className="text-white font-bold" style={{ textShadow: "0 0 10px rgba(34,197,94,0.5)" }}>{value} %</span>
            </div>
            <Slider
                defaultValue={[value]}
                value={[value]}
                onValueChange={(vals) => setValue(vals[0])}
                max={100}
                step={1}
            />
        </div>
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#171a21] border-[#1e2128] text-white p-0 overflow-hidden max-w-[360px] font-sans [&>button]:hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 px-6 border-b border-white/5">
                    <div className="w-6" />
                    <DialogTitle className="text-white font-bold text-center text-lg tracking-wide">
                        Sound Effects
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
                        <div className="w-16 h-16 rounded-full border-2 border-[#374151] flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                            <Volume2 className="w-8 h-8 text-[#64748b]" />
                        </div>
                    </div>

                    <div className="text-center mb-8 space-y-1">
                        <p className="text-[#868d96] text-sm font-medium">
                            Control the effects independently.
                        </p>
                        <p className="text-[#868d96] text-sm font-medium">
                            Click <button onClick={resetSoundToDefault} className="underline hover:text-white transition-colors cursor-pointer">HERE</button> to reset the values to default.
                        </p>
                    </div>

                    <div className="w-full space-y-6 px-1">
                        {renderSlider("General", generalVolume, setGeneralVolume)}
                        {renderSlider("Soundtrack", soundtrackVolume, setSoundtrackVolume)}
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
