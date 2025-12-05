
import { db } from "@/lib/db"
import { deleteOrder } from "@/app/admin/actions"
import { revalidatePath } from "next/cache"
import { Trash2, Download, Package } from "lucide-react"

export default async function AdminOrdersPage() {
    const orders = await db.order.findMany({
        include: {
            user: true,
            items: {
                include: {
                    product: true
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    })

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-orbitron text-white neon-text-glow">Orders Management</h1>

            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-black/40 border-b border-gray-800">
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-orbitron">Order ID</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-orbitron">Customer</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-orbitron">Items</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-orbitron">Total</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-orbitron">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-orbitron">Date</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider font-orbitron">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-400">
                                        #{order.id.slice(-6)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div>
                                                <div className="text-sm font-medium text-white">{order.user.name || "Guest"}</div>
                                                <div className="text-sm text-gray-500">{order.user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            {order.items.map((item, index) => (
                                                <div key={index} className="text-sm text-gray-300 flex items-center gap-2">
                                                    <Package className="h-3 w-3 text-emerald-500" />
                                                    {item.product.name}
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-400 font-mono">
                                        ${(order.amount / 100).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full border ${order.status === 'completed'
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                            }`}>
                                            {order.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <form action={async () => {
                                            "use server"
                                            await deleteOrder(order.id)
                                        }}>
                                            <button
                                                type="submit"
                                                className="text-red-400 hover:text-red-300 transition-colors bg-red-500/10 p-2 rounded-lg border border-red-500/20 hover:bg-red-500/20"
                                                title="Delete Order"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {orders.length === 0 && (
                        <div className="p-12 text-center text-gray-500">
                            No orders found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
