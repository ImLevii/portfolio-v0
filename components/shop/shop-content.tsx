"use client"

import { useState } from "react"
import { ProductCard } from "@/components/shop/product-card"
import { ShopCarousel } from "@/components/shop/shop-carousel"
import { ShopNav } from "@/components/shop/shop-nav"

interface Product {
    id: string
    name: string
    description: string
    price: number
    image: string
    category: string
    features: string // JSON string
}

interface ShopContentProps {
    products: Product[]
}

export function ShopContent({ products }: ShopContentProps) {
    // Parse features from JSON string if needed, but ProductCard might expect string[]
    // The DB returns string for features. ProductCard expects string[].
    // I need to map the products to parse features.

    const parsedProducts = products.map(p => ({
        ...p,
        features: JSON.parse(p.features) as string[]
    }))

    const categories = Array.from(new Set(parsedProducts.map(p => p.category)))
    const [activeCategory, setActiveCategory] = useState("All")

    const filteredProducts = activeCategory === "All"
        ? parsedProducts
        : parsedProducts.filter(p => p.category === activeCategory)

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 text-white overflow-hidden font-bold relative pt-20 md:pt-24">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/20 via-transparent to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent pointer-events-none" />

            <div className="container relative z-10 mx-auto px-4 py-6 md:py-8">
                <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-bold font-orbitron bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Digital Shop
                        </h1>
                        <p className="mt-2 md:mt-4 text-base md:text-lg text-gray-400 max-w-xl">
                            Premium tools, assets, and configurations to accelerate your development workflow.
                        </p>
                    </div>
                </div>

                <ShopCarousel />

                <ShopNav
                    categories={categories}
                    activeCategory={activeCategory}
                    onSelectCategory={setActiveCategory}
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
