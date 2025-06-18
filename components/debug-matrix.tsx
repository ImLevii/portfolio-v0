"use client"

import { useEffect, useState } from "react"

export default function DebugMatrix() {
  const [debugInfo, setDebugInfo] = useState({
    matrixCanvas: false,
    canvasSize: { width: 0, height: 0 },
    fps: 0,
    lastFrameTime: 0,
    frameCount: 0,
    error: null as string | null,
  })

  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== "development") return

    let frameCount = 0
    let lastFpsUpdateTime = performance.now()

    // Check if the matrix canvas exists and is properly initialized
    const checkMatrix = () => {
      try {
        const canvas = document.querySelector("canvas[data-matrix='custom']") as HTMLCanvasElement | null

        if (canvas) {
          frameCount++
          const now = performance.now()

          // Update FPS every second
          if (now - lastFpsUpdateTime > 1000) {
            const fps = Math.round((frameCount * 1000) / (now - lastFpsUpdateTime))
            lastFpsUpdateTime = now
            frameCount = 0

            setDebugInfo((prev) => ({
              ...prev,
              fps,
              matrixCanvas: true,
              canvasSize: {
                width: canvas.width,
                height: canvas.height,
              },
            }))
          }
        } else {
          setDebugInfo((prev) => ({
            ...prev,
            matrixCanvas: false,
          }))
        }
      } catch (err) {
        setDebugInfo((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : String(err),
        }))
      }
    }

    // Check immediately and then every 100ms
    checkMatrix()
    const interval = setInterval(checkMatrix, 100)

    return () => clearInterval(interval)
  }, [])

  // Only show in development
  if (process.env.NODE_ENV !== "development") return null

  return (
    <div className="fixed bottom-0 left-0 bg-black/80 text-white p-2 text-xs z-[9999] max-w-xs">
      <h4 className="font-bold">Matrix Debug:</h4>
      <ul>
        <li>Canvas exists: {debugInfo.matrixCanvas ? "✅" : "❌"}</li>
        <li>
          Canvas size: {debugInfo.canvasSize.width}x{debugInfo.canvasSize.height}
        </li>
        <li>FPS: {debugInfo.fps}</li>
        {debugInfo.error && <li className="text-red-500">Error: {debugInfo.error}</li>}
      </ul>
    </div>
  )
}
