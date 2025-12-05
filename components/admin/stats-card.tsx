import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    trend?: string
    color: "emerald" | "blue" | "purple" | "orange"
}

export function StatsCard({ title, value, icon: Icon, trend, color }: StatsCardProps) {
    const colorStyles = {
        emerald: {
            text: "text-emerald-500",
            bg: "bg-emerald-500/10",
            border: "group-hover:border-emerald-500/30",
            shadow: "group-hover:shadow-emerald-500/20",
            gradient: "from-emerald-500",
            textHover: "group-hover:text-emerald-400",
            iconBgHover: "group-hover:bg-emerald-500",
        },
        blue: {
            text: "text-blue-500",
            bg: "bg-blue-500/10",
            border: "group-hover:border-blue-500/30",
            shadow: "group-hover:shadow-blue-500/20",
            gradient: "from-blue-500",
            textHover: "group-hover:text-blue-400",
            iconBgHover: "group-hover:bg-blue-500",
        },
        purple: {
            text: "text-purple-500",
            bg: "bg-purple-500/10",
            border: "group-hover:border-purple-500/30",
            shadow: "group-hover:shadow-purple-500/20",
            gradient: "from-purple-500",
            textHover: "group-hover:text-purple-400",
            iconBgHover: "group-hover:bg-purple-500",
        },
        orange: {
            text: "text-orange-500",
            bg: "bg-orange-500/10",
            border: "group-hover:border-orange-500/30",
            shadow: "group-hover:shadow-orange-500/20",
            gradient: "from-orange-500",
            textHover: "group-hover:text-orange-400",
            iconBgHover: "group-hover:bg-orange-500",
        },
    }

    const styles = colorStyles[color]

    return (
        <div className={cn(
            "relative overflow-hidden rounded-xl border border-gray-800/60 bg-black/40 p-6 backdrop-blur-xl transition-all duration-300 group hover:scale-[1.02]",
            styles.border,
            styles.shadow
        )}>
            {/* Top Gradient Line */}
            <div className={cn(
                "absolute top-0 left-0 w-full h-1 bg-gradient-to-r to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-300",
                styles.gradient
            )} />

            {/* Inner Glow */}
            <div className={cn(
                "absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            )} />

            <div className="relative z-10 flex items-center justify-between mb-4">
                <h3 className={cn("text-sm font-medium text-gray-400 transition-colors font-orbitron", styles.textHover)}>
                    {title}
                </h3>
                <div className={cn(
                    "p-2 rounded-lg transition-colors shadow-inner",
                    styles.bg,
                    styles.text,
                    styles.iconBgHover,
                    "group-hover:text-white"
                )}>
                    <Icon className="h-4 w-4" />
                </div>
            </div>

            <div className="relative z-10">
                <div className="text-2xl font-bold text-white font-orbitron tracking-wide">
                    {value}
                </div>
                {trend && (
                    <p className="text-xs text-gray-500 mt-1 font-mono">
                        {trend}
                    </p>
                )}
            </div>
        </div>
    )
}
