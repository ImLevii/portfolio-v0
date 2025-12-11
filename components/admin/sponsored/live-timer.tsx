"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"

interface LiveTimerProps {
    frequency: number // in minutes
}

export function LiveTimer({ frequency }: LiveTimerProps) {
    const [timeLeft, setTimeLeft] = useState(frequency * 60) // seconds

    useEffect(() => {
        // Reset timer if frequency changes
        setTimeLeft(frequency * 60)
    }, [frequency])

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 0) {
                    return frequency * 60 // Reset loop
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [frequency])

    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60

    return (
        <div className="bg-zinc-950/50 rounded-md p-2 border border-white/5 flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-zinc-500 animate-pulse" />
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Cycle</span>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
        </div>
    )
}
