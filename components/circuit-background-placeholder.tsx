"use client"

import { useEffect, useRef } from "react"

export default function CircuitBackgroundPlaceholder() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Draw a high-quality circuit pattern
    const drawCircuitPattern = () => {
      // Clear canvas
      ctx.fillStyle = "#000000"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw grid lines
      ctx.strokeStyle = "rgba(255, 0, 0, 0.15)"
      ctx.lineWidth = 1

      // Horizontal lines
      const gridSize = 40
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Vertical lines
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      // Draw nodes at intersections
      for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
          // Only draw some nodes (random)
          if (Math.random() > 0.7) {
            ctx.fillStyle = "rgba(255, 0, 0, 0.3)"
            ctx.beginPath()
            ctx.arc(x, y, 3, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }

      // Draw some random connections
      ctx.strokeStyle = "rgba(255, 0, 0, 0.2)"
      ctx.lineWidth = 2

      for (let i = 0; i < 50; i++) {
        const startX = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize
        const startY = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
        const endX = startX + (Math.floor(Math.random() * 5) - 2) * gridSize
        const endY = startY + (Math.floor(Math.random() * 5) - 2) * gridSize

        if (endX >= 0 && endX < canvas.width && endY >= 0 && endY < canvas.height) {
          ctx.beginPath()
          ctx.moveTo(startX, startY)
          ctx.lineTo(endX, endY)
          ctx.stroke()
        }
      }
    }

    drawCircuitPattern()

    // Handle resize
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      drawCircuitPattern()
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10 opacity-80" />
}
