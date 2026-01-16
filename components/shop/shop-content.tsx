"use client"

import { useState } from "react"
import { ProductCard } from "@/components/shop/product-card"
import { ShopCarousel } from "@/components/shop/shop-carousel"
import { ShopToolbar } from "@/components/shop/shop-toolbar"
import { motion, AnimatePresence } from "framer-motion"

interface Product {
    id: string
    name: string
    description: string
    price: number
    image: string
    category: string
    stock: number
    features: string // JSON string
}

interface Category {
    id: string
    name: string
    slug: string
}

interface ShopContentProps {
    products: Product[]
    categories: Category[]
    title?: string
    description?: string
    showCarousel?: boolean
    showCategoryFilter?: boolean
    headerContent?: React.ReactNode
    categoryImage?: string | null
    initialCategory?: string
}

export function ShopContent({
    products,
    categories,
    title = "Digital Shop",
    description = "Premium tools, assets, and configurations to accelerate your development workflow.",
    showCarousel = true,
    showCategoryFilter = true,
    headerContent,
    categoryImage,
    initialCategory = "All"
}: ShopContentProps) {
    // Parse features from JSON string if needed
    const parsedProducts = products.map(p => ({
        ...p,
        features: (typeof p.features === 'string' ? JSON.parse(p.features) : p.features) as string[]
    }))

    const [activeCategory, setActiveCategory] = useState(initialCategory)
    const [searchQuery, setSearchQuery] = useState("")
    const [sortOption, setSortOption] = useState("newest")

    const filteredProducts = parsedProducts.filter(product => {
        const matchesCategory = activeCategory === "All" || product.category === activeCategory
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    }).sort((a, b) => {
        switch (sortOption) {
            case "price-asc": return a.price - b.price
            case "price-desc": return b.price - a.price
            case "name-asc": return a.name.localeCompare(b.name)
            case "newest": default:
                return 0
        }
    })

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden font-bold relative pt-20 md:pt-24">
            {/* Dynamic Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '5s' }} />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
            </div>

            {/* Category Image Background for Category Pages */}
            {categoryImage && (
                <div className="absolute inset-0 z-0 h-[60vh]">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/90 to-black z-10" />
                    <img src={categoryImage} alt="Background" className="w-full h-full object-cover opacity-60" />
                </div>
            )}

            <div className="container relative z-10 mx-auto px-4 py-6 md:py-8">
                <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black font-orbitron bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-500 tracking-tight">
                            {title.toUpperCase()}
                        </h1>
                        <p className="mt-4 text-base md:text-lg text-zinc-400 max-w-xl font-medium leading-relaxed">
                            {description}
                        </p>
                    </div>
                </div>

                {showCarousel && <div className="mb-12"><ShopCarousel /></div>}

                {headerContent}

                <ShopToolbar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    categories={showCategoryFilter ? categories : []}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                    sortOption={sortOption}
                    onSortChange={setSortOption}
                />

                <motion.div
                    layout
                    className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredProducts.map((product) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                key={product.id}
                            >
                                <ProductCard product={product} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {filteredProducts.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="text-zinc-500 text-lg font-orbitron tracking-widest uppercase">No products found</div>
                        <p className="text-zinc-600 mt-2 text-sm">Try adjusting your filters</p>
                    </div>
                )}
            </div>
        </div>
    )
}

