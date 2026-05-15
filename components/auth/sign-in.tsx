import Link from "next/link"
import { LogIn } from "lucide-react"
import { cn } from "@/lib/utils"

export function SignIn({ compact = false, isShop = false }: { compact?: boolean, isShop?: boolean }) {
    const accentColor = isShop ? "text-green-400" : "text-red-400"
    const shadowColor = isShop ? "rgba(34,197,94,0.75)" : "rgba(239,68,68,0.75)"
    const hexColor = isShop ? "#22c55e" : "#ef4444"
    const hoverBorder = isShop
        ? "hover:border-green-500/40 hover:shadow-[0_0_0_1px_rgba(34,197,94,0.08),0_4px_20px_rgba(0,0,0,0.45)]"
        : "hover:border-red-500/40 hover:shadow-[0_0_0_1px_rgba(239,68,68,0.08),0_4px_20px_rgba(0,0,0,0.45)]"

    return (
        <Link href="/auth/signin">
            <div
                className={cn(
                    "relative flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer group",
                    "min-h-[40px] min-w-[40px]",
                    "bg-white/[0.04] border border-white/[0.1] backdrop-blur-md",
                    "hover:bg-white/[0.07]",
                    hoverBorder,
                    "shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_4px_12px_rgba(0,0,0,0.3)]",
                    compact ? "gap-0 sm:gap-2 px-2.5 sm:px-3.5" : "gap-2 px-3.5"
                )}
            >
                <LogIn className={cn(accentColor, "h-[18px] w-[18px] sm:h-5 sm:w-5 flex-shrink-0")} />
                <span
                    className={cn(
                        "relative z-10 uppercase font-bold tracking-wider font-orbitron",
                        compact ? "hidden sm:inline text-[10px]" : "text-[10px] sm:text-[11px]"
                    )}
                    style={{
                        color: hexColor,
                        textShadow: `0 0 10px ${shadowColor}`,
                    }}
                >
                    SIGN IN
                </span>
            </div>
        </Link>
    )
}
