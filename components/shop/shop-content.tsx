"use client"

import { useState } from "react"
import { ProductCard } from "@/components/shop/product-card"
import { ShopCarousel } from "@/components/shop/shop-carousel"
import { ShopToolbar } from "@/components/shop/shop-toolbar"

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

interface ShopContentProps {
    products: Product[]
    title?: string
    description?: string
    showCarousel?: boolean
    showCategoryFilter?: boolean
    headerContent?: React.ReactNode
    categoryImage?: string | null
}

export function ShopContent({
    products,
    title = "Digital Shop",
    description = "Premium tools, assets, and configurations to accelerate your development workflow.",
    showCarousel = true,
    showCategoryFilter = true,
    headerContent,
    categoryImage
}: ShopContentProps) {
    // Parse features from JSON string if needed
    const parsedProducts = products.map(p => ({
        ...p,
        features: (typeof p.features === 'string' ? JSON.parse(p.features) : p.features) as string[]
    }))

    const categories = Array.from(new Set(parsedProducts.map(p => p.category)))
    const [activeCategory, setActiveCategory] = useState("All")

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
        <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 text-white overflow-hidden font-bold relative pt-20 md:pt-24">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/20 via-transparent to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent pointer-events-none" />

            {/* Category Image Background for Category Pages */}
            {categoryImage && (
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-black/80 z-10" />
                    <img src={categoryImage} alt="Background" className="w-full h-[50vh] object-cover opacity-50 mask-image-gradient" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-950/80 to-gray-950" />
                </div>
            )}

            <div className="container relative z-10 mx-auto px-4 py-6 md:py-8">
                <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-bold font-orbitron bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            {title}
                        </h1>
                        <p className="mt-2 md:mt-4 text-base md:text-lg text-gray-400 max-w-xl">
                            {description}
                        </p>
                    </div>
                </div>

                {showCarousel && <ShopCarousel />}

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

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="py-20 text-center text-gray-500">
                        No products found in this category.
                    </div>
                )}
            </div>
        </div>
    )
}
