"use client"

import { Search, SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface ShopToolbarProps {
    searchQuery: string
    onSearchChange: (value: string) => void
    categories: string[]
    activeCategory: string
    onCategoryChange: (category: string) => void
    sortOption: string
    onSortChange: (value: string) => void
}

export function ShopToolbar({
    searchQuery,
    onSearchChange,
    categories,
    activeCategory,
    onCategoryChange,
    sortOption,
    onSortChange
}: ShopToolbarProps) {
    return (
        <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-black/40 p-4 rounded-xl border border-white/5 backdrop-blur-md">
                {/* Search Input */}
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-green-500 transition-colors" />
                    <Input
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9 bg-black/20 border-white/10 focus:border-green-500/50 focus:ring-green-500/20 text-white placeholder:text-gray-600 transition-all font-orbitron tracking-wide"
                    />
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    {/* Sort Dropdown */}
                    <Select value={sortOption} onValueChange={onSortChange}>
                        <SelectTrigger className="w-full md:w-[200px] bg-black/20 border-white/10 text-gray-300 focus:ring-green-500/20 font-orbitron text-xs font-bold tracking-wider">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent className="bg-black/95 border-white/10 text-gray-300">
                            <SelectItem value="newest" className="focus:bg-green-500/20 focus:text-green-400 cursor-pointer font-orbitron text-xs">NEWEST ARRIVALS</SelectItem>
                            <SelectItem value="price-asc" className="focus:bg-green-500/20 focus:text-green-400 cursor-pointer font-orbitron text-xs">PRICE: LOW TO HIGH</SelectItem>
                            <SelectItem value="price-desc" className="focus:bg-green-500/20 focus:text-green-400 cursor-pointer font-orbitron text-xs">PRICE: HIGH TO LOW</SelectItem>
                            <SelectItem value="name-asc" className="focus:bg-green-500/20 focus:text-green-400 cursor-pointer font-orbitron text-xs">NAME: A-Z</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCategoryChange("All")}
                    className={cn(
                        "rounded-full px-4 h-8 font-orbitron text-[10px] tracking-wide transition-all border",
                        activeCategory === "All"
                            ? "bg-green-500/10 text-green-400 border-green-500/30 shadow-[0_0_10px_-2px_rgba(34,197,94,0.3)] hover:bg-green-500/20"
                            : "bg-transparent border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5"
                    )}
                >
                    ALL
                </Button>
                {categories.map((category) => (
                    <Button
                        key={category}
                        variant="ghost"
                        size="sm"
                        onClick={() => onCategoryChange(category)}
                        className={cn(
                            "rounded-full px-4 h-8 font-orbitron text-[10px] tracking-wide transition-all border",
                            activeCategory === category
                                ? "bg-green-500/10 text-green-400 border-green-500/30 shadow-[0_0_10px_-2px_rgba(34,197,94,0.3)] hover:bg-green-500/20"
                                : "bg-transparent border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5"
                        )}
                    >
                        {category.toUpperCase()}
                    </Button>
                ))}
            </div>
        </div>
    )
}
