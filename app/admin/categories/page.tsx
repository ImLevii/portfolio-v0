import { db } from "@/lib/db"
import Link from "next/link"
import { Plus, Pencil, Trash2, Box, ArrowUpDown } from "lucide-react"

export default async function CategoriesPage() {
    const categories = await db.category.findMany({
        orderBy: { order: 'asc' }
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl shadow-xl">
                <div>
                    <h1 className="text-3xl font-bold font-orbitron text-white flex items-center gap-3">
                        <Box className="h-8 w-8 text-green-500" />
                        Categories
                    </h1>
                    <p className="text-gray-400 mt-2 font-mono text-sm leading-relaxed max-w-2xl">
                        Manage your product categories. These will appear as blocks on the shop page.
                    </p>
                </div>
                <Link
                    href="/admin/categories/new"
                    className="group relative inline-flex items-center justify-center px-6 py-3 font-bold text-white transition-all duration-200 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:from-green-500 hover:to-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-lg hover:shadow-green-500/25"
                >
                    <Plus className="w-5 h-5 mr-2 transition-transform group-hover:rotate-90" />
                    <span>NEW CATEGORY</span>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                    <div
                        key={category.id}
                        className="group relative overflow-hidden rounded-xl bg-gray-900/50 border border-gray-800/50 hover:border-green-500/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                    >
                        {/* Image Background */}
                        <div className="aspect-video relative overflow-hidden bg-black/40">
                            {category.image ? (
                                <img
                                    src={category.image}
                                    alt={category.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <Box className="h-12 w-12 text-gray-700" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />

                            <div className="absolute top-3 right-3 flex gap-2 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                <Link
                                    href={`/admin/categories/${category.id}`}
                                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-md transition-colors border border-white/10"
                                >
                                    <Pencil className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="text-xl font-bold font-orbitron text-white group-hover:text-green-400 transition-colors truncate">
                                    {category.name}
                                </h3>
                                <div className="flex items-center gap-1 px-2 py-1 rounded bg-black/40 border border-gray-800 text-xs font-mono text-gray-500">
                                    <ArrowUpDown className="w-3 h-3" />
                                    {category.order}
                                </div>
                            </div>

                            <p className="text-sm text-gray-400 line-clamp-2 mb-4 font-mono min-h-[2.5em]">
                                {category.description || "No description provided."}
                            </p>

                            <div className="pt-4 border-t border-gray-800/50 flex items-center justify-between text-xs text-gray-500 font-mono">
                                <span>ID: {category.id.slice(0, 8)}...</span>
                            </div>
                        </div>
                    </div>
                ))}

                {categories.length === 0 && (
                    <div className="col-span-full p-12 text-center border border-dashed border-gray-800 rounded-xl bg-gray-900/20">
                        <Box className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white font-orbitron mb-2">No Categories Found</h3>
                        <p className="text-gray-500">Get started by creating your first category.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
