"use client"

import { useEffect, useRef } from "react"
import { useInView } from "framer-motion"

interface FallbackMatrixProps {
  color?: string
  density?: number
  speed?: number
}

export default function FallbackMatrix({ color = "#ff0000", density = 1.0, speed = 1.0 }: FallbackMatrixProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)

  // Use framer-motion's useInView to detect when the component is visible
  const isInView = useInView(containerRef, { once: false, amount: 0.1 })

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return

    console.log("Initializing fallback Matrix animation")

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      console.error("Could not get canvas context")
      return
    }

    // Set canvas dimensions
    const updateDimensions = () => {
      if (!canvasRef.current || !containerRef.current) return

      const { width, height } = containerRef.current.getBoundingClientRect()
      canvasRef.current.width = width
      canvasRef.current.height = height
    }

    // Initial dimensions
    updateDimensions()

    // Update dimensions on resize
    window.addEventListener("resize", updateDimensions)

    // Matrix characters
    const chars =
      "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split(
        "",
      )

    // Calculate columns based on density
    const fontSize = 16
    const columns = Math.floor((canvas.width / fontSize) * density)

    // Array to track the y position of each column
    const drops: number[] = []
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * -canvas.height)
    }

    // Parse color to RGB
    const parseColor = (colorStr: string): [number, number, number] => {
      if (colorStr.startsWith("#")) {
        const r = Number.parseInt(colorStr.slice(1, 3), 16)
        const g = Number.parseInt(colorStr.slice(3, 5), 16)
        const b = Number.parseInt(colorStr.slice(5, 7), 16)
        return [r, g, b]
      }
      return [255, 0, 0] // Default to red
    }

    const [r, g, b] = parseColor(color)

    // Animation function
    const draw = () => {
      if (!isInView) {
        animationRef.current = requestAnimationFrame(draw)
        return
      }

      // Add semi-transparent black rectangle to create fade effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Set font and color
      ctx.font = `${fontSize}px monospace`
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`

      // Draw characters
      for (let i = 0; i < drops.length; i++) {
        // Random character
        const char = chars[Math.floor(Math.random() * chars.length)]

        // Draw with glow effect
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`
        ctx.shadowBlur = 8
        ctx.fillText(char, i * fontSize, drops[i] * fontSize)
        ctx.shadowBlur = 0

        // Move drops down
        drops[i] += speed

        // Reset when off screen
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
      }

      animationRef.current = requestAnimationFrame(draw)
    }

    // Start animation
    animationRef.current = requestAnimationFrame(draw)

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener("resize", updateDimensions)
    }
  }, [isInView, color, density, speed])

  return (
    <div ref={containerRef} className="absolute inset-0 z-[-1] overflow-hidden" style={{ height: "100vh" }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          mixBlendMode: "screen",
          opacity: isInView ? 1 : 0,
          transition: "opacity 0.5s ease-in-out",
        }}
        data-matrix="fallback"
      />
    </div>
  )
}
