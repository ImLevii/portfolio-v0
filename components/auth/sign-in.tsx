import Link from "next/link"
import { LogIn } from "lucide-react"
import { cn } from "@/lib/utils"

export function SignIn({ compact = false }: { compact?: boolean }) {
    return (
        <Link href="/auth/signin">
            <div
                className={cn(
                    "flex items-center gap-3 rounded-md bg-white/10 border border-white/20 backdrop-blur-md hover:bg-white/15 transition-all duration-300 cursor-pointer group shadow-lg",
                    compact ? "px-3 py-2" : "px-3 py-1.5"
                )}
                style={{
                    boxShadow: `
            0 4px 12px rgba(0, 0, 0, 0.3),
            0 2px 4px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            inset 0 -1px 0 rgba(0, 0, 0, 0.1)
          `,
                    backdropFilter: 'blur(16px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(16px) saturate(180%)'
                }}
            >
                <LogIn className={cn("text-green-500", compact ? "h-4 w-4" : "h-4 w-4")} />
                <div className="flex flex-col">
                    <span
                        className={cn(
                            "font-bold uppercase tracking-wider",
                            compact ? "text-[10px]" : "text-xs"
                        )}
                        style={{
                            color: '#22c55e',
                            textShadow: '0 0 8px rgba(34, 197, 94, 0.8)',
                            filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))'
                        }}
                    >
                        SIGN IN
                    </span>
                    {!compact && (
                        <span
                            className="text-[10px] opacity-80 group-hover:opacity-100 transition-opacity"
                            style={{
                                color: '#e2e8f0',
                                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                            }}
                        >
                            Access Account
                        </span>
                    )}
                </div>
            </div>
        </Link>
    )
}
