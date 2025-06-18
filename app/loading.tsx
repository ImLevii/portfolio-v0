"use client"

import { motion } from "framer-motion"
import { Code, RefreshCw } from "lucide-react"

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="relative">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.5,
            ease: [0, 0.71, 0.2, 1.01],
          }}
          className="flex items-center gap-3 mb-8"
        >
          <Code className="h-12 w-12 text-red-500" />
          <span className="text-4xl font-bold font-orbitron text-white">
            LEVI<span className="text-red-500">.DEV</span>
          </span>
        </motion.div>

        {/* Refresh Icon */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            ease: "linear",
            repeat: Infinity,
          }}
          className="absolute -right-12 top-1/2 -translate-y-1/2"
        >
          <RefreshCw className="h-6 w-6 text-red-500" />
        </motion.div>

        {/* Loading bar */}
        <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{
              duration: 1.5,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="h-full bg-gradient-to-r from-red-500 via-red-600 to-red-500"
          />
        </div>

        {/* Loading text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center mt-4 text-gray-400 font-orbitron"
        >
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Refreshing...
          </motion.span>
        </motion.div>

        {/* Glow effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 -z-10 bg-gradient-radial from-red-500/20 to-transparent blur-3xl"
        />
      </div>
    </div>
  )
} 