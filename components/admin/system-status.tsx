"use client"

import { useEffect, useState } from "react"
import { checkSystemHealth, type SystemHealth } from "@/app/admin/actions"
import { Activity, Wifi, WifiOff, AlertTriangle } from "lucide-react"

export function SystemStatus() {
    const [health, setHealth] = useState<SystemHealth | null>(null)
    const [loading, setLoading] = useState(true)

    const updateHealth = async () => {
        try {
            const data = await checkSystemHealth()
            setHealth(data)
        } catch (error) {
            setHealth({
                status: 'offline',
                latency: 0,
                message: 'Connection Failed',
                timestamp: Date.now()
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        updateHealth()
        const interval = setInterval(updateHealth, 30000) // Check every 30s
        return () => clearInterval(interval)
    }, [])

    if (loading) {
        return (
            <div className="px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-full flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-gray-500 animate-pulse" />
                <span className="text-xs font-mono text-gray-500 animate-pulse">CHECKING STATUS...</span>
            </div>
        )
    }

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'online':
                return {
                    container: "bg-emerald-500/10 border-emerald-500/20",
                    dot: "bg-emerald-500",
                    text: "text-emerald-400",
                    icon: "text-emerald-500"
                }
            case 'degraded':
                return {
                    container: "bg-yellow-500/10 border-yellow-500/20",
                    dot: "bg-yellow-500",
                    text: "text-yellow-400",
                    icon: "text-yellow-500"
                }
            case 'offline':
                return {
                    container: "bg-red-500/10 border-red-500/20",
                    dot: "bg-red-500",
                    text: "text-red-400",
                    icon: "text-red-500"
                }
            default:
                return {
                    container: "bg-gray-500/10 border-gray-500/20",
                    dot: "bg-gray-500",
                    text: "text-gray-400",
                    icon: "text-gray-500"
                }
        }
    }

    const config = getStatusConfig(health?.status || 'offline')

    return (
        <div className={`px-4 py-2 rounded-full flex items-center gap-4 transition-all duration-500 border ${config.container}`}>
            <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                    {health?.status === 'online' && (
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dot}`}></span>
                    )}
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`}></span>
                </span>
                <span className={`text-xs font-mono font-bold uppercase tracking-widest ${config.text}`}>
                    {health?.status === 'online' ? 'SYSTEM ONLINE' : health?.message}
                </span>
            </div>

            {health?.status !== 'offline' && (
                <div className={`hidden sm:flex items-center gap-2 pl-4 border-l ${config.container.split(' ')[1]}`}>
                    <Activity className={`h-3 w-3 ${config.icon}`} />
                    <span className={`text-xs font-mono opacity-80 ${config.text}`}>
                        {health?.latency}ms
                    </span>
                </div>
            )}
        </div>
    )
}
