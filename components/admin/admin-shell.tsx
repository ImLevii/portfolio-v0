"use client"

import { useEffect, useState, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminTopbar } from "@/components/admin/admin-topbar"

/** Client frame for the admin area: owns the mobile menu state shared by the sidebar and top bar. */
export function AdminShell({ user, children }: { user: any; children: ReactNode }) {
    const [menuOpen, setMenuOpen] = useState(false)
    const pathname = usePathname()

    // Close the mobile menu after navigating
    useEffect(() => {
        setMenuOpen(false)
    }, [pathname])

    // While the mobile menu is open: Escape closes it and the page behind doesn't scroll
    useEffect(() => {
        if (!menuOpen) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setMenuOpen(false)
        }
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = "hidden"
        window.addEventListener("keydown", onKey)
        return () => {
            document.body.style.overflow = previousOverflow
            window.removeEventListener("keydown", onKey)
        }
    }, [menuOpen])

    return (
        <div className="min-h-screen bg-black font-sans text-white selection:bg-green-500/30">
            {/* Background layers, fixed so they don't shift with page length */}
            <div aria-hidden="true" className="pointer-events-none fixed inset-0 md:left-64">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-black to-black" />
                <div className="absolute inset-0 bg-grid-pattern opacity-20" />
                <div className="absolute left-1/4 top-1/4 h-2 w-2 rounded-full bg-emerald-500 opacity-20 animate-float" />
                <div className="absolute left-3/4 top-3/4 h-3 w-3 rounded-full bg-emerald-500 opacity-10 animate-float [animation-delay:2s]" />
                <div className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-emerald-400 opacity-30 animate-float [animation-delay:4s]" />
            </div>

            <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

            <div className="relative md:pl-64">
                <AdminTopbar user={user} onOpenMenu={() => setMenuOpen(true)} />
                <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                    <div className="mx-auto w-full max-w-7xl">{children}</div>
                </main>
            </div>
        </div>
    )
}
