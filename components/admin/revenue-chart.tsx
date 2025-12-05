"use client"

import { useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Area, AreaChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"

interface RevenueChartProps {
    data: {
        daily: { name: string; total: number }[]
        weekly: { name: string; total: number }[]
        monthly: { name: string; total: number }[]
        yearly: { name: string; total: number }[]
    }
}

export function RevenueChart({ data }: RevenueChartProps) {
    const [activeTab, setActiveTab] = useState("daily")

    const chartConfig = {
        daily: { data: data.daily, color: "#10b981", gradientId: "colorGreen" }, // Emerald 500
        weekly: { data: data.weekly, color: "#06b6d4", gradientId: "colorCyan" }, // Cyan 500
        monthly: { data: data.monthly, color: "#8b5cf6", gradientId: "colorViolet" }, // Violet 500
        yearly: { data: data.yearly, color: "#f59e0b", gradientId: "colorAmber" }, // Amber 500
    }

    const currentConfig = chartConfig[activeTab as keyof typeof chartConfig]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <Card className="relative overflow-hidden rounded-xl border border-gray-800/60 bg-black/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-1px_0_rgba(0,0,0,0.2),0_2px_8px_rgba(0,0,0,0.3)] backdrop-blur-xl group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <CardHeader className="relative z-10">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-xl font-orbitron text-white flex items-center gap-2">
                                Revenue Overview
                                <span className="text-xs font-sans font-normal text-gray-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                                    Live Data
                                </span>
                            </CardTitle>
                            <p className="text-sm text-gray-400 mt-1">Track your earnings over time</p>
                        </div>
                        <Tabs defaultValue="daily" value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                            <TabsList className="bg-black/50 border border-white/10 p-1 rounded-full">
                                {Object.keys(chartConfig).map((tab) => (
                                    <TabsTrigger
                                        key={tab}
                                        value={tab}
                                        className="capitalize rounded-full data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/20 transition-all duration-300 px-4"
                                    >
                                        {tab}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </div>
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="h-[400px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={currentConfig.data}>
                                <defs>
                                    <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorCyan" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorViolet" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorAmber" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#666"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#666"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value}`}
                                    dx={-10}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "rgba(0,0,0,0.8)",
                                        borderColor: "rgba(255,255,255,0.1)",
                                        borderRadius: "12px",
                                        backdropFilter: "blur(10px)",
                                        boxShadow: "0 4px 20px rgba(0,0,0,0.5)"
                                    }}
                                    itemStyle={{ color: "#fff", fontWeight: "bold" }}
                                    cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 2 }}
                                    formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke={currentConfig.color}
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill={`url(#${currentConfig.gradientId})`}
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
