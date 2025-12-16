"use client"

import { toast } from "sonner"
import { motion } from "framer-motion"
import { X, Check, Loader2, Terminal } from "lucide-react"

// --- Custom Icons matching the 'Terminal' aesthetic ---

const TerminalIconBase = ({ color, children, className }: { color: string, children: React.ReactNode, className?: string }) => (
    <div className={`relative w-8 h-8 flex items-center justify-center rounded bg-${color}-500/10 border border-${color}-500/20 ${className}`}>
        {/* Corner accents */}
        <div className={`absolute top-0 left-0 w-1 h-1 border-t border-l border-${color}-500/50 rounded-tl-[1px]`} />
        <div className={`absolute top-0 right-0 w-1 h-1 border-t border-r border-${color}-500/50 rounded-tr-[1px]`} />
        <div className={`absolute bottom-0 left-0 w-1 h-1 border-b border-l border-${color}-500/50 rounded-bl-[1px]`} />
        <div className={`absolute bottom-0 right-0 w-1 h-1 border-b border-r border-${color}-500/50 rounded-br-[1px]`} />

        {children}

        {/* Glow */}
        <div className={`absolute inset-0 bg-${color}-500/5 rounded blur-sm`} />
    </div>
)

const LoadingIcon = () => (
    <div className="relative w-8 h-8 flex items-center justify-center rounded bg-cyan-500/10 border border-cyan-500/20">
        <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-cyan-500/50 rounded-tl-[1px]" />
        <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-cyan-500/50 rounded-tr-[1px]" />
        <div className="absolute bottom-0 left-0 w-1 h-1 border-b border-l border-cyan-500/50 rounded-bl-[1px]" />
        <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-cyan-500/50 rounded-br-[1px]" />

        <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />
    </div>
)

const SuccessIcon = () => (
    <div className="relative w-8 h-8 flex items-center justify-center rounded bg-emerald-500/10 border border-emerald-500/20">
        <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-emerald-500/50 rounded-tl-[1px]" />
        <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-emerald-500/50 rounded-tr-[1px]" />
        <div className="absolute bottom-0 left-0 w-1 h-1 border-b border-l border-emerald-500/50 rounded-bl-[1px]" />
        <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-emerald-500/50 rounded-br-[1px]" />

        <Check className="w-4 h-4 text-emerald-500" />
    </div>
)

const ErrorIcon = () => (
    <div className="relative w-8 h-8 flex items-center justify-center rounded bg-red-500/10 border border-red-500/20">
        <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-red-500/50 rounded-tl-[1px]" />
        <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-red-500/50 rounded-tr-[1px]" />
        <div className="absolute bottom-0 left-0 w-1 h-1 border-b border-l border-red-500/50 rounded-bl-[1px]" />
        <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-red-500/50 rounded-br-[1px]" />

        <X className="w-4 h-4 text-red-500" />
    </div>
)

// --- Toast Component ---

interface ToastProps {
    type: 'loading' | 'success' | 'error'
    title: string
    message?: string
    t: string | number
}

const TerminalToast = ({ type, title, message, t }: ToastProps) => {
    let Icon = LoadingIcon
    let borderColor = 'border-cyan-500/20'
    let glowColor = 'shadow-cyan-500/10'
    let TitleColor = 'text-cyan-500'

    if (type === 'success') {
        Icon = SuccessIcon
        borderColor = 'border-emerald-500/20'
        glowColor = 'shadow-emerald-500/10'
        TitleColor = 'text-emerald-500'
    } else if (type === 'error') {
        Icon = ErrorIcon
        borderColor = 'border-red-500/20'
        glowColor = 'shadow-red-500/10'
        TitleColor = 'text-red-500'
    }

    return (
        <div className={`
            relative w-full overflow-hidden rounded-md border ${borderColor} bg-zinc-950 p-4 shadow-lg ${glowColor}
            font-mono
        `}>
            {/* Scanline background effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 pointer-events-none opacity-20 bg-[length:100%_4px,3px_100%]" />

            <div className="relative z-10 flex items-start gap-4">
                <Icon />
                <div className="flex-1 flex flex-col gap-1">
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${TitleColor}`}>
                        {title}
                    </h3>
                    {message && (
                        <p className="text-sm text-zinc-400 leading-relaxed">
                            {message}
                        </p>
                    )}
                </div>

                {/* Close Button if interactive? - Sonner handles this usually or we can rely on auto-dismiss */}
            </div>
        </div>
    )
}

// --- Helper Function ---

export const showTerminalToast = {
    loading: (title: string, message?: string) => {
        return toast.custom((t) => <TerminalToast type="loading" title={title} message={message} t={t} />, { duration: Infinity })
    },
    success: (title: string, message?: string, id?: string | number) => {
        if (id) toast.dismiss(id)
        return toast.custom((t) => <TerminalToast type="success" title={title} message={message} t={t} />)
    },
    error: (title: string, message?: string, id?: string | number) => {
        if (id) toast.dismiss(id)
        return toast.custom((t) => <TerminalToast type="error" title={title} message={message} t={t} />)
    },
    dismiss: (id: string | number) => toast.dismiss(id)
}
