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
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-400">Total Revenue</h3>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-white">${stats.totalRevenue.toFixed(2)}</div>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-400">Orders</h3>
                        <Package className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-white">{stats.orderCount}</div>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-400">Customers</h3>
                        <Users className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className="text-2xl font-bold text-white">{stats.customerCount}</div>
                </div>

                <Link href="/admin/products" className="group">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-green-500/50 transition-all duration-300 h-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-400 group-hover:text-green-400 transition-colors">Products</h3>
                            <ShoppingBag className="h-4 w-4 text-orange-500" />
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
