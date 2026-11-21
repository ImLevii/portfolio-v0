import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const accents = {
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]",
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.15)]",
    pink: "bg-pink-500/10 text-pink-400 border-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.15)]",
} as const

interface AdminPageHeaderProps {
    title: ReactNode
    description?: ReactNode
    icon?: LucideIcon
    accent?: keyof typeof accents
    /** Buttons or status shown on the right (stacks below the title on small screens) */
    actions?: ReactNode
    /** Renders a back arrow linking here, for detail/edit pages */
    backHref?: string
}

/** Shared header for every admin page so titles, spacing and icon badges stay consistent. */
export function AdminPageHeader({ title, description, icon: Icon, accent = "emerald", actions, backHref }: AdminPageHeaderProps) {
    return (
        <div className="flex flex-col gap-4 border-b border-white/5 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
                {backHref && (
                    <Link
                        href={backHref}
                        aria-label="Back"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                )}
                {Icon && (
                    <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border", accents[accent])}>
                        <Icon className="h-6 w-6" />
                    </div>
                )}
                <div className="min-w-0">
                    <h1 className="truncate font-orbitron text-2xl font-bold tracking-tight text-white neon-text-glow sm:text-3xl">
                        {title}
                    </h1>
                    {description && <div className="mt-1 text-sm text-zinc-400 sm:text-base">{description}</div>}
                </div>
            </div>
            {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
        </div>
    )
}
