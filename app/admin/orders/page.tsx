import { db } from "@/lib/db"
import { Package } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { OrderActions } from "@/components/admin/order-actions"

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
            <AdminPageHeader
                title="Orders"
                description="View and manage customer orders"
                icon={Package}
                accent="blue"
            />

            <div className="glass-panel rounded-2xl border border-gray-800/60 p-3 sm:p-6">
                <div className="overflow-x-auto rounded-xl border border-gray-800/60">
                    <table className="w-full min-w-[760px] text-left text-sm">
                        <thead className="bg-black/40 text-gray-400 font-orbitron text-xs uppercase tracking-wider">
                            <tr className="border-b border-gray-800/60">
                                <th className="px-6 py-4 font-medium">Order ID</th>
                                <th className="px-6 py-4 font-medium">Customer</th>
                                <th className="px-6 py-4 font-medium">Items</th>
                                <th className="px-6 py-4 font-medium">Total</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/60">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-400 group-hover:text-emerald-400 transition-colors">
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-400 font-mono font-bold">
                                        ${(order.amount / 100).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${order.status === 'completed'
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
                                        <OrderActions order={order} />
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
