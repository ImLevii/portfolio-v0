import { db } from "@/lib/db"
import { startOfDay, startOfWeek, startOfMonth, startOfYear, format, subDays, subWeeks, subMonths, subYears } from "date-fns"

export async function getRevenueData() {
    const orders = await db.order.findMany({
        where: { status: "completed" },
        orderBy: { createdAt: "asc" }
    })

    // Helper to group and sum
    const groupOrders = (orders: any[], formatStr: string) => {
        const grouped = orders.reduce((acc, order) => {
            const date = format(order.createdAt, formatStr)
            acc[date] = (acc[date] || 0) + order.amount
            return acc
        }, {} as Record<string, number>)

        return Object.entries(grouped).map(([name, total]) => ({
            name,
            total: (total as number) / 100 // Convert cents to dollars
        }))
    }

    // Daily (last 30 days)
    const dailyData = groupOrders(
        orders.filter(o => o.createdAt >= subDays(new Date(), 30)),
        "MMM dd"
    )

    // Weekly (last 12 weeks)
    // For weekly, we might want "Week of X"
    const weeklyData = groupOrders(
        orders.filter(o => o.createdAt >= subWeeks(new Date(), 12)),
        "yyyy-'W'ww"
    )

    // Monthly (last 12 months)
    const monthlyData = groupOrders(
        orders.filter(o => o.createdAt >= subMonths(new Date(), 12)),
        "MMM yyyy"
    )

    // Yearly (all time)
    const yearlyData = groupOrders(orders, "yyyy")

    return {
        daily: dailyData,
        weekly: weeklyData,
        monthly: monthlyData,
        yearly: yearlyData
    }
}

export async function getDashboardStats() {
    const [revenueData, productCount, orderCount, customerCount] = await Promise.all([
        getRevenueData(),
        db.product.count(),
        db.order.count({ where: { status: "completed" } }),
        db.user.count({ where: { role: "CUSTOMER" } })
    ])

    // Calculate total revenue
    const totalRevenue = await db.order.aggregate({
        where: { status: "completed" },
        _sum: { amount: true }
    })

    return {
        revenueData,
        stats: {
            totalRevenue: (totalRevenue._sum.amount || 0) / 100,
            productCount,
            orderCount,
            customerCount
        }
    }
}
