"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface ProductFormProps {
    initialData?: {
        id?: string
        name: string
        description: string
        price: number
        image: string
        category: string
        features: string
    }
    action: (formData: FormData) => Promise<void>
}

export function ProductForm({ initialData, action }: ProductFormProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

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
        <form action={handleSubmit} className="space-y-6 max-w-2xl">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Name</label>
                <input
                    name="name"
                    defaultValue={initialData?.name}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500 transition-colors"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Description</label>
                <textarea
                    name="description"
                    defaultValue={initialData?.description}
                    required
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500 transition-colors"
                />
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Price (in cents)</label>
                    <input
                        name="price"
                        type="number"
                        defaultValue={initialData?.price}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500 transition-colors"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Category</label>
                    <input
                        name="category"
                        defaultValue={initialData?.category}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500 transition-colors"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Image URL</label>
                <input
                    name="image"
                    defaultValue={initialData?.image}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500 transition-colors"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Features (JSON Array)</label>
                <textarea
                    name="features"
                    defaultValue={initialData?.features || '["Feature 1", "Feature 2"]'}
                    required
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-green-500 transition-colors"
                />
                <p className="text-xs text-gray-500">Format: ["Feature 1", "Feature 2"]</p>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {initialData ? "Update Product" : "Create Product"}
            </button>
        </form>
    )
}
