"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Code, Menu, X, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { SignIn } from "@/components/auth/sign-in"
import { UserMenu } from "@/components/auth/user-menu"
import type { SeasonalSettingsConfig } from "@/actions/seasonal-settings"

import { CartPopover } from "@/components/shop/cart-popover"

export default function Navbar({ user, seasonalSettings }: { user?: any; seasonalSettings?: SeasonalSettingsConfig }) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith("/admin")

  const isSummer = (() => {
    // Explicit admin choice — always show palm tree regardless of `enabled`
    if (seasonalSettings?.mode === 'summer') return true
    // Auto mode — respect enabled flag + check calendar month (Jun–Aug)
    if (!seasonalSettings?.mode || seasonalSettings?.mode === 'auto') {
      if (!(seasonalSettings?.enabled ?? true)) return false
      const month = new Date().getMonth()
      return month >= 5 && month <= 7
    }
    return false
  })()
  const isShop = pathname?.startsWith("/shop") || pathname?.startsWith("/settings") || pathname?.startsWith("/licenses") || isAdmin

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const mainLinks = [
    { name: "HOME", href: "/#home" },
    { name: "ABOUT", href: "/#about" },
    { name: "SKILLS", href: "/#skills" },
    { name: "PROJECTS", href: "/#projects" },
    { name: "SHOP", href: "/shop" },
    { name: "CONTACT", href: "/#contact" },
  ]

  const adminLinks = [
    { name: "DASHBOARD", href: "/admin" },
    { name: "PRODUCTS", href: "/admin/products" },
    { name: "LICENSES", href: "/licenses" },
    { name: "SETTINGS", href: "/settings" },
  ]

  const shopLinks = [
    { name: "SHOP", href: "/shop" },
    { name: "LICENSES", href: "/licenses" },
    { name: "SETTINGS", href: "/settings" },
  ]

  const navLinks = isAdmin ? adminLinks : (isShop || user ? shopLinks : mainLinks)

  const toggleMenu = () => setIsOpen(!isOpen)



  const accentColor = isShop ? "text-green-500" : "text-red-500"
  const hoverColor = isShop ? "hover:text-green-400" : "hover:text-red-400"
  const bgColor = isShop ? "bg-green-500" : "bg-red-500"
  const shadowColor = isShop ? "shadow-green-900/5" : "shadow-red-900/5"
  const bgOpacityColor = isShop ? "bg-green-500/20" : "bg-red-500/20"

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-30 transition-all duration-500 font-bold text-white",
        "backdrop-blur-md border-b border-white/5",
        scrolled
          ? `py-3 sm:py-4 bg-black/40 shadow-lg ${shadowColor}`
          : "py-4 sm:py-6 bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center relative z-50" style={{ paddingLeft: 'max(1rem, env(safe-area-inset-left))', paddingRight: 'max(1rem, env(safe-area-inset-right))' }}>
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
          <div className="relative">
            {isSummer ? (
              <PalmTree className="h-7 w-5 sm:h-8 sm:w-6 lg:h-10 lg:w-8 transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
            ) : (
              <Code className={cn("h-6 w-6 sm:h-7 sm:w-7 lg:h-9 lg:w-9 transition-transform duration-300 group-hover:scale-110", accentColor)} />
            )}
            <div className={cn("absolute inset-0 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300", bgOpacityColor)}></div>
          </div>
          <span className={cn("text-lg sm:text-xl lg:text-2xl font-bold font-orbitron text-white transition-colors duration-300", isShop ? "group-hover:text-green-300" : "group-hover:text-red-300")}>
            LEVIK<span className={accentColor}>.DEV</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 xl:gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn("text-sm lg:text-base font-bold font-orbitron text-white/80 transition-colors relative group px-2 py-1", hoverColor)}
            >
              {link.name}
              <span className={cn("absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full", bgColor)}></span>
            </Link>
          ))}
          {user ? <UserMenu user={user} /> : <SignIn isShop={isShop} />}
          <CartPopover user={user} />
        </nav>

        {/* Mobile Menu Actions */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="flex items-center gap-2">
            <CartPopover user={user} />
            {user ? <UserMenu user={user} /> : <SignIn compact={true} isShop={isShop} />}
          </div>
          <div className="w-px h-8 bg-white/10 mx-1"></div>
          <button
            className="relative p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-white hover:bg-white/10 rounded-lg transition-colors border border-white/10"
            onClick={toggleMenu}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/10 md:hidden overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "group flex items-center justify-between p-4 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300",
                    isShop ? "hover:border-green-500/50" : "hover:border-red-500/50"
                  )}
                >
                  <span className={cn("font-orbitron font-bold tracking-wider text-white group-hover:text-white transition-colors", isShop ? "group-hover:text-green-400" : "group-hover:text-red-400")}>
                    {link.name}
                  </span>
                  <ChevronRight className={cn("w-5 h-5 text-white/50 transition-transform group-hover:translate-x-1", isShop ? "group-hover:text-green-400" : "group-hover:text-red-400")} />
                </Link>
              ))}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

function PalmTree({ className }: { className?: string }) {
  return (
    <motion.svg
      width="26"
      height="36"
      viewBox="0 0 52 70"
      className={className}
      aria-hidden="true"
    >
      <defs>
        {/* Trunk: cylindrical shading — dark edges, warm highlight at center */}
        <linearGradient id="pt-trunk" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#1c0800" />
          <stop offset="20%"  stopColor="#7c3410" />
          <stop offset="46%"  stopColor="#c8803a" />
          <stop offset="72%"  stopColor="#6b2c0e" />
          <stop offset="100%" stopColor="#1c0800" />
        </linearGradient>
        {/* Per-frond gradients for directional light from upper-left */}
        <linearGradient id="pt-fl"  x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%"   stopColor="#4ade80" /><stop offset="100%" stopColor="#14532d" /></linearGradient>
        <linearGradient id="pt-fr"  x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%"   stopColor="#4ade80" /><stop offset="100%" stopColor="#14532d" /></linearGradient>
        <linearGradient id="pt-ft"  x1="50%" y1="100%" x2="50%" y2="0%"><stop offset="0%"   stopColor="#22c55e" /><stop offset="100%" stopColor="#86efac" /></linearGradient>
        <linearGradient id="pt-fdl" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%"   stopColor="#16a34a" /><stop offset="100%" stopColor="#052e16" /></linearGradient>
        <linearGradient id="pt-fdr" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%"   stopColor="#16a34a" /><stop offset="100%" stopColor="#052e16" /></linearGradient>
        {/* Coconut radial gradients — bright specular highlight + deep shadow */}
        <radialGradient id="pt-c1" cx="34%" cy="28%" r="65%">
          <stop offset="0%"   stopColor="#fbbf24" />
          <stop offset="50%"  stopColor="#92400e" />
          <stop offset="100%" stopColor="#1c0800" />
        </radialGradient>
        <radialGradient id="pt-c2" cx="34%" cy="28%" r="65%">
          <stop offset="0%"   stopColor="#d97706" />
          <stop offset="50%"  stopColor="#7c2d12" />
          <stop offset="100%" stopColor="#1c0800" />
        </radialGradient>
        <radialGradient id="pt-c3" cx="34%" cy="28%" r="65%">
          <stop offset="0%"   stopColor="#ca8a04" />
          <stop offset="50%"  stopColor="#7c3410" />
          <stop offset="100%" stopColor="#1c0800" />
        </radialGradient>
      </defs>

      {/* Whole tree sways gently from trunk base */}
      <motion.g
        animate={{ rotate: [-3, 3.5, -3] }}
        style={{ transformOrigin: "26px 69px" }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Ground shadow — grounds the tree */}
        <ellipse cx="26" cy="69" rx="7" ry="1.5" fill="#000" opacity="0.22" />

        {/* ── TRUNK ── */}
        {/* Filled cylindrical shape: wider at base, slight left lean */}
        <path
          d="M22 69 C21 56 19 40 20 28 C21 23 23 20 26 20 C29 20 31 23 31 28 C30 40 29 56 30 69 Z"
          fill="url(#pt-trunk)"
        />
        {/* Trunk highlight stripe — center column brightens further */}
        <path
          d="M25 69 C24.5 56 24 42 25 28"
          stroke="#e8a060" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.25"
        />
        {/* Frond scar rings (horizontal arcs — classic palm texture) */}
        <path d="M20 61 Q26 60 31 61" stroke="#100500" strokeWidth="0.9" fill="none" opacity="0.6" />
        <path d="M20 53 Q26 52 31 53" stroke="#100500" strokeWidth="0.9" fill="none" opacity="0.6" />
        <path d="M20 46 Q26 45 31 46" stroke="#100500" strokeWidth="0.9" fill="none" opacity="0.5" />
        <path d="M20 39 Q26 38 31 39" stroke="#100500" strokeWidth="0.8" fill="none" opacity="0.45" />
        <path d="M20 32 Q26 31 30 32" stroke="#100500" strokeWidth="0.8" fill="none" opacity="0.35" />

        {/* ── FRONDS — secondary sway pivoting at crown ── */}
        <motion.g
          animate={{ rotate: [-5, 7, -5] }}
          style={{ transformOrigin: "24px 22px" }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        >
          {/* Upper-left frond: filled leaf silhouette + midrib + leaflets */}
          <path d="M26 22 C18 17 10 12 1 8 C7 11 15 15 21 20 Z"        fill="url(#pt-fl)" />
          <path d="M26 22 C18 17 10 12 1 8"                             stroke="#0f4c24" strokeWidth="0.85" fill="none" />
          <line x1="21" y1="19" x2="19" y2="14" stroke="#166534" strokeWidth="0.75" opacity="0.8" />
          <line x1="15" y1="16" x2="12" y2="11" stroke="#166534" strokeWidth="0.75" opacity="0.8" />
          <line x1="9"  y1="13" x2="5"  y2="8"  stroke="#166534" strokeWidth="0.65" opacity="0.7" />

          {/* Lower-left frond: drooping */}
          <path d="M26 22 C17 27 9 32 1 37 C7 32 16 27 22 23 Z"         fill="url(#pt-fdl)" />
          <path d="M26 22 C17 27 9 32 1 37"                              stroke="#0f4c24" strokeWidth="0.85" fill="none" />
          <line x1="20" y1="25" x2="17" y2="30" stroke="#166534" strokeWidth="0.75" opacity="0.8" />
          <line x1="12" y1="30" x2="9"  y2="35" stroke="#166534" strokeWidth="0.65" opacity="0.7" />

          {/* Top frond: upward center — slim leaf */}
          <path d="M26 22 C24 14 22 7 21 1 C24 7 27 14 26 22 Z"         fill="url(#pt-ft)" />
          <path d="M26 22 C25 14 24 7 23 1"                              stroke="#0f4c24" strokeWidth="0.85" fill="none" />
          <line x1="24" y1="15" x2="21" y2="13" stroke="#166534" strokeWidth="0.65" opacity="0.7" />
          <line x1="23" y1="9"  x2="20" y2="7"  stroke="#166534" strokeWidth="0.65" opacity="0.7" />
          <line x1="24" y1="15" x2="27" y2="13" stroke="#166534" strokeWidth="0.65" opacity="0.7" />
          <line x1="23" y1="9"  x2="26" y2="7"  stroke="#166534" strokeWidth="0.65" opacity="0.7" />

          {/* Upper-right frond */}
          <path d="M26 22 C34 17 42 12 51 8 C45 11 37 15 31 20 Z"       fill="url(#pt-fr)" />
          <path d="M26 22 C34 17 42 12 51 8"                             stroke="#0f4c24" strokeWidth="0.85" fill="none" />
          <line x1="31" y1="19" x2="33" y2="14" stroke="#166534" strokeWidth="0.75" opacity="0.8" />
          <line x1="37" y1="16" x2="40" y2="11" stroke="#166534" strokeWidth="0.75" opacity="0.8" />
          <line x1="43" y1="13" x2="47" y2="8"  stroke="#166534" strokeWidth="0.65" opacity="0.7" />

          {/* Lower-right frond: drooping */}
          <path d="M26 22 C35 27 43 32 51 37 C45 32 36 27 30 23 Z"      fill="url(#pt-fdr)" />
          <path d="M26 22 C35 27 43 32 51 37"                            stroke="#0f4c24" strokeWidth="0.85" fill="none" />
          <line x1="32" y1="25" x2="35" y2="30" stroke="#166534" strokeWidth="0.75" opacity="0.8" />
          <line x1="40" y1="30" x2="43" y2="35" stroke="#166534" strokeWidth="0.65" opacity="0.7" />

          {/* ── Coconuts: radial-gradient spheres clustered at crown ── */}
          <circle cx="23"   cy="25"   r="4"   fill="url(#pt-c1)" />
          <circle cx="28.5" cy="25.5" r="3.5" fill="url(#pt-c2)" />
          <circle cx="25"   cy="27.5" r="3"   fill="url(#pt-c3)" />
          {/* Specular highlight dots */}
          <circle cx="21.8" cy="23.5" r="1.3" fill="white" opacity="0.2" />
          <circle cx="27.2" cy="24"   r="1.1" fill="white" opacity="0.18" />
          <circle cx="24"   cy="26"   r="0.9" fill="white" opacity="0.16" />
        </motion.g>
      </motion.g>
    </motion.svg>
  )
}
