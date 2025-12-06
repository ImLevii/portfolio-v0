import { useState, useEffect } from "react"
import { useThrottle } from "./use-throttle"

export function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false)
    const [windowWidth, setWindowWidth] = useState(0)

    // Throttle resize events
    const throttledWidth = useThrottle(windowWidth, 200)

    useEffect(() => {
        // Initial check
        const checkMobile = () => {
            const width = window.innerWidth
            setWindowWidth(width)
            setIsMobile(width < 768) // 768px is standard tablet/mobile breakpoint
        }

        checkMobile()

        const handleResize = () => {
            setWindowWidth(window.innerWidth)
        }

        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    useEffect(() => {
        setIsMobile(throttledWidth < 768)
    }, [throttledWidth])

    return isMobile
}
