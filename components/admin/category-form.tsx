"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Image as ImageIcon, Box, ListVideo } from "lucide-react"

interface CategoryFormProps {
    initialData?: {
        id?: string
        name: string
        description?: string | null
        image?: string | null
        order: number
    }
    action: (formData: FormData) => Promise<void>
}

export function CategoryForm({ initialData, action }: CategoryFormProps) {
    const [loading, setLoading] = useState(false)
    const [imageUrl, setImageUrl] = useState(initialData?.image || "")
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        try {
            await action(formData)
            router.refresh()
            router.push("/admin/categories")
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
                            Category Details
                        </h3>

                        <div className="space-y-6 relative z-10">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider font-orbitron">Category Name</label>
                                <input
                                    name="name"
                                    defaultValue={initialData?.name}
                                    required
                                    placeholder="e.g. Accounts"
                                    className="w-full bg-black/40 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all placeholder:text-gray-700"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider font-orbitron">Description (Optional)</label>
                                <textarea
                                    name="description"
                                    defaultValue={initialData?.description || ""}
                                    rows={3}
                                    placeholder="Short description for this category..."
                                    className="w-full bg-black/40 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all placeholder:text-gray-700 resize-y font-mono text-sm leading-relaxed"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider font-orbitron">Sort Order</label>
                                <input
                                    name="order"
                                    type="number"
                                    defaultValue={initialData?.order || 0}
                                    className="w-full bg-black/40 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all placeholder:text-gray-700"
                                />
                                <p className="text-[10px] text-gray-500 font-mono">Higher numbers appear last.</p>
                            </div>
                        </div>
                    </div>

                    {/* Media */}
                    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <ImageIcon className="w-24 h-24 text-purple-500 transform rotate-12 translate-x-8 -translate-y-8" />
                        </div>

                        <h3 className="text-xl font-bold font-orbitron text-white mb-6 flex items-center gap-2 relative z-10">
                            <ImageIcon className="h-5 w-5 text-purple-500" />
                            Category Image
                        </h3>

                        <div className="space-y-6 relative z-10">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider font-orbitron">Image URL</label>
                                <div className="flex gap-2">
                                    <input
                                        name="image"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        placeholder="https://..."
                                        className="flex-1 bg-black/40 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all placeholder:text-gray-700"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold font-orbitron py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] active:scale-[0.98] flex items-center justify-center gap-2 tracking-wider uppercase text-sm md:text-base"
                    >
                        {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                        {initialData ? "SAVE CHANGES" : "CREATE CATEGORY"}
                    </button>
                </form>
            </div>

            {/* Preview */}
            <div className="w-full lg:w-96 space-y-6">
                <div className="sticky top-24 space-y-6">
                    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-sm font-bold font-orbitron text-gray-400 uppercase tracking-wider mb-4 flex items-center justify-between">
                            <span>Visual Preview</span>
                            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/50">Live</span>
                        </h3>

                        <div className="aspect-[16/9] rounded-xl overflow-hidden bg-black/40 border border-gray-800 relative group shadow-2xl">
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt="Preview"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=Invalid+URL"
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

                            <div className="absolute bottom-4 left-4 right-4 z-10">
                                <h4 className="font-orbitron font-bold text-white text-lg truncate shadow-lg">{initialData?.name || "Category Name"}</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
