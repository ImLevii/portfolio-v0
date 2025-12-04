"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

const slides = [
    {
        id: 1,
        title: "NEW ARRIVALS",
        subtitle: "CHECK OUT THE LATEST TOOLS",
        description: "Upgrade your workflow with our newest developer assets.",
        cta: "BROWSE NOW",
        color: "from-green-500 to-emerald-700",
        accent: "text-green-400",
        button: "bg-green-600 hover:bg-green-700 text-white shadow-green-900/20 hover:shadow-green-500/40"
    },
    {
        id: 2,
        title: "LIMITED OFFER",
        subtitle: "GET 50% OFF UI BUNDLE",
        description: "Complete collection of React components at half price.",
        cta: "GRAB DEAL",
        color: "from-emerald-500 to-teal-700",
        accent: "text-emerald-400",
        button: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/20 hover:shadow-emerald-500/40"
    },
    {
        id: 3,
        title: "PREMIUM ICONS",
        subtitle: "PIXEL PERFECT VECTORS",
        description: "Over 200+ custom icons for your next big project.",
        cta: "VIEW PACK",
        color: "from-lime-500 to-green-700",
        accent: "text-lime-400",
        button: "bg-lime-600 hover:bg-lime-700 text-white shadow-lime-900/20 hover:shadow-lime-500/40"
    }
]

export function ShopCarousel() {
    const [current, setCurrent] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [])

    return (
        <div className="relative mb-12 overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm shadow-2xl">
            <div className="relative h-[400px] md:h-[300px] w-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={current}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 flex flex-col justify-center px-6 md:px-16"
                    >
                        {/* Background Gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${slides[current].color} opacity-10`} />
                        <div className={`absolute -right-20 -top-20 h-96 w-96 rounded-full bg-gradient-to-br ${slides[current].color} opacity-20 blur-3xl`} />

                        <div className="relative z-10 max-w-2xl">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className={`mb-2 text-xs md:text-sm font-bold tracking-widest ${slides[current].accent}`}
                            >
                                {slides[current].subtitle}
                            </motion.div>

                            <motion.h2
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="mb-4 text-3xl md:text-5xl font-black font-orbitron text-white italic tracking-wide"
                            >
                                {slides[current].title}
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="mb-8 text-base md:text-lg text-gray-300"
                            >
                                {slides[current].description}
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <Button
                                    size="lg"
                                    className="gap-2 bg-gradient-to-r from-gray-800/60 to-gray-900/60 border border-gray-700/40 backdrop-blur-sm hover:bg-gray-800/80 transition-all duration-300 shadow-lg group"
                                    style={{
                                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.3)'
                                    }}
                                >
                                    <span className={`bg-clip-text text-transparent bg-gradient-to-r ${slides[current].color} font-orbitron tracking-wider`}>
                                        {slides[current].cta}
                                    </span>
                                    <ArrowRight className={`h-4 w-4 ${slides[current].accent}`} />
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Pagination Dots */}
                <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-3">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrent(index)}
                            className={`h-2.5 rounded-full transition-all duration-300 ${current === index
                                ? `w-8 ${slides[current].accent.replace('text-', 'bg-')}`
                                : "w-2.5 bg-gray-700 hover:bg-gray-600"
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
