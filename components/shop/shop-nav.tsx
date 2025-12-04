"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ShopNavProps {
    categories: string[]
    activeCategory: string
    onSelectCategory: (category: string) => void
}

export function ShopNav({ categories, activeCategory, onSelectCategory }: ShopNavProps) {
    return (
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2 md:gap-4">
            <Button
                variant="ghost"
                onClick={() => onSelectCategory("All")}
                className={cn(
                    "rounded-full px-6 font-orbitron tracking-wide transition-all",
                    activeCategory === "All"
                        ? "bg-green-500/20 text-green-400 shadow-[0_0_15px_-3px_rgba(34,197,94,0.4)] hover:bg-green-500/30 hover:text-green-300"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                )}
            >
                All
            </Button>
            {categories.map((category) => (
                <Button
                    key={category}
                    variant="ghost"
                    onClick={() => onSelectCategory(category)}
                    className={cn(
                        "rounded-full px-6 font-orbitron tracking-wide transition-all",
                        activeCategory === category
                            ? "bg-green-500/20 text-green-400 shadow-[0_0_15px_-3px_rgba(34,197,94,0.4)] hover:bg-green-500/30 hover:text-green-300"
                            : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    )}
                >
                    {category}
                </Button>
            ))}
        </div>
    )
}
