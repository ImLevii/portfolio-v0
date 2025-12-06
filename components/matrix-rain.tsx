"use client"

import { useEffect, useRef, useState } from "react"
import { useInView } from "framer-motion"
import { useThrottle } from "@/hooks/use-throttle"

const MATRIX_CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

interface MatrixRainProps {
  color?: string
  glowIntensity?: number
  density?: number
  speed?: number
  opacity?: number
  interactive?: boolean
  enabled?: boolean
}

export default function MatrixRain({
  color = "#ff0000",
  glowIntensity = 0.8,
  density = 1.0,
  speed = 2.0,
  opacity = 0.8,
  interactive = true,
  enabled = true,
}: MatrixRainProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  })

  // Throttle mouse position updates for better performance
  const throttledMousePosition = useThrottle(mousePosition, 50)

  // Use framer-motion's useInView to detect when the component is visible
  const isInView = useInView(containerRef, { once: false, amount: 0.1 })

  // Handle mouse interactions
  useEffect(() => {
    if (!enabled || !interactive || !canvasRef.current) return

    const canvas = canvasRef.current

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      })
    }

    const handleMouseLeave = () => {
      setMousePosition((prev) => ({ ...prev, active: false }))
    }

    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseleave", handleMouseLeave)

    // Touch support
    const handleTouch = (e: TouchEvent) => {
      e.preventDefault()
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect()
        const x = e.touches[0].clientX - rect.left
        const y = e.touches[0].clientY - rect.top

        setMousePosition({
          x,
          y,
          active: true,
        })
      }
    }

    canvas.addEventListener("touchstart", handleTouch)
    canvas.addEventListener("touchmove", handleTouch)
    canvas.addEventListener("touchend", () => setMousePosition((prev) => ({ ...prev, active: false })))

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseleave", handleMouseLeave)
      canvas.removeEventListener("touchstart", handleTouch)
      canvas.removeEventListener("touchmove", handleTouch)
      canvas.removeEventListener("touchend", () => setMousePosition((prev) => ({ ...prev, active: false })))
    }
  }, [interactive])

  useEffect(() => {
    if (!enabled || !canvasRef.current || !containerRef.current) return

    console.log("Initializing Matrix Rain animation")

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

    // Matrix characters - using the same set as terminal effect
    const chars = MATRIX_CHARS.split("")

    // Calculate columns based on font size and density
    const fontSize = 24
    const columnWidth = fontSize * 1.2
    const columns = Math.ceil((canvas.width / columnWidth) * density)
    const actualColumnWidth = canvas.width / columns

    // Initialize drops
    const drops: Array<{
      x: number
      y: number
      speed: number
      length: number
      chars: string[]
      lastUpdate: number
      highlighted: boolean
    }> = []

    // Create drops
    for (let i = 0; i < columns; i++) {
      const dropSpeed = (Math.random() * 0.5 + 0.75) * speed
      const dropLength = Math.floor(Math.random() * 6 + 8) // Shorter drops for better readability

      drops.push({
        x: i * actualColumnWidth + actualColumnWidth / 2,
        y: Math.random() * -canvas.height, // Start above screen
        speed: dropSpeed,
        length: dropLength,
        chars: Array.from({ length: dropLength }, () => chars[Math.floor(Math.random() * chars.length)]),
        lastUpdate: 0,
        highlighted: Math.random() < 0.1, // 10% chance to be highlighted
      })
    }

    // Animation function
    const draw = (timestamp: number) => {
      if (!isInView) {
        animationRef.current = requestAnimationFrame(draw)
        return
      }

      // Clear canvas with fade effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)" // Increased fade speed
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Set font with better spacing
      ctx.font = `bold ${fontSize}px 'MS Gothic', 'Courier New', monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // Draw each drop
      for (let i = 0; i < drops.length; i++) {
        const drop = drops[i]

        // Apply mouse influence if active
        if (interactive && throttledMousePosition.active) {
          const dx = drop.x - throttledMousePosition.x
          const dy = drop.y - throttledMousePosition.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 200) {
            // Highlight drops near mouse
            drop.highlighted = true
          } else if (Math.random() < 0.02) { // Increased random highlight chance
            // Occasionally highlight random drops
            drop.highlighted = Math.random() < 0.15
          }
        }

        // Update position
        drop.y += drop.speed

        // Randomly update characters more frequently
        if (timestamp - drop.lastUpdate > 50) { // Reduced update interval
          for (let j = 0; j < drop.chars.length; j++) {
            if (Math.random() < 0.2) { // Increased character change chance
              drop.chars[j] = chars[Math.floor(Math.random() * chars.length)]
            }
          }
          drop.lastUpdate = timestamp
        }

        // Draw characters
        for (let j = 0; j < drop.chars.length; j++) {
          const y = drop.y - j * fontSize

          // Skip if out of bounds
          if (y < -fontSize || y > canvas.height + fontSize) {
            continue
          }

          const char = drop.chars[j]

          // Head character is brightest
          if (j === 0 && drop.highlighted) {
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
            ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${glowIntensity})`
            ctx.shadowBlur = 20
            ctx.fillText(char, drop.x, y)
            ctx.shadowBlur = 0
          } else {
            // Trailing characters fade out with smoother gradient
            const opacity = Math.max(0.1, 1 - (j / drop.length) * 0.9) // Minimum opacity of 0.1
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`
            ctx.fillText(char, drop.x, y)
          }
        }

        // Reset drop when it goes off screen
        if (drop.y - drop.length * fontSize > canvas.height) {
          drop.y = Math.random() * -100 - drop.length * fontSize
          drop.highlighted = Math.random() < 0.15 // Increased highlight chance on reset
          // Randomize characters on reset
          drop.chars = Array.from({ length: drop.length }, () => chars[Math.floor(Math.random() * chars.length)])
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
  }, [isInView, color, glowIntensity, density, speed, interactive, throttledMousePosition])

  return (
    <div ref={containerRef} className="absolute inset-0 z-[-1] overflow-hidden" style={{ height: "100vh" }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          mixBlendMode: "screen",
          opacity: isInView ? opacity : 0,
          transition: "opacity 0.5s ease-in-out",
          cursor: interactive ? "pointer" : "default",
        }}
        data-matrix="custom"
      />
    </div>
  )
}
