"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowDown, Briefcase, User, Mail } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"
import TerminalEffect from "./terminal-effect"
import dynamic from "next/dynamic"
import { useThrottle } from "@/hooks/use-throttle"

// Dynamically import the MatrixRain component with no SSR
const MatrixRain = dynamic(() => import("./matrix-rain"), { ssr: false })

// Create a client-side only component for particles
const AnimatedParticles = () => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <>
      {/* Glowing particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-red-500/20 rounded-full"
            initial={{
              x: `${Math.random() * 100}%`,
              y: '100%',
              opacity: 0,
            }}
            animate={{
              y: ['100%', '0%'],
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'easeInOut',
            }}
            style={{
              filter: 'blur(1px)',
            }}
          />
        ))}
      </div>

      {/* Floating elements */}
      <div className="absolute bottom-0 left-0 right-0 h-48 z-30 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-red-500/10 rounded-full"
            initial={{
              x: `${Math.random() * 100}%`,
              y: '100%',
              scale: 0,
            }}
            animate={{
              y: ['100%', '0%'],
              scale: [0, 1, 0],
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeInOut',
            }}
            style={{
              filter: 'blur(2px)',
            }}
          />
        ))}
      </div>
    </>
  )
}

// Add props for geolocation data
type HeroProps = {
  geo?: {
    ip?: string
    city?: string
    region?: string
    country?: string
    privacy?: any
  }
}

export default function Hero({ geo }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [cursorPosition, setCursorPosition] = useState({ x: 0.5, y: 0.5 })
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [isClient, setIsClient] = useState(false)

  const throttledCursorPosition = useThrottle(cursorPosition, 30)
  const throttledDimensions = useThrottle(dimensions, 100)

  // Set isClient to true when component mounts
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Handle resize and initial dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        })
      }
    }

    // Set initial dimensions
    updateDimensions()

    // Add event listeners
    window.addEventListener("resize", updateDimensions)

    return () => {
      window.removeEventListener("resize", updateDimensions)
    }
  }, [])

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const { clientX, clientY } = e
      const { left, top, width, height } = containerRef.current.getBoundingClientRect()

      const x = (clientX - left) / width
      const y = (clientY - top) / height

      setCursorPosition({ x, y })

      // Update CSS variables for parallax effect
      containerRef.current.style.setProperty("--mouse-x", `${(x - 0.5) * 20}px`)
      containerRef.current.style.setProperty("--mouse-y", `${(y - 0.5) * 20}px`)
    }

    document.addEventListener("mousemove", handleMouseMove)
    return () => document.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Smooth scroll handler for hero buttons
  const handleHeroButtonClick = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault();
    const el = document.querySelector(target);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="home"
      className="min-h-[70vh] sm:min-h-[60vh] flex items-center justify-center relative overflow-hidden pt-20 pb-8 sm:pt-24 sm:pb-0"
      ref={containerRef}
    >
      {/* Matrix Background - only render on client side */}
      {isClient && (
        <MatrixRain color="#ff0000" glowIntensity={0.3} density={0.3} speed={0.8} opacity={0.4} interactive={false} />
      )}

      {/* Background layers */}
      <div className="absolute inset-0 z-0">
        {/* Base circuit image - using Next.js Image for optimization */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div
            className="absolute inset-0 bg-black"
            style={{
              transform: `translate(${(cursorPosition.x - 0.5) * -10}px, ${(cursorPosition.y - 0.5) * -10}px)`,
              transition: "transform 0.3s ease-out",
            }}
          >
            <Image
              src="/images/circuit-bg.png"
              alt="Circuit background"
              quality={70}
              priority
              fill
              sizes="100vw"
              style={{
                objectFit: "cover",
                objectPosition: "center",
                opacity: 0.7,
                mixBlendMode: "screen",
              }}
              className="circuit-bg-image"
            />
          </div>
        </div>

        {/* Enhanced overlay effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 z-20"></div>
        <div className="absolute inset-0 circuit-animation opacity-20 z-30"></div>

        {/* Responsive glow effect */}
        <div
          className="absolute inset-0 bg-gradient-radial from-blue-500/10 to-transparent opacity-50 z-40 font-bold"
          style={{
            backgroundPosition: `${cursorPosition.x * 100}% ${cursorPosition.y * 100}%`,
            backgroundSize: "100% 100%",
            transition: "background-position 0.5s ease-out",
          }}
        />

        {/* Scan line effect */}
        <div className="absolute inset-0 scan-line bg-transparent z-50"></div>

        {/* Enhanced bottom merge effect */}
        <div className="absolute bottom-0 left-0 right-0 h-36 z-40 overflow-hidden">
          {/* Main gradient overlay with enhanced blend */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
          
          {/* Subtle border glow */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent"></div>
          
          {/* Animated gradient lines */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,0,0,0.1)_50%,transparent_100%)] animate-shimmer"></div>
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(0,0,255,0.1)_50%,transparent_100%)] animate-shimmer" style={{ animationDelay: '0.5s' }}></div>
          </div>

          {/* Client-side only particles */}
          {isClient && <AnimatedParticles />}

          {/* Enhanced circuit pattern overlay */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,0,0,0.1)_100%)] animate-pulse"></div>
          </div>

          {/* Enhanced glow effect with better blend */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-t from-red-500/5 via-transparent to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/50 to-transparent"></div>
          </div>

          {/* Additional blend layer */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black to-transparent opacity-50"></div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-50 h-full flex flex-col justify-center">
        <div className="grid lg:grid-cols-2 gap-6 items-center min-h-0">
          {/* Left side - Text content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left py-4 sm:py-0"
          >
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold font-orbitron mb-4 relative leading-tight">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="block text-transparent bg-clip-text bg-gradient-to-r from-slate-300 via-slate-400 to-slate-500 relative sm:transform-none sm:perspective-[1000px] sm:rotate-x-[2deg]"
                style={{
                  textShadow: "0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)",
                }}
              > Full-Stack
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="block mt-1 relative sm:transform-none sm:perspective-[1000px] sm:rotate-x-[-2deg]"
              > System{" "}
                <span 
                  className="text-transparent bg-clip-text bg-gradient-to-r from-slate-400 via-slate-500 to-slate-600 animate-gradient-x relative inline-block sm:translate-z-[20px]"
                  style={{
                    textShadow: "0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)",
                  }}
                > Administrator
                </span>
              </motion.span>
              {/* 3D Decorative Elements */}
              <div className="absolute -inset-4 bg-gradient-to-b from-slate-800/20 to-transparent rounded-lg blur-xl -z-10"></div>
              <div className="absolute -inset-2 bg-gradient-to-r from-slate-700/10 to-slate-900/10 rounded-lg blur-lg -z-10"></div>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-base md:text-lg text-gray-300/90 mb-6 max-w-2xl mx-auto lg:mx-0 leading-relaxed relative"
              style={{
                textShadow: "0 1px 2px rgba(0,0,0,0.2)",
              }}
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400">
                Transforming ideas into{" "}
              </span>
              <span 
                className="text-transparent bg-clip-text bg-gradient-to-r from-slate-300 to-slate-500 relative inline-block"
                style={{
                  transform: "translateZ(10px)",
                }}
              >
                digital masterpieces
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400">
                {" "}through{" "}
              </span>
              <span 
                className="text-transparent bg-clip-text bg-gradient-to-r from-slate-400 to-slate-600 relative inline-block"
                style={{
                  transform: "translateZ(15px)",
                }}
              >
                elegant code
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400">
                {" "}and{" "}
              </span>
              <span 
                className="text-transparent bg-clip-text bg-gradient-to-r from-slate-500 to-slate-700 relative inline-block"
                style={{
                  transform: "translateZ(20px)",
                }}
              >
                visionary design
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400">
                .
              </span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-row gap-4 justify-center lg:justify-start relative"
            >
              <a
                href="#projects"
                onClick={e => handleHeroButtonClick(e, '#projects')}
                className="flex items-center gap-3 px-3 py-1.5 rounded-md bg-gradient-to-r from-gray-800/60 to-gray-900/60 border border-gray-700/40 backdrop-blur-sm hover:bg-gray-800/80 transition-all duration-300 cursor-pointer group font-bold text-base text-white relative shadow-lg"
                style={{
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.3)'
                }}
              >
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className="flex items-center"
                >
                  <Briefcase size={20} className="text-red-400 drop-shadow" />
                </motion.span>
                <span className="relative z-10 uppercase font-bold tracking-wider text-[10px] sm:text-xs font-orbitron"
                  style={{
                    color: '#ef4444',
                    textShadow: '0 0 8px rgba(239,68,68,0.8)',
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                  }}
                >
                  SHOWCASE
                </span>
              </a>

              <a
                href="#contact"
                onClick={e => handleHeroButtonClick(e, '#contact')}
                className="flex items-center gap-3 px-3 py-1.5 rounded-md bg-gradient-to-r from-gray-800/60 to-gray-900/60 border border-gray-700/40 backdrop-blur-sm hover:bg-gray-800/80 transition-all duration-300 cursor-pointer group font-bold text-base text-white relative shadow-lg"
                style={{
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.3)'
                }}
              >
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                  className="flex items-center"
                >
                  <Mail size={20} className="text-green-400 drop-shadow" />
                </motion.span>
                <span className="relative z-10 uppercase font-bold tracking-wider text-[10px] sm:text-xs font-orbitron"
                  style={{
                    color: '#22c55e',
                    textShadow: '0 0 8px rgba(34,197,94,0.8)',
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                  }}
                >
                  Contact
                </span>
              </a>
            </motion.div>
          </motion.div>

          {/* Right side - Terminal effect */}
          <div className="hidden lg:block">
            <TerminalEffect geo={geo} />
          </div>
        </div>

        {/* Terminal effect for mobile - below the main content */}
        <div className="mt-4 sm:mt-8 lg:hidden flex-shrink-0">
          <TerminalEffect />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 animate-bounce">
        <a href="#about" className="text-white/50 hover:text-red-500 transition-colors">
          <ArrowDown className="h-6 w-6" />
        </a>
      </div>
    </section>
  )
}
