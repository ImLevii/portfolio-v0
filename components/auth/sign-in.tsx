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
                    "flex items-center justify-center rounded-xl transition-all duration-300 group relative border",
                    "bg-white/5 border-white/10 hover:bg-white/10",
                    isShop ? "hover:border-green-500/30" : "hover:border-red-500/30",
                    compact ? "h-10 w-10 p-0" : "px-3 py-1.5 gap-2"
                )}
            >
                <LogIn className={cn("h-4 w-4 transition-colors",
                    isShop ? "text-zinc-400 group-hover:text-green-400" : "text-zinc-400 group-hover:text-red-400"
                )} />
                <span
                    className={cn(
                        "font-orbitron font-bold text-xs tracking-wide transition-colors",
                        isShop ? "text-zinc-400 group-hover:text-green-300" : "text-zinc-400 group-hover:text-red-300",
                        compact ? "hidden" : "inline"
                    )}
                >
                    SIGN IN
                </span>
            </div>
        </Link>
    )
}
