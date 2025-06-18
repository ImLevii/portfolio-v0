"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, Code } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

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

  // Handle clicks outside navbar to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      const navbar = document.querySelector('header')
      if (isOpen && navbar && !navbar.contains(target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 640px)').matches)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleMenu = () => setIsOpen(!isOpen)

  const navLinks = [
    { name: "HOME", href: "#home" },
    { name: "ABOUT", href: "#about" },
    { name: "SKILLS", href: "#skills" },
    { name: "PROJECTS", href: "#projects" },
    { name: "CONTACT", href: "#contact" },
  ]

  const handleLinkClick = () => {
    setIsOpen(false)
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-30 transition-all duration-500 font-bold text-black",
        "bg-black/40 backdrop-blur-xl",
        "border-b border-red-500/10",
        "shadow-[0_2px_15px_-3px_rgba(239,68,68,0.07)]",
        scrolled 
          ? "py-3 sm:py-4 bg-black/60 border-red-500/20 shadow-[0_2px_15px_-3px_rgba(239,68,68,0.15)]" 
          : "py-4 sm:py-6 bg-black/40 border-red-500/10"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
          <div className="relative">
            <Code className="h-6 w-6 sm:h-7 sm:w-7 lg:h-9 lg:w-9 text-red-500 transition-transform duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <span className="text-lg sm:text-xl lg:text-2xl font-bold font-orbitron text-white group-hover:text-red-300 transition-colors duration-300">
            LEVI<span className="text-red-500">.DEV</span>
          </span>
        </Link>
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 xl:gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm lg:text-base font-bold font-orbitron text-white/80 hover:text-red-500 transition-colors relative group px-2 py-1"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </nav>
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden relative p-3 hover:bg-white/10 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/50 group overflow-hidden" 
          onClick={toggleMenu} 
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          {/* Advanced background effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/15 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-xl"></div>
          {/* Animated border glow */}
          <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-red-500/30 transition-all duration-500"></div>
          {/* Animated hamburger icon */}
          <div className="relative w-6 h-6 flex flex-col justify-center items-center">
            {/* Top line with advanced animation */}
            <motion.div
              animate={isOpen ? { 
                rotate: 45, 
                y: 0, 
                scale: 1.1,
                backgroundColor: "#ef4444"
              } : { 
                rotate: 0, 
                y: -6, 
                scale: 1,
                backgroundColor: "#ffffff"
              }}
              transition={{ 
                duration: 0.4, 
                ease: "easeInOut",
                backgroundColor: { duration: 0.3 }
              }}
              className="absolute w-6 h-0.5 rounded-full shadow-lg group-hover:shadow-red-500/50 transition-all duration-300"
            />
            {/* Middle line with scale and fade */}
            <motion.div
              animate={isOpen ? { 
                opacity: 0, 
                scale: 0,
                x: -10,
                backgroundColor: "#ef4444"
              } : { 
                opacity: 1, 
                scale: 1,
                x: 0,
                backgroundColor: "#ffffff"
              }}
              transition={{ 
                duration: 0.3, 
                ease: "easeInOut",
                backgroundColor: { duration: 0.3 }
              }}
              className="absolute w-6 h-0.5 rounded-full shadow-lg group-hover:shadow-red-500/50 transition-all duration-300"
            />
            {/* Bottom line with advanced animation */}
            <motion.div
              animate={isOpen ? { 
                rotate: -45, 
                y: 0, 
                scale: 1.1,
                backgroundColor: "#ef4444"
              } : { 
                rotate: 0, 
                y: 6, 
                scale: 1,
                backgroundColor: "#ffffff"
              }}
              transition={{ 
                duration: 0.4, 
                ease: "easeInOut",
                backgroundColor: { duration: 0.3 }
              }}
              className="absolute w-6 h-0.5 rounded-full shadow-lg group-hover:shadow-red-500/50 transition-all duration-300"
            />
          </div>
          {/* Advanced pulse effects */}
          {isOpen && (
            <>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute inset-0 bg-red-500/20 rounded-xl"
              />
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 0 }}
                transition={{ duration: 1, ease: "easeOut", repeat: Infinity, repeatDelay: 1 }}
                className="absolute inset-0 bg-red-500/10 rounded-xl"
              />
            </>
          )}
          {/* Hover ripple effect */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent rounded-xl"
          />
        </button>
      </div>
      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 md:hidden"
            onClick={toggleMenu}
          >
            {/* Clickable backdrop - this is the main clickable area */}
            <div 
              className="absolute inset-0 bg-black/30 backdrop-blur-md transition-all duration-300 hover:bg-black/40 cursor-pointer"
              onClick={toggleMenu}
            ></div>
            {/* Animated glass pattern and floating particles only on >=sm */}
            {!isMobile && (
              <>
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-red-500/5"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,0,0,0.1),transparent_40%)]"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,0,0,0.08),transparent_40%)]"></div>
                </div>
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-red-500/20 rounded-full blur-sm animate-pulse"></div>
                  <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-red-500/30 rounded-full blur-sm animate-pulse" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-red-500/25 rounded-full blur-sm animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>
              </>
            )}
            {/* Click hint text - pointer-events-none */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/60 text-sm font-medium opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              Click to close
            </div>
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ 
                type: "spring", 
                damping: 25, 
                stiffness: 200,
                duration: 0.4 
              }}
              className="absolute right-0 top-0 h-screen w-64 sm:w-80 max-w-[90vw] rounded-l-3xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Carousel-style backdrop with multiple layers */}
              {!isMobile && (
                <div className="absolute inset-0 carousel-backdrop rounded-l-3xl">
                  {/* Animated SVG background */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="w-full h-full bg-gradient-to-br from-red-500/10 via-transparent to-red-500/10 rounded-l-3xl"></div>
                  </div>
                  <div className="carousel-glow rounded-l-3xl"></div>
                  <div className="carousel-scan-line rounded-l-3xl"></div>
                  <div className="geometric-pattern rounded-l-3xl"></div>
                  {/* Floating particles */}
                  <div className="floating-particles">
                    <div className="floating-particle"></div>
                    <div className="floating-particle"></div>
                    <div className="floating-particle"></div>
                  </div>
                </div>
              )}
              {/* Enhanced glass background for entire menu */}
              <div className="absolute top-0 left-0 right-0 bottom-0 h-screen w-full bg-black/50 backdrop-blur-xl rounded-l-3xl z-10" style={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.3) 100%)',
                backdropFilter: 'blur(24px) saturate(200%)',
                WebkitBackdropFilter: 'blur(24px) saturate(200%)'
              }}></div>
              {/* Enhanced border glow */}
              <div className="absolute inset-0 rounded-l-3xl border border-red-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"></div>
              {/* Close button with enhanced glass effect */}
              <button
                onClick={toggleMenu}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-3 text-white/90 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/50 rounded-xl backdrop-blur-sm bg-white/10 hover:bg-red-500/20 border border-white/20 hover:border-red-500/30 z-50 min-w-[44px] min-h-[44px] flex items-center justify-center group overflow-hidden"
                aria-label="Close menu"
              >
                {/* Background glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/20 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                {/* Animated X icon */}
                <div className="relative w-6 h-6 flex items-center justify-center">
                  {/* Top-left to bottom-right line */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ 
                      duration: 0.3, 
                      ease: "easeInOut"
                    }}
                    className="absolute w-6 h-0.5 bg-white rounded-full shadow-lg group-hover:bg-red-300 group-hover:shadow-red-500/50 transition-all duration-300"
                    style={{ transform: 'rotate(45deg)' }}
                  />
                  {/* Top-right to bottom-left line */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ 
                      duration: 0.3, 
                      ease: "easeInOut", 
                      delay: 0.1
                    }}
                    className="absolute w-6 h-0.5 bg-white rounded-full shadow-lg group-hover:bg-red-300 group-hover:shadow-red-500/50 transition-all duration-300"
                    style={{ transform: 'rotate(-45deg)' }}
                  />
                </div>
                {/* Pulse effect on hover */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 bg-red-500/15 rounded-xl"
                />
              </button>
              {/* Navigation content */}
              <div className="relative flex flex-col h-full px-4 sm:px-6 pt-20 sm:pt-24 pb-6 sm:pb-8 z-20">
                {isMobile ? (
                  <div className="flex flex-col gap-4 flex-1 relative z-20">
                    {navLinks.map((link) => (
                      <div key={link.name} className="relative z-20">
                        <Link
                          href={link.href}
                          onClick={handleLinkClick}
                          className="tech-card relative group block px-6 py-4 text-lg font-bold font-orbitron text-white hover:text-red-300 transition-all duration-200 rounded-xl text-left backdrop-blur-md bg-white/10 hover:bg-white/15 border border-white/20 hover:border-red-500/50 min-h-[56px] flex items-center shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-red-500/20 cursor-pointer z-30"
                        >
                          <span className="relative z-10 font-semibold">{link.name}</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <motion.nav
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="flex flex-col gap-4 sm:gap-6 flex-1 relative z-20"
                  >
                    {navLinks.map((link, index) => (
                      <motion.div
                        key={link.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
                        className="relative z-20"
                      >
                        <Link
                          href={link.href}
                          onClick={handleLinkClick}
                          className="tech-card relative group block px-6 sm:px-8 py-4 sm:py-5 text-lg sm:text-xl font-bold font-orbitron text-white hover:text-red-300 transition-all duration-300 rounded-xl text-left backdrop-blur-md bg-white/10 hover:bg-white/15 border border-white/20 hover:border-red-500/50 min-h-[56px] flex items-center shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-red-500/20 cursor-pointer z-30"
                        >
                          {/* Glow effect on hover */}
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          {/* Text with enhanced glow effect */}
                          <span className="relative z-10 group-hover:text-shadow-glow transition-all duration-300 group-hover:scale-105 font-semibold">{link.name}</span>
                          {/* Enhanced underline effect */}
                          <div className="absolute bottom-3 left-6 sm:left-8 w-0 h-1 bg-gradient-to-r from-red-500 to-red-400 transition-all duration-300 group-hover:w-4/5 rounded-full"></div>
                          {/* Click indicator */}
                          <div className="absolute right-4 sm:right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </motion.nav>
                )}
              </div>
              {/* Enhanced Social/Contact section - moved here */}
              {/* ...rest of the menu... */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
