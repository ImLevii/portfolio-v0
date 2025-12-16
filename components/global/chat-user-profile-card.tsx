"use client"

import { useEffect, useState } from "react"
import { getChatUserProfile } from "@/actions/chat"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessagesSquare, ThumbsUp, ThumbsDown, Heart, Calendar, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatUserProfileCardProps {
    userId: string
    name: string
    initialRole: string
}

export function ChatUserProfileCard({ userId, name, initialRole }: ChatUserProfileCardProps) {
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProfile = async () => {
            const data = await getChatUserProfile(userId)
            setProfile(data)
            setLoading(false)
        }
        fetchProfile()
    }, [userId])

    if (loading) {
        return (
            <div className="w-64 p-4 bg-[#111] border border-zinc-800 rounded-xl shadow-xl flex flex-col gap-3 animate-pulse">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-zinc-800" />
                    <div className="flex flex-col gap-1.5 flex-1">
                        <div className="h-3 w-2/3 bg-zinc-800 rounded" />
                        <div className="h-2 w-1/3 bg-zinc-800 rounded" />
                    </div>
                </div>
                <div className="h-16 bg-zinc-800 rounded-lg" />
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="w-64 p-4 bg-[#111] border border-zinc-800 rounded-xl shadow-xl text-center text-zinc-500 text-xs">
                Profile not found
            </div>
        )
    }

    const { stats, role, createdAt, image } = profile
    const displayRole = role || initialRole || "USER"

    // Role styling
    const isOwner = displayRole === "OWNER"
    const isAdmin = displayRole === "ADMIN" || displayRole === "Admin"
    const isSupport = displayRole === "SUPPORT" || displayRole === "Support"

    return (
        <div className="w-72 bg-[#0a0a0a] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header / Banner */}
            <div className={cn("h-20 w-full relative",
                isOwner ? "bg-gradient-to-r from-amber-600/20 to-yellow-600/20" :
                    isAdmin ? "bg-gradient-to-r from-red-600/20 to-red-900/20" :
                        isSupport ? "bg-gradient-to-r from-emerald-600/20 to-emerald-900/20" :
                            "bg-zinc-900/50"
            )}>
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10" />
            </div>

            <div className="px-5 pb-5 -mt-10 relative z-10 flex flex-col gap-3">

                <div className="flex justify-between items-end">
                    <Avatar className={cn("h-20 w-20 border-4 border-[#0a0a0a] shadow-lg",
                        isOwner ? "ring-2 ring-amber-500/50" :
                            isAdmin ? "ring-2 ring-red-500/50" :
                                isSupport ? "ring-2 ring-emerald-500/50" :
                                    "ring-1 ring-zinc-800"
                    )}>
                        <AvatarImage src={image || undefined} />
                        <AvatarFallback className="bg-zinc-900 text-zinc-400 text-lg font-bold">
                            {name?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    <div className={cn("px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border shadow-lg backdrop-blur-md",
                        isOwner ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                            isAdmin ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                isSupport ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                    "bg-zinc-800/50 text-zinc-400 border-zinc-700/50"
                    )}>
                        {displayRole}
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        {name}
                        {isAdmin && <ShieldCheck className="h-4 w-4 text-red-500" />}
                        {isSupport && <ShieldCheck className="h-4 w-4 text-emerald-500" />}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-0.5">
                        <Calendar className="h-3 w-3" />
                        <span>Joined {new Date(createdAt).toLocaleDateString()}</span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="flex items-center gap-3 p-2 bg-zinc-900/50 rounded-lg border border-white/5">
                        <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <MessagesSquare className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-zinc-200">{stats.messagesSent}</span>
                            <span className="text-[10px] text-zinc-500 uppercase font-bold">Messages</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-2 bg-zinc-900/50 rounded-lg border border-white/5">
                        <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                            <ThumbsUp className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-zinc-200">{stats.likesReceived}</span>
                            <span className="text-[10px] text-zinc-500 uppercase font-bold">Likes</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-2 bg-zinc-900/50 rounded-lg border border-white/5">
                        <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                            <ThumbsDown className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-zinc-200">{stats.dislikesReceived || 0}</span>
                            <span className="text-[10px] text-zinc-500 uppercase font-bold">Dislikes</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-2 bg-zinc-900/50 rounded-lg border border-white/5">
                        <div className="h-8 w-8 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500">
                            <Heart className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-zinc-200">{stats.heartsReceived}</span>
                            <span className="text-[10px] text-zinc-500 uppercase font-bold">Hearts</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
