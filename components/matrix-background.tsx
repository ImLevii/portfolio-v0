"use client"

import { useEffect, useRef, useState } from "react"
import { useInView } from "framer-motion"

interface MatrixBackgroundProps {
  color?: string
  glowIntensity?: number
  density?: number
  speed?: number
}

export default function MatrixBackground({
  color = "#ff0000",
  glowIntensity = 0.8,
  density = 1.0,
  speed = 1.0,
}: MatrixBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Use framer-motion's useInView to detect when the component is visible
  const isInView = useInView(containerRef, { once: false, amount: 0.1 })

  useEffect(() => {
    // Skip if not in browser or already initialized
    if (typeof window === "undefined") return

    // Load the matrix script dynamically
    const script = document.createElement("script")
    script.src = "https://rezmason.github.io/matrix/js/matrix.js"
    script.async = true

    script.onload = () => {
      console.log("Rezmason Matrix script loaded successfully")
      setIsInitialized(true)
    }

    script.onerror = (error) => {
      console.error("Error loading Rezmason Matrix script:", error)
    }

    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  useEffect(() => {
    if (!isInitialized || !canvasRef.current || !containerRef.current) return

    // Access the Matrix constructor from the loaded script
    const Matrix = (window as any).Matrix
    if (!Matrix) {
      console.error("Matrix constructor not found")
      return
    }

    console.log("Initializing Rezmason Matrix animation")

    // Configure the matrix effect
    const config = {
      canvas: canvasRef.current,
      fullscreen: false,
      color: color,
      backgroundColor: "rgba(0, 0, 0, 0)",
      glowColor: color,
      glowIntensity: glowIntensity,
      density: density,
      speed: speed,
      effectOpacity: 0.8,
      fallSpeed: 1.0,
      fontSize: 16,
      fontFamily: "matrix",
      shadowBlur: 8,
      rainbow: false,
      animation: "fall",
      resolution: 1.0,
    }

    // Initialize the matrix effect
    let matrix: any
    try {
      matrix = new Matrix(config)
    } catch (error) {
      console.error("Error initializing Matrix:", error)
      return
    }

    // Set canvas dimensions
    const updateDimensions = () => {
      if (!canvasRef.current || !containerRef.current) return

      const { width, height } = containerRef.current.getBoundingClientRect()
      canvasRef.current.width = width
      canvasRef.current.height = height

      // Force a re-render after resize
      if (matrix && matrix.render) {
        matrix.render()
      }
    }

    // Initial dimensions
    updateDimensions()

    // Update dimensions on resize
    window.addEventListener("resize", updateDimensions)

    // Animation loop
    const animate = () => {
      if (!isInView) {
        // Pause animation when not in view
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      if (matrix && matrix.render) {
        matrix.render()
      }
      animationRef.current = requestAnimationFrame(animate)
    }

    // Start animation
    animationRef.current = requestAnimationFrame(animate)

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener("resize", updateDimensions)
      if (matrix && matrix.dispose) {
        matrix.dispose()
      }
    }
  }, [isInitialized, isInView, color, glowIntensity, density, speed])

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
        data-matrix="rezmason"
      />
    </div>
  )
}
