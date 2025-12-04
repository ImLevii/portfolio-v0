"use client"

import { ShoppingCart } from "lucide-react"
import { Product } from "@/lib/products"
import useCart from "@/hooks/use-cart"
import { Button } from "@/components/ui/button"

export function AddToCartButton({ product }: { product: Product }) {
    const cart = useCart()

    return (
        <Button
            size="lg"
            className="w-full gap-3 md:w-auto bg-gradient-to-r from-gray-800/60 to-gray-900/60 border border-gray-700/40 backdrop-blur-sm hover:bg-gray-800/80 transition-all duration-300 font-bold text-base text-white relative shadow-lg group"
            style={{
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.3)'
            }}
            onClick={() => cart.addItem(product)}
        >
            <ShoppingCart className="h-5 w-5 text-green-500 group-hover:text-green-400 transition-colors" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600 font-orbitron tracking-wider group-hover:from-green-300 group-hover:to-emerald-500">
                ADD TO CART
            </span>
        </Button>
    )
}
