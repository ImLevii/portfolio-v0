import { db } from "@/lib/db"
import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, LayoutGrid, ArrowUp, ArrowDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { deleteCategory, updateCategoryOrder } from "./actions"

export const metadata: Metadata = {
    title: "Categories | Admin",
    description: "Manage product categories",
}

export default async function CategoriesPage() {
    const categories = await db.category.findMany({
        orderBy: { order: 'asc' },
        include: { _count: { select: { products: true } } } // If relation exists later, for now just placeholder or error if not in schema
    })

    // Fallback if products relation isn't strictly defined as `products` in schema yet (it's using string category field)
    // Actually schema has `product.category` string. So we can't count easily with relation.
    // We will just list categories.

    return (
        <div className="space-y-8 p-4 md:p-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                        <LayoutGrid className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight font-orbitron text-white">Categories</h1>
                        <p className="text-zinc-400">Manage product categories and organization</p>
                    </div>
                </div>
                <Link href="/admin/categories/new">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 font-orbitron">
                        <Plus className="mr-2 h-4 w-4" /> Add Category
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4">
                {categories.length === 0 ? (
                    <Card className="bg-black/40 border-white/5 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-zinc-500">
                            <LayoutGrid className="h-12 w-12 mb-4 opacity-50" />
                            <p className="text-lg font-medium">No categories found</p>
                            <p className="text-sm">Create your first category to get started</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 bg-black/40 border border-white/5 rounded-xl overflow-hidden pb-1">
                        {/* Header */}
                        <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 p-4 border-b border-white/10 bg-white/5 text-sm font-bold text-zinc-300 font-orbitron">
                            <div className="w-12 text-center">Order</div>
                            <div>Name</div>
                            <div className="hidden md:block">Slug</div>
                            <div className="text-right">Actions</div>
                        </div>

                        {categories.map((category) => (
                            <div key={category.id} className="grid grid-cols-[auto_1fr_auto_auto] gap-4 p-4 items-center hover:bg-white/5 transition-colors group">
                                <div className="w-12 text-center font-mono text-zinc-500 bg-white/5 rounded py-1 text-xs">
                                    {category.order}
                                </div>
                                <div className="flex items-center gap-3">
                                    {category.image && (
                                        <img src={category.image} alt={category.name} className="h-8 w-8 rounded object-cover border border-white/10" />
                                    )}
                                    <div className="font-medium text-white">{category.name}</div>
                                </div>
                                <div className="hidden md:block text-sm text-zinc-400 font-mono">
                                    {category.slug}
                                </div>
                                <div className="flex items-center gap-2 justify-end">
                                    <Link href={`/admin/categories/${category.id}`}>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <form action={deleteCategory.bind(null, category.id)}>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                            type="submit"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
