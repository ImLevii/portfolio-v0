import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Check } from "lucide-react"

import { db } from "@/lib/db"
import { CartSheet } from "@/components/shop/cart-sheet"
import { AddToCartButton } from "@/components/shop/add-to-cart-button"

interface ProductPageProps {
    params: Promise<{
        slug: string
    }>
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { slug } = await params
    const dbProduct = await db.product.findUnique({
        where: { id: slug }
    })

    if (!dbProduct) {
        return notFound()
    }

    const product = {
        ...dbProduct,
        features: JSON.parse(dbProduct.features) as string[]
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 text-white overflow-hidden font-bold relative pt-20 md:pt-24">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-900/10 via-transparent to-transparent pointer-events-none" />

            <div className="container relative z-10 mx-auto px-4 py-6 md:py-8">
                <div className="mb-6 md:mb-8 flex items-center justify-between">
                    <Link
                        href="/shop"
                        className="flex items-center text-sm font-medium text-gray-400 hover:text-green-400 transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Shop
                    </Link>
                    <CartSheet />
                </div>

                <div className="grid gap-8 lg:gap-12 lg:grid-cols-2 items-start">
                    {/* Product Image */}
                    <div className="aspect-square relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm shadow-2xl shadow-black/50">
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50" />
                        <div className="flex h-full w-full items-center justify-center relative z-10">
                            <span className="text-9xl font-bold font-orbitron text-gray-800">{product.name.charAt(0)}</span>
                        </div>
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                            <div className="h-24 w-24 rounded-full bg-green-500 blur-3xl" />
                        </div>

                        <div className="absolute bottom-4 left-4">
                            <span className="rounded-full bg-green-500/20 border border-green-500/30 px-3 py-1 text-xs font-bold text-green-400 backdrop-blur-md">
                                {product.category}
                            </span>
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-col justify-center space-y-6 md:space-y-8">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-bold font-orbitron text-white mb-2 md:mb-4">{product.name}</h1>
                            <div className="text-2xl md:text-3xl font-bold text-green-500 font-orbitron">
                                ${(product.price / 100).toFixed(2)}
                            </div>
                        </div>

                        <p className="text-base md:text-lg text-gray-300 leading-relaxed border-l-2 border-green-500/30 pl-4 md:pl-6">
                            {product.description}
                        </p>

                        <div className="space-y-4 md:space-y-6 rounded-xl border border-gray-800 bg-gray-900/30 p-4 md:p-6 backdrop-blur-sm">
                            <h3 className="font-orbitron text-lg md:text-xl font-semibold text-white flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                What&apos;s Included
                            </h3>
                            <ul className="grid gap-3 sm:grid-cols-2">
                                {product.features.map((feature) => (
                                    <li key={feature} className="flex items-center text-sm md:text-base text-gray-300 group">
                                        <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10 text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
                                            <Check className="h-3.5 w-3.5" />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="pt-4">
                            <AddToCartButton product={product} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
