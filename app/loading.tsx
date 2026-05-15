"use client"

import { motion } from "framer-motion"
import { Code } from "lucide-react"
import { usePathname } from "next/navigation"

export default function Loading() {
  const pathname = usePathname()
  const isShop = pathname?.startsWith("/shop") || pathname?.startsWith("/settings") || pathname?.startsWith("/licenses") || pathname?.startsWith("/admin")

  const accentHex   = isShop ? "#22c55e" : "#ef4444"
  const accentGlow  = isShop ? "rgba(34,197,94,0.12)"  : "rgba(239,68,68,0.12)"
  const accentBright = isShop ? "rgba(34,197,94,0.45)" : "rgba(239,68,68,0.45)"
  const accentClass = isShop ? "text-green-500" : "text-red-500"

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden">

      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      {/* Noise grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.75\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          mixBlendMode: 'overlay',
        }}
      />

      {/* Central ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(ellipse, ${accentGlow} 0%, transparent 65%)` }}
      />

      <div className="relative flex flex-col items-center gap-10">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-3"
        >
          <div className="relative">
            <Code
              className={`h-10 w-10 ${accentClass}`}
              style={{ filter: `drop-shadow(0 0 14px ${accentBright})` }}
            />
          </div>
          <span
            className="text-3xl sm:text-4xl font-bold font-orbitron text-white"
            style={{ textShadow: `0 0 40px ${accentGlow}` }}
          >
            LEVIK<span className={accentClass} style={{ filter: `drop-shadow(0 0 10px ${accentBright})` }}>.DEV</span>
          </span>
        </motion.div>

        {/* Progress indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex flex-col items-center gap-3 w-56"
        >
          {/* Shimmer bar */}
          <div className="relative w-full h-px bg-white/8 rounded-full overflow-hidden">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '120%' }}
              transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.3 }}
              className="absolute inset-y-0 w-2/5 rounded-full"
              style={{ background: `linear-gradient(to right, transparent, ${accentHex} 50%, transparent)` }}
            />
          </div>

          {/* Segmented bar */}
          <div className="flex gap-1 w-full">
            {Array.from({ length: 14 }).map((_, i) => (
              <motion.div
                key={i}
                className="h-[3px] flex-1 rounded-full"
                initial={{ opacity: 0.1 }}
                animate={{ opacity: [0.1, 0.9, 0.1] }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  delay: i * 0.07,
                  ease: "easeInOut",
                }}
                style={{ backgroundColor: accentHex }}
              />
            ))}
          </div>
        </motion.div>

        {/* Terminal cursor + label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="flex items-center gap-2"
        >
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
            className={`inline-block w-[2px] h-4 rounded-sm ${accentClass}`}
            style={{ boxShadow: `0 0 8px ${accentBright}` }}
          />
          <span className="text-[10px] font-orbitron font-bold text-white/35 tracking-[0.25em] uppercase">
            Loading
          </span>
        </motion.div>

      </div>
    </div>
  )
}
