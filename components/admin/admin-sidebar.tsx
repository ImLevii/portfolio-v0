"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShoppingBag, Settings, LogOut, Package, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function AdminSidebar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)

    const links = [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/products", label: "Products", icon: ShoppingBag },
        { href: "/settings", label: "Settings", icon: Settings },
    ]

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-50 p-2 bg-black/50 backdrop-blur-md border border-white/10 rounded-lg md:hidden text-white"
            >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={cn(
                "w-64 border-r border-white/10 bg-black/90 backdrop-blur-xl fixed h-full z-40 transition-transform duration-300 ease-in-out md:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6 border-b border-white/10">
                    <Link href="/admin" className="text-2xl font-bold font-orbitron text-white group">
                        ADMIN<span className="text-green-500 group-hover:text-green-400 transition-colors">.PANEL</span>
                    </Link>
                </div>
                <nav className="p-4 space-y-2">
                    {links.map((link) => {
                        const Icon = link.icon
                        const isActive = pathname === link.href

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group relative overflow-hidden",
                                    isActive
                                        ? "bg-green-500/10 text-green-400"
                                        : "hover:bg-white/5 text-gray-400 hover:text-white"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-r-full" />
                                )}
                                <Icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive && "text-green-500")} />
                                <span className="font-medium">{link.label}</span>

                                {isActive && (
                                    <div className="absolute inset-0 bg-green-500/5 blur-xl -z-10" />
                                )}
                            </Link>
                        )
                    })}

                    <Link
                        href="/"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all duration-300 mt-8 border-t border-white/10 pt-4 group"
                    >
                        <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        <span>Exit Admin</span>
                    </Link>
                </nav>

                {/* Decorative background element */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-green-900/10 to-transparent pointer-events-none" />
            </aside>
        </>
    )
}
