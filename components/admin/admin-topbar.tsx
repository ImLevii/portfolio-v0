"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ExternalLink, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { UserMenu } from "@/components/auth/user-menu"
import { CartPopover } from "@/components/shop/cart-popover"
import { isAdminLinkActive } from "@/components/admin/admin-sidebar"

const quickLinks = [
    { name: "DASHBOARD", href: "/admin" },
    { name: "PRODUCTS", href: "/admin/products" },
    { name: "LICENSES", href: "/licenses" },
    { name: "SETTINGS", href: "/settings" },
]

// Same glass treatment as the cart button so the controls read as one set
const glassStyle = {
    boxShadow: "0 4px 12px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1)",
    backdropFilter: "blur(16px) saturate(180%)",
    WebkitBackdropFilter: "blur(16px) saturate(180%)",
}

/**
 * Admin replacement for the site navbar: sits beside the sidebar instead of under it,
 * and has a fixed height that matches the sidebar's brand row.
 */
export function AdminTopbar({ user, onOpenMenu }: { user: any; onOpenMenu: () => void }) {
    const pathname = usePathname()

    return (
        <header className="sticky top-0 z-30 h-16 border-b border-white/5 bg-black/60 backdrop-blur-xl">
            <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                {/* Mobile: menu toggle + brand (the sidebar is hidden) */}
                <div className="flex items-center gap-2 md:hidden">
                    <button
                        type="button"
                        onClick={onOpenMenu}
                        aria-label="Open menu"
                        className="-ml-2 flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 text-white transition-colors hover:bg-white/10"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <Link href="/admin" className="font-orbitron text-lg font-bold text-white">
                        ADMIN<span className="text-green-500">.PANEL</span>
                    </Link>
                </div>

                {/* Desktop quick links */}
                <nav className="hidden items-center gap-1 md:flex lg:gap-3">
                    {quickLinks.map((link) => {
                        const isActive = isAdminLinkActive(pathname, link.href)
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                aria-current={isActive ? "page" : undefined}
                                className={cn(
                                    "group relative px-2 py-1 font-orbitron text-xs font-bold tracking-wide transition-colors lg:text-sm",
                                    isActive ? "text-green-400" : "text-white/70 hover:text-green-400"
                                )}
                            >
                                {link.name}
                                <span
                                    className={cn(
                                        "absolute -bottom-1 left-2 right-2 h-0.5 origin-left bg-green-500 transition-transform duration-300",
                                        isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                                    )}
                                />
                            </Link>
                        )
                    })}
                </nav>

                <div className="flex items-center gap-2 sm:gap-3">
                    <Link
                        href="/"
                        aria-label="View site"
                        className="hidden h-11 items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 font-orbitron text-xs font-bold uppercase tracking-wider text-white/80 transition-colors hover:bg-white/15 hover:text-white sm:flex"
                        style={glassStyle}
                    >
                        <ExternalLink className="h-4 w-4" />
                        <span className="hidden lg:inline">View Site</span>
                    </Link>
                    <UserMenu user={user} />
                    <CartPopover user={user} />
                </div>
            </div>
        </header>
    )
}
