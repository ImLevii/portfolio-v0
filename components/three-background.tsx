"use client"

import { useRef, useState, useEffect } from "react"
import * as THREE from "three"
import { Canvas } from "@react-three/fiber"
import { useMousePosition } from "@/hooks/use-mouse-position"

// Simple background component that doesn't rely on complex Three.js features
export default function ThreeBackground() {
  const [isClient, setIsClient] = useState(false)

  // Only render on client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null // Don't render during SSR
  }

  return (
    <div className="fixed inset-0 -z-10 opacity-80">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{
          antialias: false, // Better performance
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: true, // Fallback if WebGL performance is poor
        }}
        onCreated={({ gl }) => {
          // Handle WebGL context loss
          const canvas = gl.domElement
          canvas.addEventListener("webglcontextlost", (event) => {
            event.preventDefault()
            console.warn("WebGL context lost. Using fallback.")
          })
        }}
      >
        <SimpleScene />
      </Canvas>
    </div>
  )
}

// Simplified scene with basic elements
function SimpleScene() {
  const mousePosition = useMousePosition()

  return (
    <>
      <color attach="background" args={["#000000"]} />
      <ambientLight intensity={0.5} />
      <CircuitGrid mousePosition={mousePosition} />
      <GlowingParticles mousePosition={mousePosition} />
    </>
  )
}

// Simplified circuit grid that doesn't rely on complex buffer geometry
function CircuitGrid({ mousePosition }) {
  const groupRef = useRef()

  useEffect(() => {
    // No initialization that could cause errors
  }, [])

  return (
    <group ref={groupRef}>
      <gridHelper args={[30, 30, "#ff0000", "#330000"]} position={[0, 0, -2]} />
      <gridHelper args={[30, 30, "#ff0000", "#330000"]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -2]} />
    </group>
  )
}

// Simplified glowing particles
function GlowingParticles({ mousePosition }) {
  const meshRef = useRef()
  const [geometry, setGeometry] = useState(null)

  useEffect(() => {
    // Create geometry safely
    try {
      const particleCount = 200
      const geo = new THREE.BufferGeometry()
      const positions = new Float32Array(particleCount * 3)
      const colors = new Float32Array(particleCount * 3)

      // Initialize with random positions
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        positions[i3] = (Math.random() - 0.5) * 20
        positions[i3 + 1] = (Math.random() - 0.5) * 20
        positions[i3 + 2] = (Math.random() - 0.5) * 20

        // Red or dark gray particles
        if (Math.random() > 0.7) {
          colors[i3] = 1.0 // Red
          colors[i3 + 1] = 0.1
          colors[i3 + 2] = 0.1
        } else {
          const gray = 0.1 + Math.random() * 0.1
          colors[i3] = gray
          colors[i3 + 1] = gray
          colors[i3 + 2] = gray
        }
      }

      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
      geo.setAttribute("color", new THREE.BufferAttribute(colors, 3))
      setGeometry(geo)
    } catch (error) {
      console.error("Error creating particle geometry:", error)
    }
  }, [])

  // Only render when geometry is ready
  if (!geometry) return null

  return (
    <points ref={meshRef}>
      <primitive object={geometry} attach="geometry" />
      <pointsMaterial size={0.1} sizeAttenuation vertexColors transparent opacity={0.8} />
    </points>
  )
}
