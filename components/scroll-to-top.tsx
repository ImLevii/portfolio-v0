"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export default function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    // Scroll to top on page load/refresh
    const handleScrollToTop = () => {
      // Use smooth scroll for better UX, but ensure it works on mobile
      if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        })
      } else {
        // Fallback for older browsers
        window.scrollTo(0, 0)
      }
    }

    // Handle page refresh
    const handleBeforeUnload = () => {
      // Store a flag to indicate page refresh
      sessionStorage.setItem('pageRefreshed', 'true')
    }

    // Check if page was refreshed
    const wasRefreshed = sessionStorage.getItem('pageRefreshed')
    if (wasRefreshed) {
      sessionStorage.removeItem('pageRefreshed')
      // Small delay to ensure DOM is ready
      setTimeout(handleScrollToTop, 100)
    }

    // Handle route changes
    handleScrollToTop()

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [pathname])

  // Additional effect for mobile-specific handling
  useEffect(() => {
    // Handle mobile browser back/forward navigation
    const handlePopState = () => {
      setTimeout(() => {
        window.scrollTo(0, 0)
      }, 100)
    }

    // Handle mobile orientation change
    const handleOrientationChange = () => {
      setTimeout(() => {
        window.scrollTo(0, 0)
      }, 300)
    }

    // Handle mobile viewport resize
    const handleResize = () => {
      // Only scroll to top if we're at the top of the page
      if (window.scrollY < 100) {
        window.scrollTo(0, 0)
      }
    }

    window.addEventListener('popstate', handlePopState)
    window.addEventListener('orientationchange', handleOrientationChange)
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('orientationchange', handleOrientationChange)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return null
} 