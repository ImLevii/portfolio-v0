"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface SponsoredMessageProps {
    title: string
    description: string
    imageUrl?: string | null
    linkUrl?: string | null
    time?: string
}

export function SponsoredMessageCard({ title, description, imageUrl, linkUrl, time }: SponsoredMessageProps) {
    return (
        <div className="mx-4 my-2 overflow-hidden rounded-xl border border-blue-500/20 bg-blue-950/20 p-4 shadow-[0_0_15px_rgba(59,130,246,0.1)] backdrop-blur-md">
            {/* Header */}
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_5px_rgba(59,130,246,0.8)]" />
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Sponsored</span>
                </div>
                {time && <span className="text-[10px] text-blue-500/60 font-medium">{time}</span>}

                {linkUrl && (
                    <Link
                        href={linkUrl}
                        target="_blank"
                        className="flex items-center gap-1 rounded-lg bg-blue-500/10 px-2 py-1 text-[10px] font-bold text-blue-400 transition-all hover:bg-blue-500 hover:text-white"
                    >
                        Visit Link
                        <ArrowRight className="h-3 w-3" />
                    </Link>
                )}
            </div>

            {/* Content */}
            <div className="space-y-3">
                <h4 className="text-sm font-bold text-white">{title}</h4>
                <p className="text-xs text-blue-200/80 leading-relaxed">
                    {description}
                </p>

                {imageUrl && (
                    <div className="mt-2 relative w-full h-32 rounded-lg overflow-hidden border border-blue-500/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={imageUrl}
                            alt={title}
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
