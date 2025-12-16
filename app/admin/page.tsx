import Link from "next/link"
import { ShoppingBag, Users, DollarSign, Package } from "lucide-react"
import { getDashboardStats } from "@/lib/admin"
import { RevenueChart } from "@/components/admin/revenue-chart"
import { StatsCard } from "@/components/admin/stats-card"
import { SystemStatus } from "@/components/admin/system-status"
import * as motion from "framer-motion/client"

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
    const { revenueData, stats } = await getDashboardStats()

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold font-orbitron text-white neon-text-glow">Dashboard</h1>
                    <p className="text-gray-400 mt-2 font-light tracking-wide">Overview of your store performance</p>
                </div>
                <div className="flex items-center gap-4">
                    <SystemStatus />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Revenue"
                    value={`$${stats.totalRevenue.toFixed(2)}`}
                    icon={DollarSign}
                    color="emerald"
                />
                <StatsCard
                    title="Orders"
                    value={stats.orderCount}
                    icon={Package}
                    color="blue"
                />
                <StatsCard
                    title="Customers"
                    value={stats.customerCount}
                    icon={Users}
                    color="purple"
                />
                <Link href="/admin/products" className="group block h-full">
                    <StatsCard
                        title="Products"
                        value={stats.productCount}
                        icon={ShoppingBag}
                        color="orange"
                    />
                </Link>
            </div>

            {/* Revenue Chart */}
            <RevenueChart data={revenueData} />
        </motion.div>
    )
}
