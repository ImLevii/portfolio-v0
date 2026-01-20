"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Save, Image as ImageIcon, LayoutGrid, Type } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { showTerminalToast } from "@/components/global/terminal-toast"

interface CategoryFormProps {
    initialData?: {
        id: string
        name: string
        slug: string
        description: string | null
        image: string | null
        order: number
    }
    action: (formData: FormData) => Promise<void>
}

export function CategoryForm({ initialData, action }: CategoryFormProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const [name, setName] = useState(initialData?.name || "")
    const [slug, setSlug] = useState(initialData?.slug || "")

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setName(value)
        if (!initialData) {
            // Auto-generate slug for new categories
            setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))
        }
    }

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        try {
            await action(formData)
            showTerminalToast.success(initialData ? "Category updated" : "Category created")
            router.push("/admin/categories")
            router.refresh()
        } catch (error) {
            console.error(error)
            showTerminalToast.error("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form action={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
            <Card className="bg-black/40 border-white/5 backdrop-blur-xl">
                <CardContent className="p-6 space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-zinc-300">
                                <Type className="h-4 w-4 text-blue-400" />
                                Name
                            </Label>
                            <Input
                                name="name"
                                value={name}
                                onChange={handleNameChange}
                                required
                                placeholder="e.g. Gaming Gear"
                                className="bg-white/5 border-white/10 text-zinc-200 focus:ring-blue-500/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-zinc-300">
                                <LayoutGrid className="h-4 w-4 text-purple-400" />
                                Slug
                            </Label>
                            <Input
                                name="slug"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                required
                                placeholder="e.g. gaming-gear"
                                className="bg-white/5 border-white/10 text-zinc-200 focus:ring-purple-500/50"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-zinc-300">Description</Label>
                        <Textarea
                            name="description"
                            defaultValue={initialData?.description || ""}
                            placeholder="Optional category description..."
                            className="bg-white/5 border-white/10 text-zinc-200 focus:ring-blue-500/50 min-h-[100px]"
                        />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-zinc-300">
                                <ImageIcon className="h-4 w-4 text-pink-400" />
                                Image URL
                            </Label>
                            <Input
                                name="image"
                                defaultValue={initialData?.image || ""}
                                placeholder="https://..."
                                className="bg-white/5 border-white/10 text-zinc-200 focus:ring-pink-500/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Display Order</Label>
                            <Input
                                name="order"
                                type="number"
                                defaultValue={initialData?.order || 0}
                                className="bg-white/5 border-white/10 text-zinc-200 focus:ring-blue-500/50"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-white/5">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-orbitron"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="mr-2 h-4 w-4" />
                            {initialData ? "Save Changes" : "Create Category"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    )
}
