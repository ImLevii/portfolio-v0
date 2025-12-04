"use client"

import { useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Area, AreaChart, Defs, LinearGradient, Stop } from "recharts"
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
        daily: { data: data.daily, color: "#22c55e", gradientId: "colorGreen" },
        weekly: { data: data.weekly, color: "#3b82f6", gradientId: "colorBlue" },
        monthly: { data: data.monthly, color: "#a855f7", gradientId: "colorPurple" },
        yearly: { data: data.yearly, color: "#f97316", gradientId: "colorOrange" },
    }

    const currentConfig = chartConfig[activeTab as keyof typeof chartConfig]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <Card className="bg-black/40 border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

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
                            <TabsList className="bg-black/50 border border-white/10 p-1">
                                {Object.keys(chartConfig).map((tab) => (
                                    <TabsTrigger
                                        key={tab}
                                        value={tab}
                                        className="capitalize data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-none transition-all duration-300"
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
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorPurple" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorOrange" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
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
