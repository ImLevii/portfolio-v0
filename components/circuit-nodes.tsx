"use client"

import { useEffect, useRef } from "react"

interface CircuitNodeProps {
  cursorPosition?: { x: number; y: number }
}

export default function CircuitNodes({ cursorPosition = { x: 0.5, y: 0.5 } }: CircuitNodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Create nodes
    const nodes: {
      x: number
      y: number
      radius: number
      connections: number[]
      pulseIntensity: number
      pulseDirection: number
      pulseSpeed: number
    }[] = []

    // Generate nodes safely
    try {
      const nodeCount = Math.min(30, Math.floor((canvas.width * canvas.height) / 40000)) // Limit node count for performance

      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 3 + 1,
          connections: [],
          pulseIntensity: Math.random(),
          pulseDirection: Math.random() > 0.5 ? 1 : -1,
          pulseSpeed: Math.random() * 0.02 + 0.01,
        })
      }

      // Create connections between nodes
      nodes.forEach((node, i) => {
        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue

          const otherNode = nodes[j]
          const dx = node.x - otherNode.x
          const dy = node.y - otherNode.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          // Connect nodes that are close enough
          if (distance < 150) {
            node.connections.push(j)
          }
        }
      })
    } catch (error) {
      console.error("Error generating circuit nodes:", error)
    }

    // Animation loop
    let animationFrameId: number
    let lastTime = 0
    const fps = 30 // Limit FPS for performance

    const render = (timestamp = 0) => {
      // Throttle rendering for performance
      if (timestamp - lastTime < 1000 / fps) {
        animationFrameId = requestAnimationFrame(render)
        return
      }
      lastTime = timestamp

      try {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Mouse position in canvas coordinates - with null check
        const mouseX = (cursorPosition?.x || 0.5) * canvas.width
        const mouseY = (cursorPosition?.y || 0.5) * canvas.height

        // Draw connections and nodes
        nodes.forEach((node, i) => {
          // Update pulse
          node.pulseIntensity += node.pulseSpeed * node.pulseDirection
          if (node.pulseIntensity > 1 || node.pulseIntensity < 0.2) {
            node.pulseDirection *= -1
          }

          // Draw connections
          node.connections.forEach((j) => {
            if (j >= nodes.length) return // Skip invalid connections

            const otherNode = nodes[j]

            // Calculate distance to mouse
            const lineMidX = (node.x + otherNode.x) / 2
            const lineMidY = (node.y + otherNode.y) / 2
            const mouseDistance = Math.sqrt(Math.pow(mouseX - lineMidX, 2) + Math.pow(mouseY - lineMidY, 2))

            // Glow intensity based on mouse proximity
            const maxDistance = 200
            const mouseInfluence = Math.max(0, 1 - mouseDistance / maxDistance)
            const glowIntensity = node.pulseIntensity * 0.7 + mouseInfluence * 0.3

            // Draw line
            ctx.beginPath()
            ctx.moveTo(node.x, node.y)
            ctx.lineTo(otherNode.x, otherNode.y)

            const alpha = 0.2 + glowIntensity * 0.3
            ctx.strokeStyle = `rgba(255, ${Math.floor(glowIntensity * 30)}, ${Math.floor(glowIntensity * 30)}, ${alpha})`
            ctx.lineWidth = 0.5 + glowIntensity
            ctx.stroke()

            // Extra glow for mouse proximity
            if (mouseInfluence > 0.5) {
              ctx.beginPath()
              ctx.moveTo(node.x, node.y)
              ctx.lineTo(otherNode.x, otherNode.y)

              ctx.shadowColor = "#ff0000"
              ctx.shadowBlur = 10
              ctx.strokeStyle = `rgba(255, 0, 0, ${mouseInfluence * 0.3})`
              ctx.lineWidth = 2
              ctx.stroke()
              ctx.shadowBlur = 0
            }
          })

          // Draw node
          ctx.beginPath()
          ctx.arc(node.x, node.y, node.radius * (0.5 + node.pulseIntensity * 0.5), 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255, ${Math.floor(node.pulseIntensity * 50)}, ${Math.floor(node.pulseIntensity * 50)}, ${0.5 + node.pulseIntensity * 0.5})`
          ctx.fill()
        })
      } catch (error) {
        console.error("Error rendering circuit nodes:", error)
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
      cancelAnimationFrame(animationFrameId)
    }
  }, [cursorPosition])

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-5 opacity-60" />
}
