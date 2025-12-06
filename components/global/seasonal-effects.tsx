"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useVisualEffectsStore } from "@/store/visual-effects-store"
import { usePathname } from "next/navigation"

export function SeasonalEffects() {
    const { weatherEffects, soundEffects, soundtrackVolume, generalVolume } = useVisualEffectsStore()
    const [season, setSeason] = useState<"winter" | "autumn" | null>(null)
    const pathname = usePathname()
    // Track if user has interacted to unlock audio context
    const [hasInteracted, setHasInteracted] = useState(false)
    // Track if we have already mounted/setup to avoid double-firing in Strict Mode
    const isMounted = useRef(false)

    // Audio refs
    const melodyRef = useRef<HTMLAudioElement | null>(null)
    const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const stopTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        isMounted.current = true
        const month = new Date().getMonth() // 0-11
        if (month === 11) { // December
            setSeason("winter")
        } else if (month === 10) { // November
            setSeason("autumn")
        } else {
            setSeason(null)
        }
        return () => { isMounted.current = false }
    }, [])

    // cleanup melody helper
    const stopMelody = useCallback(() => {
        if (melodyRef.current) {
            melodyRef.current.pause()
            melodyRef.current.currentTime = 0
            melodyRef.current = null
        }
        if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current)
            fadeIntervalRef.current = null
        }
        if (stopTimeoutRef.current) {
            clearTimeout(stopTimeoutRef.current)
            stopTimeoutRef.current = null
        }
    }, [])

    // Determine if settings allow playback
    const settingsEnabled =
        season === "winter" &&
        weatherEffects &&
        soundEffects

    // Synchronous Audio Logic Helper
    const playCurrentContextSound = useCallback((currentPath: string) => {
        // Safe guard: only play if enabled
        if (!settingsEnabled) {
            stopMelody()
            return
        }

        // --- Shop Page (Impact) ---
        if (currentPath === "/shop") {
            stopMelody()
            // Play Impact (One-shot)
            if (generalVolume > 0) {
                const impactAudio = new Audio("/sounds/christmas-impact.mp3")
                impactAudio.volume = Math.max(0, Math.min(1, generalVolume / 100))
                impactAudio.play().catch((err) => console.warn("Impact play failed:", err))
            }
            return
        }

        // --- Home Page (Melody) ---
        if (currentPath === "/") {
            // Start Melody if not playing
            if (!melodyRef.current && soundtrackVolume > 0) {
                const audio = new Audio("/sounds/christmas-melody.mp3")
                audio.loop = true
                audio.volume = Math.max(0, Math.min(1, soundtrackVolume / 100))

                audio.play().catch((err) => {
                    console.warn("Melody play failed:", err)
                })

                melodyRef.current = audio

                // Set 60s timeout for fade out
                stopTimeoutRef.current = setTimeout(() => {
                    const fadeAudio = melodyRef.current
                    if (!fadeAudio) return

                    const fadeStep = 0.05
                    const fadeInterval = 100

                    fadeIntervalRef.current = setInterval(() => {
                        if (fadeAudio.volume > fadeStep) {
                            fadeAudio.volume -= fadeStep
                        } else {
                            stopMelody()
                        }
                    }, fadeInterval)

                }, 60000) // 60 seconds
            }
        }
    }, [generalVolume, soundtrackVolume, settingsEnabled, stopMelody])

    // Interaction Listener
    useEffect(() => {
        const handleInteraction = () => {
            if (hasInteracted) return

            // 1. Mark as interacted
            setHasInteracted(true)

            // 2. Try to play IMMEDIATELY in this event loop
            playCurrentContextSound(window.location.pathname)

            // Remove listeners
            const events = ["click", "touchstart", "keydown"]
            events.forEach(event => window.removeEventListener(event, handleInteraction))
        }

        const events = ["click", "touchstart", "keydown"]
        events.forEach(event => window.addEventListener(event, handleInteraction))

        return () => {
            events.forEach(event => window.removeEventListener(event, handleInteraction))
        }
    }, [hasInteracted, playCurrentContextSound])

    // Effect 1: Lifecycle / Navigation
    // Triggered on Pathname change OR Settings toggle (Enable/Disable)
    // NOT triggered on Volume change (to avoid re-playing Impact)
    useEffect(() => {
        // If we haven't interacted yet, don't try to auto-play on nav
        // The interaction handler will cover the first play.
        if (!hasInteracted) return

        playCurrentContextSound(pathname)

    }, [pathname, settingsEnabled, hasInteracted, playCurrentContextSound])
    // ^ Excluded playCurrentContextSound from deps to avoid Volume triggering this effect
    // We strictly want this for Navigation and Enable/Disable.

    // Effect 2: Volume Sync (Melody Only)
    useEffect(() => {
        if (melodyRef.current && !fadeIntervalRef.current) {
            melodyRef.current.volume = Math.max(0, Math.min(1, soundtrackVolume / 100))
        }
    }, [soundtrackVolume])

    // Cleanup
    useEffect(() => {
        return () => stopMelody()
    }, [stopMelody])

    if (!season || !weatherEffects) return null

    return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden leading-none">
            {season === "winter" && <SnowEffect />}
            {season === "autumn" && <LeavesEffect />}
        </div>
    )
}

function SnowEffect() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        let animationFrameId: number
        let particles: {
            x: number
            y: number
            radius: number
            speed: number
            wind: number
            sway: number
            swaySpeed: number
            rotation: number
            rotationSpeed: number
            opacity: number
        }[] = []

        const resize = () => {
            // Use visualViewport if available for mobile address bar handling
            const width = window.visualViewport ? window.visualViewport.width : window.innerWidth
            const height = window.visualViewport ? window.visualViewport.height : window.innerHeight

            canvas.width = width
            canvas.height = height
            initParticles()
        }

        const initParticles = () => {
            const width = canvas.width
            const height = canvas.height
            const particleCount = Math.floor(width / 8) // Moderate density
            particles = []
            for (let i = 0; i < particleCount; i++) {
                const depth = Math.random() // 0 = far, 1 = close
                const sizeBase = Math.random() * 3 + 2

                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: sizeBase * (depth * 0.8 + 0.4),
                    speed: (Math.random() * 1 + 0.8) * (depth * 0.8 + 0.4),
                    wind: (Math.random() - 0.5) * 0.3,
                    sway: Math.random() * Math.PI * 2,
                    swaySpeed: Math.random() * 0.02 + 0.01,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.02,
                    opacity: (Math.random() * 0.6 + 0.4) * (depth * 0.7 + 0.3),
                })
            }
        }

        const drawSnowflake = (x: number, y: number, radius: number, rotation: number, opacity: number) => {
            ctx.save()
            ctx.translate(x, y)
            ctx.rotate(rotation)
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`
            ctx.lineWidth = Math.max(0.5, radius * 0.15)
            ctx.lineCap = "round"
            ctx.shadowBlur = radius
            ctx.shadowColor = `rgba(255, 255, 255, ${opacity * 0.5})`
            ctx.beginPath()
            for (let i = 0; i < 6; i++) {
                ctx.moveTo(0, 0)
                ctx.lineTo(0, radius)
                ctx.moveTo(0, radius * 0.4)
                ctx.lineTo(radius * 0.25, radius * 0.6)
                ctx.moveTo(0, radius * 0.4)
                ctx.lineTo(-radius * 0.25, radius * 0.6)
                ctx.rotate(Math.PI / 3)
            }
            ctx.stroke()
            ctx.restore()
        }

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            particles.forEach((p) => {
                p.y += p.speed
                p.x += p.wind + Math.sin(p.sway) * 0.5
                p.sway += p.swaySpeed
                p.rotation += p.rotationSpeed
                if (p.y > canvas.height + p.radius) {
                    p.y = -p.radius
                    p.x = Math.random() * canvas.width
                }
                if (p.x > canvas.width + p.radius) {
                    p.x = -p.radius
                } else if (p.x < -p.radius) {
                    p.x = canvas.width + p.radius
                }
                drawSnowflake(p.x, p.y, p.radius, p.rotation, p.opacity)
            })
            animationFrameId = requestAnimationFrame(draw)
        }

        // Listen to both resize and visualViewport resize for mobile
        window.addEventListener("resize", resize)
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', resize);
        }

        resize()
        draw()

        return () => {
            window.removeEventListener("resize", resize)
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', resize);
            }
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
}

function LeavesEffect() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        let animationFrameId: number
        const colors = ["#d97706", "#b45309", "#92400e", "#78350f", "#f59e0b"]

        let particles: {
            x: number
            y: number
            size: number
            speed: number
            rotation: number
            rotationSpeed: number
            color: string
            oscillation: number
            oscillationSpeed: number
        }[] = []

        const resize = () => {
            // Use visualViewport if available
            const width = window.visualViewport ? window.visualViewport.width : window.innerWidth
            const height = window.visualViewport ? window.visualViewport.height : window.innerHeight

            canvas.width = width
            canvas.height = height
            initParticles()
        }

        const initParticles = () => {
            const width = canvas.width
            const height = canvas.height
            const particleCount = Math.floor(width / 15)
            particles = []
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.random() * 8 + 4,
                    speed: Math.random() * 1.5 + 0.5,
                    rotation: Math.random() * 360,
                    rotationSpeed: (Math.random() - 0.5) * 2,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    oscillation: Math.random() * Math.PI * 2,
                    oscillationSpeed: Math.random() * 0.05 + 0.01,
                })
            }
        }

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            particles.forEach((p) => {
                ctx.save()
                ctx.translate(p.x, p.y)
                ctx.rotate((p.rotation * Math.PI) / 180)
                ctx.fillStyle = p.color
                ctx.beginPath()
                ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2)
                ctx.fill()
                ctx.restore()
                p.y += p.speed
                p.x += Math.sin(p.oscillation) * 0.5
                p.rotation += p.rotationSpeed
                p.oscillation += p.oscillationSpeed
                if (p.y > canvas.height + p.size) {
                    p.y = -p.size
                    p.x = Math.random() * canvas.width
                }
            })
            animationFrameId = requestAnimationFrame(draw)
        }

        window.addEventListener("resize", resize)
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', resize);
        }

        resize()
        draw()

        return () => {
            window.removeEventListener("resize", resize)
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', resize);
            }
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />
}
