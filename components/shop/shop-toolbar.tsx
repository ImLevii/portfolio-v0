"use client"

import { Search, SlidersHorizontal, ChevronDown } from "lucide-react"
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
import { motion } from "framer-motion"

interface Category {
    id: string
    name: string
    slug: string
}

interface ShopToolbarProps {
    searchQuery: string
    onSearchChange: (value: string) => void
    categories: Category[]
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
        <div className="mb-8 space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-900/50 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl shadow-xl">
                {/* Search Input */}
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-white transition-colors" />
                    <Input
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-11 bg-transparent border-transparent focus:bg-white/5 text-white placeholder:text-zinc-600 transition-all font-medium h-12 rounded-xl"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto px-2 md:px-0">
                    <div className="h-4 w-[1px] bg-white/10 hidden md:block mx-2" />

                    {/* Sort Dropdown */}
                    <Select value={sortOption} onValueChange={onSortChange}>
                        <SelectTrigger className="w-full md:w-[180px] bg-transparent border-transparent text-zinc-400 hover:text-white focus:ring-0 font-medium h-10 px-3">
                            <span className="text-xs uppercase tracking-wider font-bold text-zinc-600 mr-2">Sort By:</span>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-white/10 text-zinc-300">
                            <SelectItem value="newest">Newest Arrivals</SelectItem>
                            <SelectItem value="price-asc">Price: Low to High</SelectItem>
                            <SelectItem value="price-desc">Price: High to Low</SelectItem>
                            <SelectItem value="name-asc">Name: A-Z</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <Button
                    variant="ghost"
                    onClick={() => onCategoryChange("All")}
                    className={cn(
                        "rounded-full px-6 h-9 font-orbitron text-xs tracking-wider transition-all border relative overflow-hidden",
                        activeCategory === "All"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                            : "bg-zinc-900/50 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                    )}
                >
                    ALL
                </Button>
                {categories.map((category) => (
                    <Button
                        key={category.id}
                        variant="ghost"
                        onClick={() => onCategoryChange(category.name)}
                        className={cn(
                            "rounded-full px-6 h-9 font-orbitron text-xs tracking-wider transition-all border relative overflow-hidden",
                            activeCategory === category.name
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                : "bg-zinc-900/50 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                        )}
                    >
                        {category.name.toUpperCase()}
                    </Button>
                ))}
            </div>
        </div>
    )
}
