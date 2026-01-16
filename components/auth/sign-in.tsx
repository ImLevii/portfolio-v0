import Link from "next/link"
import { LogIn } from "lucide-react"
import { cn } from "@/lib/utils"

export function SignIn({ compact = false, isShop = false }: { compact?: boolean, isShop?: boolean }) {
    const accentColor = isShop ? "text-green-500" : "text-red-500"
    const shadowColor = isShop ? "rgba(34,197,94,0.8)" : "rgba(239,68,68,0.8)"
    const hexColor = isShop ? "#22c55e" : "#ef4444"

    return (
        <Link href="/auth/signin">
            <div
                className={cn(
                    "flex items-center justify-center rounded-md bg-gradient-to-r from-gray-800/60 to-gray-900/60 border border-gray-700/40 backdrop-blur-sm hover:bg-gray-800/80 transition-all duration-300 cursor-pointer group shadow-lg",
                    compact ? "gap-0 sm:gap-3 px-2 sm:px-3 py-2" : "gap-3 px-3 py-1.5"
                )}
                style={{
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.3)'
                }}
            >
                <LogIn className={cn(accentColor, compact ? "h-4 w-4" : "h-5 w-5")} />
                <span
                    className={cn(
                        "relative z-10 uppercase font-bold tracking-wider font-orbitron",
                        compact ? "hidden sm:inline text-[10px]" : "text-[10px] sm:text-xs"
                    )}
                    style={{
                        color: hexColor,
                        textShadow: `0 0 8px ${shadowColor}`,
                        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                    }}
                >
                    SIGN IN
                </span>
            </div>
        </Link>
    )
}
