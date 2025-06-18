"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"

export function Logo3D() {
  const groupRef = useRef()
  const octahedronRef = useRef()
  const sphereRef = useRef()

  useFrame((state) => {
    if (!groupRef.current) return

    // Rotate the entire logo
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.2

    // Add subtle floating motion
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1

    // Pulse the octahedron
    if (octahedronRef.current) {
      octahedronRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05
      octahedronRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05
      octahedronRef.current.scale.z = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05
    }

    // Pulse the sphere opacity
    if (sphereRef.current && sphereRef.current.material) {
      sphereRef.current.material.opacity = 0.2 + Math.sin(state.clock.elapsedTime * 1.5) * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      {/* Outer wireframe octahedron */}
      <mesh ref={octahedronRef} castShadow>
        <octahedronGeometry args={[1.5, 0]} />
        <meshStandardMaterial
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={0.5}
          metalness={0.9}
          roughness={0.1}
          wireframe={true}
        />
      </mesh>

      {/* Inner sphere */}
      <mesh ref={sphereRef}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial color="#000000" metalness={0.9} roughness={0.1} transparent opacity={0.3} />
      </mesh>

      {/* Core glow */}
      <pointLight color="#ff0000" intensity={5} distance={3} />
    </group>
  )
}
