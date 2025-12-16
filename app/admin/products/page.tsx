import Link from "next/link"
import { db } from "@/lib/db"
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react"
import { deleteProduct, toggleProductListing } from "@/app/admin/actions"

export default async function AdminProductsPage() {
    const products = await db.product.findMany({
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-bold font-orbitron text-white neon-text-glow">Products</h1>
                <Link
                    href="/admin/products/new"
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white rounded-xl font-bold font-orbitron transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] active:scale-[0.98]"
                >
                    <Plus className="h-5 w-5" />
                    ADD PRODUCT
                </Link>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-gray-800/60">
                <div className="rounded-xl border border-gray-800/60 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-black/40 text-gray-400 font-orbitron text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-medium">Name</th>
                                <th className="px-6 py-4 font-medium">Price</th>
                                <th className="px-6 py-4 font-medium">Category</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/60">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4 font-medium text-white">{product.name}</td>
                                    <td className="px-6 py-4 text-emerald-400 font-mono">${(product.price / 100).toFixed(2)}</td>
                                    <td className="px-6 py-4 text-gray-400">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-gray-300 border border-white/10">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {/* Toggle Listing Button */}
                                            <form action={async () => {
                                                "use server"
                                                await toggleProductListing(product.id, !product.isListed)
                                            }}>
                                                <button
                                                    className={`p-2 rounded-lg transition-all ${product.isListed ? 'text-emerald-400 hover:bg-emerald-500/10 hover:shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'text-gray-500 hover:bg-white/10'}`}
                                                    title={product.isListed ? "Delist Product" : "Relist Product"}
                                                >
                                                    {product.isListed ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                                </button>
                                            </form>

                                            <Link
                                                href={`/admin/products/${product.id}`}
                                                className="p-2 hover:bg-blue-500/10 text-blue-400 rounded-lg transition-all hover:shadow-[0_0_10px_rgba(59,130,246,0.2)]"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                            {/* Delete button form */}
                                            <form action={async () => {
                                                "use server"
                                                await deleteProduct(product.id)
                                            }}>
                                                <button className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-all hover:shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
