"use client"

import { useRef, useEffect } from "react"
import { useMousePosition } from "@/hooks/use-mouse-position"

export default function CircuitBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mousePosition = useMousePosition()

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

    // Circuit nodes
    const nodes: {
      x: number
      y: number
      radius: number
      connections: number[]
      pulseIntensity: number
      pulseDirection: number
      pulseSpeed: number
    }[] = []

    // Generate circuit nodes
    const generateNodes = () => {
      nodes.length = 0
      const nodeCount = Math.floor((canvas.width * canvas.height) / 40000) // Adjust density

      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2 + 1,
          connections: [],
          pulseIntensity: Math.random(),
          pulseDirection: Math.random() > 0.5 ? 1 : -1,
          pulseSpeed: Math.random() * 0.02 + 0.01,
        })
      }

      // Create connections between nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]

        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue

          const otherNode = nodes[j]
          const dx = node.x - otherNode.x
          const dy = node.y - otherNode.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          // Connect nodes that are close enough
          if (distance < 200) {
            node.connections.push(j)
          }
        }
      }
    }

    generateNodes()
    window.addEventListener("resize", generateNodes)

    // Animation loop
    let animationFrameId: number

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Calculate mouse influence
      const mouseX = mousePosition.x
      const mouseY = mousePosition.y

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]

        // Update pulse
        node.pulseIntensity += node.pulseSpeed * node.pulseDirection
        if (node.pulseIntensity > 1 || node.pulseIntensity < 0.2) {
          node.pulseDirection *= -1
        }

        // Draw connections
        for (const connectionIndex of node.connections) {
          const connectedNode = nodes[connectionIndex]

          // Calculate distance to mouse
          const lineMidX = (node.x + connectedNode.x) / 2
          const lineMidY = (node.y + connectedNode.y) / 2
          const mouseDistance = Math.sqrt(Math.pow(mouseX - lineMidX, 2) + Math.pow(mouseY - lineMidY, 2))

          // Glow intensity based on mouse proximity and pulse
          const maxDistance = 300
          const mouseInfluence = Math.max(0, 1 - mouseDistance / maxDistance)
          const glowIntensity = node.pulseIntensity * 0.7 + mouseInfluence * 0.3

          // Draw line
          ctx.beginPath()
          ctx.moveTo(node.x, node.y)
          ctx.lineTo(connectedNode.x, connectedNode.y)

          const alpha = 0.2 + glowIntensity * 0.3
          ctx.strokeStyle = `rgba(255, ${Math.floor(glowIntensity * 30)}, ${Math.floor(glowIntensity * 30)}, ${alpha})`
          ctx.lineWidth = 0.5 + glowIntensity
          ctx.stroke()

          // Draw glow effect for lines close to mouse
          if (mouseInfluence > 0.5) {
            ctx.beginPath()
            ctx.moveTo(node.x, node.y)
            ctx.lineTo(connectedNode.x, connectedNode.y)

            const glowAlpha = mouseInfluence * 0.3
            ctx.shadowColor = "#ff0000"
            ctx.shadowBlur = 10
            ctx.strokeStyle = `rgba(255, 0, 0, ${glowAlpha})`
            ctx.lineWidth = 2
            ctx.stroke()
            ctx.shadowBlur = 0
          }
        }

        // Draw node
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius * (0.5 + node.pulseIntensity * 0.5), 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, ${Math.floor(node.pulseIntensity * 50)}, ${Math.floor(node.pulseIntensity * 50)}, ${0.5 + node.pulseIntensity * 0.5})`
        ctx.fill()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
      window.removeEventListener("resize", generateNodes)
      cancelAnimationFrame(animationFrameId)
    }
  }, [mousePosition])

  return <canvas ref={canvasRef} className="fixed inset-0 -z-20 opacity-40" style={{ mixBlendMode: "screen" }} />
}
