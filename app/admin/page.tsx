import Link from "next/link"
import { ShoppingBag, Users, DollarSign, Package } from "lucide-react"
import { getDashboardStats } from "@/lib/admin"
import { RevenueChart } from "@/components/admin/revenue-chart"
import { StatsCard } from "@/components/admin/stats-card"

export default async function AdminDashboard() {
    const { revenueData, stats } = await getDashboardStats()

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold font-orbitron">Dashboard</h1>

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
        </div>
    )
}
