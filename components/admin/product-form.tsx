"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Image as ImageIcon, DollarSign, Tag, Box, Layers, ShoppingCart } from "lucide-react"
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
        salePrice?: number | null
        isSale?: boolean
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
            <div className="flex-1 space-y-8">
                <form action={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Box className="w-24 h-24 text-green-500 transform rotate-12 translate-x-8 -translate-y-8" />
                        </div>

                        <h3 className="text-xl font-bold font-orbitron text-white mb-6 flex items-center gap-2 relative z-10">
                            <Box className="h-5 w-5 text-green-500" />
                            Basic Info
                        </h3>

                        <div className="space-y-6 relative z-10">
                            <div className="grid gap-6 md:grid-cols-2">
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

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider font-orbitron">Description</label>
                                <textarea
                                    name="description"
                                    defaultValue={initialData?.description}
                                    required
                                    rows={6}
                                    placeholder="Describe your product... Markdown supported."
                                    className="w-full bg-black/40 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all placeholder:text-gray-700 resize-y font-mono text-sm leading-relaxed"
                                />
                                <p className="text-[10px] text-gray-500 font-mono text-right">Supports Markdown</p>
                            </div>
                        </div>
                    </div>

                    {/* Pricing & Inventory */}
                    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <DollarSign className="w-24 h-24 text-blue-500 transform -rotate-12 translate-x-8 -translate-y-8" />
                        </div>

                        <h3 className="text-xl font-bold font-orbitron text-white mb-6 flex items-center gap-2 relative z-10">
                            <Tag className="h-5 w-5 text-blue-500" />
                            Pricing & Inventory
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider font-orbitron flex items-center gap-1">
                                        <DollarSign className="h-3 w-3" /> Regular Price (USD)
                                    </label>
                                    <input
                                        name="price"
                                        type="number"
                                        step="0.01"
                                        defaultValue={initialData?.price ? (initialData.price / 100).toFixed(2) : ""}
                                        required
                                        placeholder="0.00"
                                        className="w-full bg-black/40 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all font-mono text-lg"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider font-orbitron flex items-center gap-1">
                                        <Tag className="h-3 w-3" /> Sale Price (Optional)
                                    </label>
                                    <input
                                        name="salePrice"
                                        type="number"
                                        step="0.01"
                                        defaultValue={initialData?.salePrice ? (initialData.salePrice / 100).toFixed(2) : ""}
                                        placeholder="0.00"
                                        className="w-full bg-black/40 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all font-mono"
                                    />
                                </div>
                                <div className="flex items-center gap-3 bg-black/20 p-3 rounded-lg border border-gray-800/50">
                                    <input
                                        type="checkbox"
                                        name="isSale"
                                        value="true"
                                        defaultChecked={initialData?.isSale}
                                        className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-green-500 focus:ring-green-500/50 focus:ring-offset-0"
                                    />
                                    <label className="text-sm font-bold text-gray-300 font-orbitron cursor-pointer select-none">Enable Sale Status</label>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider font-orbitron flex items-center gap-1">
                                        <Layers className="h-3 w-3" /> Stock Quantity
                                    </label>
                                    <input
                                        name="stock"
                                        type="number"
                                        defaultValue={initialData?.stock ?? 0}
                                        required
                                        min="0"
                                        className="w-full bg-black/40 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all font-mono"
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
                            </div>
                        </div>
                    </div>

                    {/* Media & Files */}
                    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <ImageIcon className="w-24 h-24 text-purple-500 transform rotate-12 translate-x-8 -translate-y-8" />
                        </div>

                        <h3 className="text-xl font-bold font-orbitron text-white mb-6 flex items-center gap-2 relative z-10">
                            <ImageIcon className="h-5 w-5 text-purple-500" />
                            Media & Files
                        </h3>

                        <div className="space-y-6 relative z-10">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider font-orbitron">Image URL</label>
                                <div className="flex gap-2">
                                    <input
                                        name="image"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        required
                                        placeholder="https://..."
                                        className="flex-1 bg-black/40 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all placeholder:text-gray-700"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 border-t border-gray-800 pt-6">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider font-orbitron">Digital Product File</label>
                                <div className="relative group/file">
                                    <input
                                        type="file"
                                        name="file"
                                        className="block w-full text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:font-orbitron file:uppercase file:tracking-wider file:bg-green-500/10 file:text-green-500 hover:file:bg-green-500/20 cursor-pointer bg-black/20 rounded-lg border border-gray-800/50 transition-all hover:border-green-500/30"
                                        title="Upload Product File"
                                    />
                                </div>
                                {initialData?.filePath && (
                                    <div className="mt-2 p-3 bg-green-500/5 border border-green-500/20 rounded-lg flex items-center gap-3">
                                        <Box className="h-4 w-4 text-green-500" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-green-400 truncate font-mono">
                                                {initialData.filePath.split('/').pop()}
                                            </p>
                                        </div>
                                        <span className="text-[10px] uppercase font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded">Current File</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Features (JSON) */}
                    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-xl font-bold font-orbitron text-white mb-6">Features / Metadata</h3>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider font-orbitron">JSON Array</label>
                            <textarea
                                name="features"
                                defaultValue={initialData?.features || '["Feature 1", "Feature 2"]'}
                                required
                                rows={4}
                                className="w-full bg-black/40 border border-gray-800 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all placeholder:text-gray-700"
                            />
                            <p className="text-[10px] text-gray-500 font-mono">Format: ["Feature 1", "Feature 2"] - Used for bullet points on product card.</p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold font-orbitron py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] active:scale-[0.98] flex items-center justify-center gap-2 tracking-wider uppercase text-sm md:text-base sticky bottom-6 z-50 md:relative md:bottom-auto"
                    >
                        {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                        {initialData ? "SAVE CHANGES & UPDATE" : "PUBLISH PRODUCT"}
                    </button>
                </form>
            </div>

            {/* Sidebar / Preview */}
            <div className="w-full lg:w-96 space-y-6">
                <div className="sticky top-24 space-y-6">
                    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-sm font-bold font-orbitron text-gray-400 uppercase tracking-wider mb-4 flex items-center justify-between">
                            <span>Visual Preview</span>
                            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/50">Live</span>
                        </h3>

                        <div className="aspect-[4/3] rounded-xl overflow-hidden bg-black/40 border border-gray-800 relative group shadow-2xl">
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
                                <div className="flex items-center justify-center h-full text-gray-600 flex-col gap-2">
                                    <ImageIcon className="h-12 w-12 opacity-50" />
                                    <span className="text-xs font-mono uppercase tracking-widest opacity-50">No Image</span>
                                </div>
                            )}

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60" />

                            {/* Category Badge */}
                            <div className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-green-400 backdrop-blur-sm border border-green-500/20">
                                {initialData?.category || "Category"}
                            </div>
                        </div>

                        <div className="mt-4 p-4 bg-black/20 rounded-xl border border-white/5">
                            <h4 className="font-orbitron font-bold text-white mb-1 truncate">{initialData?.name || "Product Name"}</h4>
                            <p className="text-xs text-gray-400 line-clamp-2 mb-3">{initialData?.description || "Product description will appear here..."}</p>

                            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Price</span>
                                    <span className="text-green-400 font-mono font-bold">
                                        ${initialData?.price ? (initialData.price / 100).toFixed(2) : "0.00"}
                                    </span>
                                </div>
                                <div className="h-8 px-3 rounded bg-gray-800 border border-gray-700 flex items-center justify-center">
                                    <ShoppingCart className="w-4 h-4 text-gray-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Box className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-blue-400 font-orbitron mb-1">Pro Tip</h4>
                                <p className="text-xs text-blue-300/70 leading-relaxed">
                                    Use high-quality images (800x600 recommended) and descriptive markdown for the best customer experience.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
