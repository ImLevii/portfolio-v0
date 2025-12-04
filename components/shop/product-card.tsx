"use client"

import Link from "next/link"
import { ShoppingCart } from "lucide-react"

import { Product } from "@/lib/products"
import useCart from "@/hooks/use-cart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface ProductCardProps {
    product: Product
}

export function ProductCard({ product }: ProductCardProps) {
    const cart = useCart()

    const onAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        cart.addItem(product)
    }

    return (
        <Link href={`/shop/${product.id}`} className="block h-full">
            <Card className="group relative overflow-hidden border-gray-800 bg-gray-900/40 backdrop-blur-md transition-all duration-300 hover:border-green-500/50 hover:bg-gray-900/60 hover:shadow-[0_0_30px_-5px_rgba(34,197,94,0.3)] cursor-pointer h-full flex flex-col">
                <div className="aspect-square relative overflow-hidden bg-gray-800/50">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50 transition-transform duration-500 group-hover:scale-110" />

                    {/* Placeholder for image */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-6xl font-bold font-orbitron text-gray-700 transition-colors duration-300 group-hover:text-green-500/20">
                            {product.name.charAt(0)}
                        </span>
                    </div>

                    {/* Overlay gradient on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60" />

                    {/* Category Badge */}
                    <div className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-green-400 backdrop-blur-sm border border-green-500/20">
                        {product.category}
                    </div>
                </div>

                <CardHeader className="relative z-10 pb-2">
                    <CardTitle className="line-clamp-1 font-orbitron text-xl tracking-wide text-white group-hover:text-green-400 transition-colors">
                        {product.name}
                    </CardTitle>
                </CardHeader>

                <CardContent className="relative z-10 space-y-4 flex-1">
                    <p className="line-clamp-2 text-sm text-gray-400">
                        {product.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {product.features.slice(0, 2).map((feature, i) => (
                            <span key={i} className="inline-flex items-center rounded-md border border-gray-700 bg-gray-800/50 px-2 py-1 text-xs font-medium text-gray-300 backdrop-blur-sm">
                                {feature}
                            </span>
                        ))}
                    </div>
                </CardContent>

                <CardFooter className="relative z-10 flex items-center justify-between border-t border-gray-800 bg-gray-900/50 p-4 backdrop-blur-sm mt-auto">
                    <div className="text-xl font-bold font-orbitron text-white">
                        ${(product.price / 100).toFixed(2)}
                    </div>
                    <Button
                        onClick={onAddToCart}
                        size="sm"
                        className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20 transition-all hover:shadow-green-500/40"
                    >
                        <ShoppingCart className="h-4 w-4" />
                        Add
                    </Button>
                </CardFooter>
            </Card>
        </Link>
    )
}
