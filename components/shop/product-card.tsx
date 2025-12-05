"use client"

import Link from "next/link"
import { ShoppingCart, Image as ImageIcon } from "lucide-react"
import { useState } from "react"

import { Product } from "@/lib/products"
import useCart from "@/hooks/use-cart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ProductCardProps {
    product: Product
}

export function ProductCard({ product }: ProductCardProps) {
    const cart = useCart()
    const [imageError, setImageError] = useState(false)

    const onAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        cart.addItem(product)
    }

    return (
        <Link href={`/shop/${product.id}`} className="block h-full">
            <Card className="group relative overflow-hidden border-gray-800 bg-gray-900/40 backdrop-blur-md transition-all duration-300 hover:border-green-500/50 hover:bg-gray-900/60 hover:shadow-[0_0_30px_-5px_rgba(34,197,94,0.3)] cursor-pointer h-full flex flex-col">
                <div className="aspect-[4/3] relative overflow-hidden bg-gray-800/50">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50 transition-transform duration-500 group-hover:scale-110" />

                    {product.image && !imageError ? (
                        <img
                            src={product.image}
                            alt={product.name}
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-4xl font-bold font-orbitron text-gray-700 transition-colors duration-300 group-hover:text-green-500/20">
                                {product.name.charAt(0)}
                            </span>
                        </div>
                    )}

                    {/* Overlay gradient on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60" />

                    {/* Category Badge */}
                    <div className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-green-400 backdrop-blur-sm border border-green-500/20">
                        {product.category}
                    </div>
                </div>

                <CardHeader className="relative z-10 p-3 pb-1">
                    <CardTitle className="line-clamp-1 font-orbitron text-base tracking-wide text-white group-hover:text-green-400 transition-colors">
                        {product.name}
                    </CardTitle>
                </CardHeader>

                <CardContent className="relative z-10 space-y-2 flex-1 p-3 pt-1">
                    <p className="line-clamp-2 text-xs text-gray-400 leading-relaxed">
                        {product.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {product.features.slice(0, 2).map((feature, i) => (
                            <span key={i} className="inline-flex items-center rounded-md border border-gray-700 bg-gray-800/50 px-1.5 py-0.5 text-[10px] font-medium text-gray-300 backdrop-blur-sm">
                                {feature}
                            </span>
                        ))}
                    </div>
                </CardContent>

                <CardFooter className="relative z-10 flex items-center justify-between border-t border-gray-800 bg-gray-900/50 p-3 backdrop-blur-sm mt-auto">
                    <div className="text-base font-bold font-orbitron text-white">
                        ${(product.price / 100).toFixed(2)}
                    </div>
                    <Button
                        onClick={onAddToCart}
                        size="sm"
                        className="h-8 gap-2 bg-gradient-to-r from-gray-800/60 to-gray-900/60 border border-gray-700/40 hover:bg-gray-800/80 text-white shadow-lg transition-all group/btn"
                        style={{
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.3)'
                        }}
                    >
                        <ShoppingCart className="h-3.5 w-3.5 text-green-500 group-hover/btn:text-green-400 transition-colors" />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600 font-orbitron tracking-wider text-[10px] font-bold group-hover/btn:from-green-300 group-hover/btn:to-emerald-500">
                            ADD
                        </span>
                    </Button>
                </CardFooter>
            </Card>
        </Link>
    )
}
