import Link from "next/link"
import { ShoppingBag, Users, DollarSign, Package, LayoutDashboard } from "lucide-react"
import { getDashboardStats } from "@/lib/admin"
import { RevenueChart } from "@/components/admin/revenue-chart"
import { StatsCard } from "@/components/admin/stats-card"
import { SystemStatus } from "@/components/admin/system-status"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import * as motion from "framer-motion/client"

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
    const { revenueData, stats } = await getDashboardStats()

    // Every card links to the page it summarizes, so the hover effect matches what a click does
    const cards = [
        { title: "Total Revenue", value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: "emerald", href: "/admin/orders" },
        { title: "Orders", value: stats.orderCount, icon: Package, color: "blue", href: "/admin/orders" },
        { title: "Customers", value: stats.customerCount, icon: Users, color: "purple", href: "/admin/customers" },
        { title: "Products", value: stats.productCount, icon: ShoppingBag, color: "orange", href: "/admin/products" },
    ] as const

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <AdminPageHeader
                title="Dashboard"
                description="Overview of your store performance"
                icon={LayoutDashboard}
                actions={<SystemStatus />}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6 xl:grid-cols-4">
                {cards.map((card) => (
                    <Link
                        key={card.title}
                        href={card.href}
                        className="group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60"
                    >
                        <StatsCard title={card.title} value={card.value} icon={card.icon} color={card.color} />
                    </Link>
                ))}
            </div>

            <RevenueChart data={revenueData} />
        </motion.div>
    )
}
