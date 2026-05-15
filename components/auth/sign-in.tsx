import Link from "next/link"
import { LogIn } from "lucide-react"
import { cn } from "@/lib/utils"

export function SignIn({ compact = false, isShop = false }: { compact?: boolean, isShop?: boolean }) {
    const shadowColor = isShop ? "rgba(34,197,94,0.8)" : "rgba(239,68,68,0.8)"
    const hexColor = isShop ? "#22c55e" : "#ef4444"

    return (
        <Link href="/auth/signin">
            <div
                className={cn(
                    "relative flex items-center justify-center rounded-md bg-white/10 border border-white/20 backdrop-blur-md hover:bg-white/15 transition-all duration-300 cursor-pointer group shadow-lg",
                    "min-h-[40px] min-w-[40px]",
                    compact ? "gap-0 sm:gap-2 px-2.5 sm:px-3" : "gap-2 px-3"
                )}
                style={{
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1)',
                    backdropFilter: 'blur(16px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(16px) saturate(180%)'
                }}
            >
                <LogIn
                    className="h-[18px] w-[18px] sm:h-5 sm:w-5 flex-shrink-0"
                    style={{ color: hexColor, filter: `drop-shadow(0 0 6px ${shadowColor})` }}
                />
                <span
                    className={cn(
                        "relative z-10 uppercase font-bold tracking-wider font-orbitron text-[10px] sm:text-xs",
                        compact ? "hidden sm:inline" : ""
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
