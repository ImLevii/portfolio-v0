"use client"

import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface SettingsButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label: string
    icon?: any
    loading?: boolean
}

export function SettingsButton({
    label,
    icon: Icon,
    loading,
    className,
    disabled,
    ...props
}: SettingsButtonProps) {
    return (
        <button
            disabled={disabled || loading}
            className={cn(
                // Default styles from your uploaded file
                "flex items-center gap-3 px-3 py-1.5 rounded-md bg-gradient-to-r from-gray-800/60 to-gray-900/60 border border-gray-700/40 backdrop-blur-sm hover:bg-gray-800/80 transition-all duration-300 cursor-pointer group font-bold text-base text-white relative shadow-lg justify-center",
                (disabled || loading) && "opacity-50 cursor-not-allowed",
                className
            )}
            // Default shadow styles
            style={{
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.3)'
            }}
            {...props}
        >
            {Icon && !loading && (
                <div className="mr-2 text-gray-400 group-hover:text-white transition-colors">
                    <Icon size={18} />
                </div>
            )}

            {loading && (
                <Loader2 size={18} className="mr-2 animate-spin text-gray-400" />
            )}

            <span className="font-bold text-sm uppercase tracking-wide">
                {label}
            </span>
        </button>
    )
}