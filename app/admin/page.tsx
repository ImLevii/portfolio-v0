import Link from "next/link"
import { ShoppingBag, Users, DollarSign, Package } from "lucide-react"
import { getDashboardStats } from "@/lib/admin"
import { RevenueChart } from "@/components/admin/revenue-chart"

export default async function AdminDashboard() {
    const { revenueData, stats } = await getDashboardStats()

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold font-orbitron">Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-emerald-500/20">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-400 group-hover:text-emerald-400 transition-colors">Total Revenue</h3>
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                            <DollarSign className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white neon-text-glow">${stats.totalRevenue.toFixed(2)}</div>
                </div>

                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-blue-500/20">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-400 group-hover:text-blue-400 transition-colors">Orders</h3>
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                            <Package className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white">{stats.orderCount}</div>
                </div>

                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-purple-500/20">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-400 group-hover:text-purple-400 transition-colors">Customers</h3>
                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                            <Users className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white">{stats.customerCount}</div>
                </div>

                <Link href="/admin/products" className="group">
                    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-orange-500/20 h-full">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-400 group-hover:text-orange-400 transition-colors">Products</h3>
                            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                <ShoppingBag className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-white">{stats.productCount}</div>
                    </div>
                </Link>
            </div>

            {/* Revenue Chart */}
            <RevenueChart data={revenueData} />
        </div>
    )
}
