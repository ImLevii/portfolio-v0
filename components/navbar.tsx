"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Code, Menu, X, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { SignIn } from "@/components/auth/sign-in"
import { UserMenu } from "@/components/auth/user-menu"

import { CartSheet } from "@/components/shop/cart-sheet"

export default function Navbar({ user }: { user?: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith("/admin")
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

  const navLinks = isAdmin ? adminLinks : (isShop ? shopLinks : mainLinks)

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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center relative z-50">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
          <div className="relative">
            <Code className={cn("h-6 w-6 sm:h-7 sm:w-7 lg:h-9 lg:w-9 transition-transform duration-300 group-hover:scale-110", accentColor)} />
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
          <CartSheet user={user} />
        </nav>

        {/* Mobile Menu Actions */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="flex items-center gap-2">
            <CartSheet user={user} />
            {user ? <UserMenu user={user} /> : <SignIn compact={true} isShop={isShop} />}
          </div>
          <div className="w-px h-8 bg-white/10 mx-1"></div>
          <button
            className="relative p-2 text-white hover:bg-white/10 rounded-lg transition-colors border border-white/10"
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
