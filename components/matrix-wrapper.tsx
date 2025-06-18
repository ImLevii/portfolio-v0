"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"

// Dynamically import components with no SSR
const MatrixBackground = dynamic(() => import("./matrix-background"), { ssr: false })
const FallbackMatrix = dynamic(() => import("./fallback-matrix"), { ssr: false })

interface MatrixWrapperProps {
  color?: string
  glowIntensity?: number
  density?: number
  speed?: number
}

export default function MatrixWrapper(props: MatrixWrapperProps) {
  const [useRezmason, setUseRezmason] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Check if we can load the Rezmason script
    const checkScript = async () => {
      try {
        const response = await fetch("https://rezmason.github.io/matrix/js/matrix.js", {
          method: "HEAD",
          mode: "no-cors", // This prevents CORS errors but makes the response opaque
        })

        // We can't actually check the status due to no-cors,
        // but if we get here without an error, we'll try to use Rezmason
        setUseRezmason(true)
      } catch (error) {
        console.warn("Could not load Rezmason matrix, using fallback:", error)
        setUseRezmason(false)
      } finally {
        setIsLoaded(true)
      }
    }

    checkScript()
  }, [])

  // Add a debug message
  useEffect(() => {
    if (isLoaded) {
      console.log(`Using ${useRezmason ? "Rezmason" : "fallback"} matrix animation`)
    }
  }, [isLoaded, useRezmason])

  if (!isLoaded) return null

  return useRezmason ? <MatrixBackground {...props} /> : <FallbackMatrix {...props} />
}
