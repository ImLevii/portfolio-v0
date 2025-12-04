"use client"

import Link from "next/link"
import { ShoppingBag, Users, DollarSign, Package, TrendingUp, ArrowUpRight } from "lucide-react"
import { motion } from "framer-motion"

interface StatsGridProps {
    stats: {
        totalRevenue: number
        orderCount: number
        customerCount: number
        productCount: number
    }
}

export function StatsGrid({ stats }: StatsGridProps) {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
            <motion.div variants={item} className="p-6 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex items-center justify-between mb-4 relative z-10">
                    <h3 className="text-sm font-medium text-gray-400">Total Revenue</h3>
                    <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                        <DollarSign className="h-5 w-5" />
                    </div>
                </div>
                <div className="text-3xl font-bold text-white font-orbitron relative z-10">
                    ${stats.totalRevenue.toFixed(2)}
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-green-400 relative z-10">
                    <TrendingUp className="h-3 w-3" />
                    <span>+12.5% from last month</span>
                </div>
            </motion.div>

            <motion.div variants={item} className="p-6 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex items-center justify-between mb-4 relative z-10">
                    <h3 className="text-sm font-medium text-gray-400">Orders</h3>
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                        <Package className="h-5 w-5" />
                    </div>
                </div>
                <div className="text-3xl font-bold text-white font-orbitron relative z-10">
                    {stats.orderCount}
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-blue-400 relative z-10">
                    <TrendingUp className="h-3 w-3" />
                    <span>+4 new today</span>
                </div>
            </motion.div>

            <motion.div variants={item} className="p-6 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex items-center justify-between mb-4 relative z-10">
                    <h3 className="text-sm font-medium text-gray-400">Customers</h3>
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                        <Users className="h-5 w-5" />
                    </div>
                </div>
                <div className="text-3xl font-bold text-white font-orbitron relative z-10">
                    {stats.customerCount}
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-purple-400 relative z-10">
                    <TrendingUp className="h-3 w-3" />
                    <span>Active users</span>
                </div>
            </motion.div>

            <Link href="/admin/products" className="block h-full">
                <motion.div variants={item} className="p-6 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl relative overflow-hidden group h-full hover:border-orange-500/50 transition-colors duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <h3 className="text-sm font-medium text-gray-400 group-hover:text-orange-400 transition-colors">Products</h3>
                        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                            <ShoppingBag className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-white font-orbitron relative z-10">
                        {stats.productCount}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-orange-400 relative z-10 group-hover:translate-x-1 transition-transform">
                        <span>Manage Inventory</span>
                        <ArrowUpRight className="h-3 w-3" />
                    </div>
                </motion.div>
            </Link>
        </motion.div>
    )
}
