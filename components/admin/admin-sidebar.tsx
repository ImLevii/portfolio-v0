"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    CreditCard,
    FolderKanban,
    GalleryHorizontalEnd,
    Headphones,
    LayoutDashboard,
    LogOut,
    Megaphone,
    MessageSquare,
    Package,
    ShoppingBag,
    Snowflake,
    Tags,
    TicketPercent,
    Users,
    X,
    type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { handleSignOut } from "@/app/actions"

type NavLink = { href: string; label: string; icon: LucideIcon }

// One icon per destination, grouped so the list scans quickly
const sections: { title: string; links: NavLink[] }[] = [
    {
        title: "Overview",
        links: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
    },
    {
        title: "Store",
        links: [
            { href: "/admin/products", label: "Products", icon: ShoppingBag },
            { href: "/admin/categories", label: "Categories", icon: Tags },
            { href: "/admin/orders", label: "Orders", icon: Package },
            { href: "/admin/coupons", label: "Coupons", icon: TicketPercent },
            { href: "/admin/settings/payments", label: "Payment Settings", icon: CreditCard },
        ],
    },
    {
        title: "Community",
        links: [
            { href: "/admin/customers", label: "Users & Roles", icon: Users },
            { href: "/admin/chat", label: "Live Chat", icon: MessageSquare },
            { href: "/admin/sponsored", label: "Sponsored", icon: Megaphone },
            { href: "/admin/support", label: "Support Hub", icon: Headphones },
        ],
    },
    {
        title: "Site",
        links: [
            { href: "/admin/projects", label: "Projects", icon: FolderKanban },
            { href: "/admin/carousel", label: "Carousel", icon: GalleryHorizontalEnd },
            { href: "/admin/seasonal", label: "Seasonal Effects", icon: Snowflake },
        ],
    },
]

/** Dashboard matches exactly; other sections stay highlighted on their sub-pages (e.g. /admin/products/123). */
export function isAdminLinkActive(pathname: string | null, href: string) {
    if (!pathname) return false
    if (href === "/admin") return pathname === "/admin"
    return pathname === href || pathname.startsWith(`${href}/`)
}

export function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
    const pathname = usePathname()

    return (
        <>
            {/* Mobile overlay */}
            <div
                aria-hidden="true"
                onClick={onClose}
                className={cn(
                    "fixed inset-0 z-40 bg-black/80 backdrop-blur-sm transition-opacity duration-300 md:hidden",
                    open ? "opacity-100" : "pointer-events-none opacity-0"
                )}
            />

            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/5 bg-black/80 backdrop-blur-xl transition-transform duration-300 ease-in-out md:translate-x-0",
                    open ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Brand — same height as the top bar so their borders line up */}
                <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/5 px-6">
                    <Link href="/admin" className="group font-orbitron text-2xl font-bold text-white">
                        ADMIN<span className="text-green-500 transition-colors group-hover:text-green-400">.PANEL</span>
                    </Link>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close menu"
                        className="-mr-2 flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/5 hover:text-white md:hidden"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-4">
                    {sections.map((section, i) => (
                        <div key={section.title} className={cn(i > 0 && "mt-6")}>
                            <p className="mb-2 px-3 font-orbitron text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                                {section.title}
                            </p>
                            <ul className="space-y-1">
                                {section.links.map((link) => {
                                    const Icon = link.icon
                                    const isActive = isAdminLinkActive(pathname, link.href)
                                    return (
                                        <li key={link.href}>
                                            <Link
                                                href={link.href}
                                                aria-current={isActive ? "page" : undefined}
                                                className={cn(
                                                    "group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300",
                                                    isActive
                                                        ? "bg-emerald-500/10 text-emerald-400 neon-text-glow"
                                                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                                                )}
                                            >
                                                {isActive && (
                                                    <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-emerald-500 neon-glow" />
                                                )}
                                                <Icon
                                                    className={cn(
                                                        "h-[18px] w-[18px] shrink-0 transition-transform group-hover:scale-110",
                                                        isActive && "text-emerald-500"
                                                    )}
                                                />
                                                <span>{link.label}</span>
                                            </Link>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                <div className="shrink-0 border-t border-white/5 p-3">
                    <button
                        type="button"
                        onClick={() => handleSignOut()}
                        className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-gray-400 transition-all duration-300 hover:bg-red-500/10 hover:text-red-400"
                    >
                        <LogOut className="h-[18px] w-[18px] shrink-0 transition-transform group-hover:-translate-x-1" />
                        <span>Sign Out</span>
                    </button>
                </div>

                {/* Decorative glow */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-green-900/10 to-transparent" />
            </aside>
        </>
    )
}
