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
            
            {/* Animated glass pattern overlay - pointer-events-none to not interfere */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-red-500/5"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,0,0,0.1),transparent_40%)]"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,0,0,0.08),transparent_40%)]"></div>
            </div>

            {/* Floating glass particles - pointer-events-none */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-red-500/20 rounded-full blur-sm animate-pulse"></div>
              <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-red-500/30 rounded-full blur-sm animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-red-500/25 rounded-full blur-sm animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

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
              className="absolute right-0 top-0 h-screen w-80 sm:w-96 max-w-[85vw] rounded-l-3xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Carousel-style backdrop with multiple layers */}
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
                        <span className="relative z-10 group-hover:text-shadow-glow transition-all duration-300 group-hover:scale-105 font-semibold">
              {link.name}
                        </span>
                        
                        {/* Enhanced underline effect */}
                        <div className="absolute bottom-3 left-6 sm:left-8 w-0 h-1 bg-gradient-to-r from-red-500 to-red-400 transition-all duration-300 group-hover:w-4/5 rounded-full"></div>
                        
                        {/* Click indicator */}
                        <div className="absolute right-4 sm:right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        </div>
            </Link>
                    </motion.div>
                  ))}
                  
                  {/* Enhanced Social/Contact section - moved here */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                    className="tech-card text-center pt-6 sm:pt-8 border-t border-red-500/20 backdrop-blur-md bg-white/10 rounded-xl p-4 sm:p-6 relative z-20 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-red-500/20 group"
                  >
                    {/* Animated background effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                    
                    {/* Floating particles for the contact section */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <motion.div
                        animate={{ y: [0, -10, 0], opacity: [0.3, 0.8, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-2 left-4 w-1 h-1 bg-red-400 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -8, 0], opacity: [0.4, 0.9, 0.4] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute bottom-3 right-6 w-1 h-1 bg-red-300 rounded-full"
                      />
                    </div>
                    
                    <p className="text-white/80 text-xs sm:text-sm font-medium mb-3 sm:mb-4 relative z-10 group-hover:text-white transition-colors duration-300">
                      Ready to build something amazing?
                    </p>
                    <Button
            variant="default"
            size="lg"
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-orbitron font-bold border-2 border-red-500/50 hover:border-red-400/50 transition-all duration-300 py-2 sm:py-3 text-base sm:text-lg backdrop-blur-sm shadow-lg hover:shadow-xl hover:shadow-red-500/30 hover:scale-105 relative z-30 group/btn"
            asChild
          >
                      <Link href="#contact" onClick={handleLinkClick}>
                        <motion.span
                          initial={{ opacity: 1 }}
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          Let's Connect
                        </motion.span>
                        {/* Button glow effect */}
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          whileHover={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-transparent rounded-lg"
                        />
                      </Link>
                    </Button>
                    
                    {/* Seamless flowing pulse ring */}
                    <div className="absolute inset-0 rounded-xl overflow-hidden">
                      {/* Primary border pulse layer */}
                      <div className="absolute inset-0">
                        {/* Top border with enhanced gradient */}
                        <motion.div
                          initial={{ x: "-100%" }}
                          animate={{ x: "100%" }}
                          transition={{ 
                            duration: 2.5, 
                            repeat: Infinity, 
                            ease: "linear",
                            repeatDelay: 0
                          }}
                          className="absolute top-0 left-0 h-0.5 w-full"
                          style={{
                            background: 'linear-gradient(90deg, transparent 0%, rgba(239, 68, 68, 0.3) 20%, rgba(239, 68, 68, 0.8) 50%, rgba(239, 68, 68, 0.3) 80%, transparent 100%)',
                            borderRadius: '12px 12px 0 0',
                            boxShadow: '0 0 8px rgba(239, 68, 68, 0.4)'
                          }}
                        />
                        
                        {/* Right border with enhanced gradient */}
                        <motion.div
                          initial={{ y: "-100%" }}
                          animate={{ y: "100%" }}
                          transition={{ 
                            duration: 2.5, 
                            repeat: Infinity, 
                            ease: "linear",
                            repeatDelay: 0,
                            delay: 0.625
                          }}
                          className="absolute top-0 right-0 w-0.5 h-full"
                          style={{
                            background: 'linear-gradient(180deg, transparent 0%, rgba(239, 68, 68, 0.3) 20%, rgba(239, 68, 68, 0.8) 50%, rgba(239, 68, 68, 0.3) 80%, transparent 100%)',
                            borderRadius: '0 12px 12px 0',
                            boxShadow: '0 0 8px rgba(239, 68, 68, 0.4)'
                          }}
                        />
                        
                        {/* Bottom border with enhanced gradient */}
                        <motion.div
                          initial={{ x: "100%" }}
                          animate={{ x: "-100%" }}
                          transition={{ 
                            duration: 2.5, 
                            repeat: Infinity, 
                            ease: "linear",
                            repeatDelay: 0,
                            delay: 1.25
                          }}
                          className="absolute bottom-0 left-0 h-0.5 w-full"
                          style={{
                            background: 'linear-gradient(90deg, transparent 0%, rgba(239, 68, 68, 0.3) 20%, rgba(239, 68, 68, 0.8) 50%, rgba(239, 68, 68, 0.3) 80%, transparent 100%)',
                            borderRadius: '0 0 12px 12px',
                            boxShadow: '0 0 8px rgba(239, 68, 68, 0.4)'
                          }}
                        />
                        
                        {/* Left border with enhanced gradient */}
                        <motion.div
                          initial={{ y: "100%" }}
                          animate={{ y: "-100%" }}
                          transition={{ 
                            duration: 2.5, 
                            repeat: Infinity, 
                            ease: "linear",
                            repeatDelay: 0,
                            delay: 1.875
                          }}
                          className="absolute top-0 left-0 w-0.5 h-full"
                          style={{
                            background: 'linear-gradient(180deg, transparent 0%, rgba(239, 68, 68, 0.3) 20%, rgba(239, 68, 68, 0.8) 50%, rgba(239, 68, 68, 0.3) 80%, transparent 100%)',
                            borderRadius: '12px 0 0 12px',
                            boxShadow: '0 0 8px rgba(239, 68, 68, 0.4)'
                          }}
                        />
                      </div>

                      {/* Secondary glow layer for enhanced depth */}
                      <div className="absolute inset-0">
                        <motion.div
                          initial={{ x: "-100%" }}
                          animate={{ x: "100%" }}
                          transition={{ 
                            duration: 3, 
                            repeat: Infinity, 
                            ease: "linear",
                            repeatDelay: 0,
                            delay: 0.5
                          }}
                          className="absolute top-0 left-0 h-1 w-full opacity-30"
                          style={{
                            background: 'linear-gradient(90deg, transparent 0%, rgba(239, 68, 68, 0.2) 50%, transparent 100%)',
                            borderRadius: '12px 12px 0 0',
                            filter: 'blur(1px)'
                          }}
                        />
                        <motion.div
                          initial={{ y: "-100%" }}
                          animate={{ y: "100%" }}
                          transition={{ 
                            duration: 3, 
                            repeat: Infinity, 
                            ease: "linear",
                            repeatDelay: 0,
                            delay: 1.125
                          }}
                          className="absolute top-0 right-0 w-1 h-full opacity-30"
                          style={{
                            background: 'linear-gradient(180deg, transparent 0%, rgba(239, 68, 68, 0.2) 50%, transparent 100%)',
                            borderRadius: '0 12px 12px 0',
                            filter: 'blur(1px)'
                          }}
                        />
                        <motion.div
                          initial={{ x: "100%" }}
                          animate={{ x: "-100%" }}
                          transition={{ 
                            duration: 3, 
                            repeat: Infinity, 
                            ease: "linear",
                            repeatDelay: 0,
                            delay: 1.75
                          }}
                          className="absolute bottom-0 left-0 h-1 w-full opacity-30"
                          style={{
                            background: 'linear-gradient(90deg, transparent 0%, rgba(239, 68, 68, 0.2) 50%, transparent 100%)',
                            borderRadius: '0 0 12px 12px',
                            filter: 'blur(1px)'
                          }}
                        />
                        <motion.div
                          initial={{ y: "100%" }}
                          animate={{ y: "-100%" }}
                          transition={{ 
                            duration: 3, 
                            repeat: Infinity, 
                            ease: "linear",
                            repeatDelay: 0,
                            delay: 2.375
                          }}
                          className="absolute top-0 left-0 w-1 h-full opacity-30"
                          style={{
                            background: 'linear-gradient(180deg, transparent 0%, rgba(239, 68, 68, 0.2) 50%, transparent 100%)',
                            borderRadius: '12px 0 0 12px',
                            filter: 'blur(1px)'
                          }}
                        />
                      </div>

                      {/* Advanced corner pulse effects with multiple layers */}
                      <div className="absolute inset-0">
                        {/* Top-left corner with multi-layer effect */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                          animate={{ 
                            opacity: [0, 1, 0], 
                            scale: [0.5, 1.2, 0.5],
                            rotate: [-45, 0, -45]
                          }}
                          transition={{ 
                            duration: 2.5, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            delay: 0
                          }}
                          className="absolute top-0 left-0 w-4 h-4"
                          style={{ 
                            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.9) 0%, rgba(239, 68, 68, 0.6) 30%, rgba(239, 68, 68, 0.3) 60%, transparent 100%)',
                            borderRadius: '12px 0 0 0',
                            clipPath: 'polygon(0 0, 100% 0, 0 100%)',
                            boxShadow: '0 0 12px rgba(239, 68, 68, 0.6), inset 0 0 8px rgba(239, 68, 68, 0.3)'
                          }}
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8, rotate: -30 }}
                          animate={{ 
                            opacity: [0, 0.8, 0], 
                            scale: [0.8, 1.8, 0.8],
                            rotate: [-30, 15, -30]
                          }}
                          transition={{ 
                            duration: 2.5, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            delay: 0.2
                          }}
                          className="absolute top-0 left-0 w-8 h-8"
                          style={{ 
                            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, rgba(239, 68, 68, 0.2) 40%, transparent 80%)',
                            borderRadius: '12px 0 0 0',
                            clipPath: 'polygon(0 0, 100% 0, 0 100%)',
                            filter: 'blur(0.5px)'
                          }}
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 1, rotate: 0 }}
                          animate={{ 
                            opacity: [0, 0.4, 0], 
                            scale: [1, 2.2, 1],
                            rotate: [0, 45, 0]
                          }}
                          transition={{ 
                            duration: 2.5, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            delay: 0.4
                          }}
                          className="absolute top-0 left-0 w-10 h-10"
                          style={{ 
                            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 50%, transparent 90%)',
                            borderRadius: '12px 0 0 0',
                            clipPath: 'polygon(0 0, 100% 0, 0 100%)',
                            filter: 'blur(1px)'
                          }}
                        />

                        {/* Top-right corner with multi-layer effect */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5, rotate: 45 }}
                          animate={{ 
                            opacity: [0, 1, 0], 
                            scale: [0.5, 1.2, 0.5],
                            rotate: [45, 0, 45]
                          }}
                          transition={{ 
                            duration: 2.5, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            delay: 0.625
                          }}
                          className="absolute top-0 right-0 w-4 h-4"
                          style={{ 
                            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.9) 0%, rgba(239, 68, 68, 0.6) 30%, rgba(239, 68, 68, 0.3) 60%, transparent 100%)',
                            borderRadius: '0 12px 0 0',
                            clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
                            boxShadow: '0 0 12px rgba(239, 68, 68, 0.6), inset 0 0 8px rgba(239, 68, 68, 0.3)'
                          }}
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8, rotate: 30 }}
                          animate={{ 
                            opacity: [0, 0.8, 0], 
                            scale: [0.8, 1.8, 0.8],
                            rotate: [30, -15, 30]
                          }}
                          transition={{ 
                            duration: 2.5, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            delay: 0.825
                          }}
                          className="absolute top-0 right-0 w-8 h-8"
                          style={{ 
                            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, rgba(239, 68, 68, 0.2) 40%, transparent 80%)',
                            borderRadius: '0 12px 0 0',
                            clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
                            filter: 'blur(0.5px)'
                          }}
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 1, rotate: 0 }}
                          animate={{ 
                            opacity: [0, 0.4, 0], 
                            scale: [1, 2.2, 1],
                            rotate: [0, -45, 0]
                          }}
                          transition={{ 
                            duration: 2.5, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            delay: 1.025
                          }}
                          className="absolute top-0 right-0 w-10 h-10"
                          style={{ 
                            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 50%, transparent 90%)',
                            borderRadius: '0 12px 0 0',
                            clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
                            filter: 'blur(1px)'
                          }}
                        />

                        {/* Bottom-right corner with multi-layer effect */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                          animate={{ 
                            opacity: [0, 1, 0], 
                            scale: [0.5, 1.2, 0.5],
                            rotate: [-45, 0, -45]
                          }}
                          transition={{ 
                            duration: 2.5, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            delay: 1.25
                          }}
                          className="absolute bottom-0 right-0 w-4 h-4"
                          style={{ 
                            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.9) 0%, rgba(239, 68, 68, 0.6) 30%, rgba(239, 68, 68, 0.3) 60%, transparent 100%)',
                            borderRadius: '0 0 12px 0',
                            clipPath: 'polygon(0 100%, 100% 0, 100% 100%)',
                            boxShadow: '0 0 12px rgba(239, 68, 68, 0.6), inset 0 0 8px rgba(239, 68, 68, 0.3)'
                          }}
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8, rotate: -30 }}
                          animate={{ 
                            opacity: [0, 0.8, 0], 
                            scale: [0.8, 1.8, 0.8],
                            rotate: [-30, 15, -30]
                          }}
                          transition={{ 
                            duration: 2.5, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            delay: 1.45
                          }}
                          className="absolute bottom-0 right-0 w-8 h-8"
                          style={{ 
                            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, rgba(239, 68, 68, 0.2) 40%, transparent 80%)',
                            borderRadius: '0 0 12px 0',
                            clipPath: 'polygon(0 100%, 100% 0, 100% 100%)',
                            filter: 'blur(0.5px)'
                          }}
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 1, rotate: 0 }}
                          animate={{ 
                            opacity: [0, 0.4, 0], 
                            scale: [1, 2.2, 1],
                            rotate: [0, 45, 0]
                          }}
                          transition={{ 
                            duration: 2.5, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            delay: 1.65
                          }}
                          className="absolute bottom-0 right-0 w-10 h-10"
                          style={{ 
                            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 50%, transparent 90%)',
                            borderRadius: '0 0 12px 0',
                            clipPath: 'polygon(0 100%, 100% 0, 100% 100%)',
                            filter: 'blur(1px)'
                          }}
                        />

                        {/* Bottom-left corner with multi-layer effect */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5, rotate: 45 }}
                          animate={{ 
                            opacity: [0, 1, 0], 
                            scale: [0.5, 1.2, 0.5],
                            rotate: [45, 0, 45]
                          }}
                          transition={{ 
                            duration: 2.5, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            delay: 1.875
                          }}
                          className="absolute bottom-0 left-0 w-4 h-4"
                          style={{ 
                            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.9) 0%, rgba(239, 68, 68, 0.6) 30%, rgba(239, 68, 68, 0.3) 60%, transparent 100%)',
                            borderRadius: '0 0 0 12px',
                            clipPath: 'polygon(0 0, 0 100%, 100% 100%)',
                            boxShadow: '0 0 12px rgba(239, 68, 68, 0.6), inset 0 0 8px rgba(239, 68, 68, 0.3)'
                          }}
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8, rotate: 30 }}
                          animate={{ 
                            opacity: [0, 0.8, 0], 
                            scale: [0.8, 1.8, 0.8],
                            rotate: [30, -15, 30]
                          }}
                          transition={{ 
                            duration: 2.5, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            delay: 2.075
                          }}
                          className="absolute bottom-0 left-0 w-8 h-8"
                          style={{ 
                            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, rgba(239, 68, 68, 0.2) 40%, transparent 80%)',
                            borderRadius: '0 0 0 12px',
                            clipPath: 'polygon(0 0, 0 100%, 100% 100%)',
                            filter: 'blur(0.5px)'
                          }}
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 1, rotate: 0 }}
                          animate={{ 
                            opacity: [0, 0.4, 0], 
                            scale: [1, 2.2, 1],
                            rotate: [0, -45, 0]
                          }}
                          transition={{ 
                            duration: 2.5, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            delay: 2.275
                          }}
                          className="absolute bottom-0 left-0 w-10 h-10"
                          style={{ 
                            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 50%, transparent 90%)',
                            borderRadius: '0 0 0 12px',
                            clipPath: 'polygon(0 0, 0 100%, 100% 100%)',
                            filter: 'blur(1px)'
                          }}
                        />

                        {/* Corner connection lines for seamless flow */}
                        <motion.div
                          initial={{ scaleX: 0, opacity: 0 }}
                          animate={{ scaleX: [0, 1, 0], opacity: [0, 0.6, 0] }}
                          transition={{ 
                            duration: 1.5, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            delay: 0.3
                          }}
                          className="absolute top-0 left-0 w-8 h-0.5 bg-gradient-to-r from-red-500/80 to-transparent origin-left"
                          style={{ transform: 'rotate(45deg) translateX(-4px)' }}
                        />
                        <motion.div
                          initial={{ scaleX: 0, opacity: 0 }}
                          animate={{ scaleX: [0, 1, 0], opacity: [0, 0.6, 0] }}
                          transition={{ 
                            duration: 1.5, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            delay: 0.9
                          }}
                          className="absolute top-0 right-0 w-8 h-0.5 bg-gradient-to-l from-red-500/80 to-transparent origin-right"
                          style={{ transform: 'rotate(-45deg) translateX(4px)' }}
                        />
                        <motion.div
                          initial={{ scaleX: 0, opacity: 0 }}
                          animate={{ scaleX: [0, 1, 0], opacity: [0, 0.6, 0] }}
                          transition={{ 
                            duration: 1.5, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            delay: 1.5
                          }}
                          className="absolute bottom-0 right-0 w-8 h-0.5 bg-gradient-to-l from-red-500/80 to-transparent origin-right"
                          style={{ transform: 'rotate(45deg) translateX(4px)' }}
                        />
                        <motion.div
                          initial={{ scaleX: 0, opacity: 0 }}
                          animate={{ scaleX: [0, 1, 0], opacity: [0, 0.6, 0] }}
                          transition={{ 
                            duration: 1.5, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            delay: 2.1
                          }}
                          className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-red-500/80 to-transparent origin-left"
                          style={{ transform: 'rotate(-45deg) translateX(-4px)' }}
                        />

                        {/* Corner pulse rings */}
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: [0, 1.5, 0], opacity: [0, 0.4, 0] }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity, 
                            ease: "easeOut",
                            delay: 0.1
                          }}
                          className="absolute top-0 left-0 w-6 h-6 border border-red-500/40 rounded-tl-xl"
                          style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
                        />
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: [0, 1.5, 0], opacity: [0, 0.4, 0] }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity, 
                            ease: "easeOut",
                            delay: 0.7
                          }}
                          className="absolute top-0 right-0 w-6 h-6 border border-red-500/40 rounded-tr-xl"
                          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}
                        />
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: [0, 1.5, 0], opacity: [0, 0.4, 0] }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity, 
                            ease: "easeOut",
                            delay: 1.3
                          }}
                          className="absolute bottom-0 right-0 w-6 h-6 border border-red-500/40 rounded-br-xl"
                          style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%)' }}
                        />
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: [0, 1.5, 0], opacity: [0, 0.4, 0] }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity, 
                            ease: "easeOut",
                            delay: 1.9
                          }}
                          className="absolute bottom-0 left-0 w-6 h-6 border border-red-500/40 rounded-bl-xl"
                          style={{ clipPath: 'polygon(0 0, 0 100%, 100% 100%)' }}
                        />
                      </div>

                      {/* Floating particle effects around the border */}
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <motion.div
                          animate={{ 
                            x: [0, 20, 0],
                            y: [0, -10, 0],
                            opacity: [0, 1, 0]
                          }}
                          transition={{ 
                            duration: 3, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            delay: 0
                          }}
                          className="absolute top-2 left-2 w-1 h-1 bg-red-400 rounded-full shadow-lg shadow-red-500/50"
                        />
                        <motion.div
                          animate={{ 
                            x: [0, -15, 0],
                            y: [0, -8, 0],
                            opacity: [0, 1, 0]
                          }}
                          transition={{ 
                            duration: 2.5, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            delay: 0.8
                          }}
                          className="absolute top-2 right-2 w-1 h-1 bg-red-300 rounded-full shadow-lg shadow-red-500/50"
                        />
                        <motion.div
                          animate={{ 
                            x: [0, -12, 0],
                            y: [0, 15, 0],
                            opacity: [0, 1, 0]
                          }}
                          transition={{ 
                            duration: 3.2, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            delay: 1.6
                          }}
                          className="absolute bottom-2 right-2 w-1 h-1 bg-red-400 rounded-full shadow-lg shadow-red-500/50"
                        />
                        <motion.div
                          animate={{ 
                            x: [0, 18, 0],
                            y: [0, 12, 0],
                            opacity: [0, 1, 0]
                          }}
                          transition={{ 
                            duration: 2.8, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            delay: 2.4
                          }}
                          className="absolute bottom-2 left-2 w-1 h-1 bg-red-300 rounded-full shadow-lg shadow-red-500/50"
                        />
                      </div>

                      {/* Subtle scan line effect */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.3, 0] }}
                        transition={{ 
                          duration: 2.5, 
                          repeat: Infinity, 
                          ease: "easeInOut"
                        }}
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background: 'linear-gradient(90deg, transparent 0%, rgba(239, 68, 68, 0.1) 50%, transparent 100%)',
                          filter: 'blur(0.5px)'
                        }}
                      />
                    </div>
                  </motion.div>
                </motion.nav>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
