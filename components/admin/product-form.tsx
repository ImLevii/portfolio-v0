"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Image as ImageIcon, DollarSign, Tag, Box, Layers } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductFormProps {
    initialData?: {
        id?: string
        name: string
        description: string
        price: number
        image: string
        category: string
        features: string // JSON string
        duration?: number | null // Duration in days

        stock?: number
        filePath?: string | null
    }
    action: (formData: FormData) => Promise<void>
}

export function ProductForm({ initialData, action }: ProductFormProps) {
    const [loading, setLoading] = useState(false)
    const [imageUrl, setImageUrl] = useState(initialData?.image || "")
    const router = useRouter()

    // Update local state if initialData changes
    useEffect(() => {
        if (initialData?.image) {
            setImageUrl(initialData.image)
        }
    }, [initialData?.image])

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        try {
            await action(formData)
            router.refresh()
            router.push("/admin/products")
        } catch (error) {
            console.error(error)
            alert("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex gap-8 flex-col lg:flex-row">
            <div className="flex-1">
                <form action={handleSubmit} className="space-y-8">
                    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-xl font-bold font-orbitron text-white mb-6 flex items-center gap-2">
                            <Box className="h-5 w-5 text-green-500" />
                            Basic Info
                        </h3>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider font-orbitron">Product Name</label>
                                <input
                                    name="name"
                                    defaultValue={initialData?.name}
                                    required
                                    placeholder="e.g. Neon Cyber Deck"
                                    className="w-full bg-black/40 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all placeholder:text-gray-700"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider font-orbitron">Description</label>
                                <textarea
                                    name="description"
                                    defaultValue={initialData?.description}
                                    required
                                    rows={4}
                                    placeholder="Describe your product..."
                                    className="w-full bg-black/40 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all placeholder:text-gray-700 resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-xl font-bold font-orbitron text-white mb-6 flex items-center gap-2">
                            <Tag className="h-5 w-5 text-blue-500" />
                            Details & Inventory
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider font-orbitron flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" /> Price (USD)
                                </label>
                                <input
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    defaultValue={initialData?.price ? (initialData.price / 100).toFixed(2) : ""}
                                    required
                                    placeholder="0.00"
                                    className="w-full bg-black/40 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider font-orbitron flex items-center gap-1">
                                    <Layers className="h-3 w-3" /> Stock
                                </label>
                                <input
                                    name="stock"
                                    type="number"
                                    defaultValue={initialData?.stock ?? 0}
                                    required
                                    min="0"
                                    className="w-full bg-black/40 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider font-orbitron flex items-center gap-1">
                                    <Box className="h-3 w-3" /> License Duration (Days)
                                </label>
                                <input
                                    name="duration"
                                    type="number"
                                    defaultValue={initialData?.duration ?? ""}
                                    placeholder="Leave empty for lifetime"
                                    min="0"
                                    className="w-full bg-black/40 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all placeholder:text-gray-700"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider font-orbitron">Category</label>
                                <input
                                    name="category"
                                    defaultValue={initialData?.category}
                                    required
                                    placeholder="e.g. Electronics"
                                    className="w-full bg-black/40 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all placeholder:text-gray-700"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-xl font-bold font-orbitron text-white mb-6 flex items-center gap-2">
                            <ImageIcon className="h-5 w-5 text-purple-500" />
                            Media
                        </h3>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider font-orbitron">Image URL</label>
                            <input
                                name="image"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                required
                                placeholder="https://..."
                                className="w-full bg-black/40 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all placeholder:text-gray-700"
                            />
                        </div>
                    </div>

                    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-xl font-bold font-orbitron text-white mb-6 flex items-center gap-2">
                            <Box className="h-5 w-5 text-yellow-500" />
                            Digital Download
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider font-orbitron">Product File</label>
                                <input
                                    type="file"
                                    name="file"
                                    className="w-full bg-black/40 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-green-600 file:text-white hover:file:bg-green-500"
                                />
                                {initialData?.filePath && (
                                    <p className="text-xs text-green-400 mt-2 flex items-center gap-2">
                                        <Box className="h-3 w-3" />
                                        Current file: {initialData.filePath.split('/').pop()}
                                    </p>
                                )}
                                <p className="text-xs text-gray-500 font-mono">Upload the product file for customers to download.</p>
                            </div>
                        </div>
                    </div>



                    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-xl font-bold font-orbitron text-white mb-6">Features</h3>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider font-orbitron">JSON Array</label>
                            <textarea
                                name="features"
                                defaultValue={initialData?.features || '["Feature 1", "Feature 2"]'}
                                required
                                rows={4}
                                className="w-full bg-black/40 border border-gray-800 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all placeholder:text-gray-700"
                            />
                            <p className="text-xs text-gray-500 font-mono">Format: ["Feature 1", "Feature 2"]</p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold font-orbitron py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] active:scale-[0.98] flex items-center justify-center gap-2 tracking-wider"
                    >
                        {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                        {initialData ? "UPDATE PRODUCT" : "CREATE PRODUCT"}
                    </button>
                </form>
            </div>

            <div className="w-full lg:w-80 space-y-6">
                <div className="sticky top-24">
                    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-sm font-bold font-orbitron text-gray-400 uppercase tracking-wider mb-4">Preview</h3>
                        <div className="aspect-square rounded-xl overflow-hidden bg-black/40 border border-gray-800 relative group">
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt="Preview"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x400?text=Invalid+URL"
                                    }}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-600">
                                    <ImageIcon className="h-12 w-12 opacity-50" />
                                </div>
                            )}

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>

                        <div className="mt-4 space-y-2">
                            <div className="h-2 w-2/3 bg-gray-800 rounded animate-pulse" />
                            <div className="h-2 w-1/2 bg-gray-800 rounded animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
