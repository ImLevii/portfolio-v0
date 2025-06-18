"use client"

import { useState, useEffect } from "react"

export function useMousePosition() {
  // Initialize with center of screen as default
  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0,
  })

  useEffect(() => {
    // Safety check for SSR
    if (typeof window === "undefined") return

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    // For touch devices
    const updateTouchPosition = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        setMousePosition({ x: e.touches[0].clientX, y: e.touches[0].clientY })
      }
    }

    window.addEventListener("mousemove", updateMousePosition)
    window.addEventListener("touchmove", updateTouchPosition)

    return () => {
      window.removeEventListener("mousemove", updateMousePosition)
      window.removeEventListener("touchmove", updateTouchPosition)
    }
  }, [])

  return mousePosition
}
