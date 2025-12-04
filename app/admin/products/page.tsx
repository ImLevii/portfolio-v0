import Link from "next/link"
import { db } from "@/lib/db"
import { Plus, Edit, Trash2 } from "lucide-react"
import { deleteProduct } from "@/app/admin/actions"

export default async function AdminProductsPage() {
    const products = await db.product.findMany({
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-bold font-orbitron">Products</h1>
                <Link
                    href="/admin/products/new"
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    Add Product
                </Link>
            </div>

            <div className="rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-gray-400 font-orbitron text-sm uppercase">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Price</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-medium">{product.name}</td>
                                <td className="px-6 py-4 text-green-400">${(product.price / 100).toFixed(2)}</td>
                                <td className="px-6 py-4 text-gray-400">{product.category}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Link
                                            href={`/admin/products/${product.id}`}
                                            className="p-2 hover:bg-white/10 rounded-lg text-blue-400 transition-colors"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Link>
                                        {/* Delete button form */}
                                        <form action={deleteProduct.bind(null, product.id)}>
                                            <button className="p-2 hover:bg-white/10 rounded-lg text-red-400 transition-colors">
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
    )
}
