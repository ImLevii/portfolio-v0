"use client"

import { useEffect, useRef, useState } from "react"
import { useVisualEffectsStore } from "@/store/visual-effects-store"
import { usePathname } from "next/navigation"
import type { SeasonalSettings } from "@/actions/seasonal-settings"

interface SeasonalEffectsProps {
    config?: SeasonalSettings
}

export function SeasonalEffects({ config }: SeasonalEffectsProps) {
    const { weatherEffects, soundEffects, soundtrackVolume, generalVolume } = useVisualEffectsStore()
    const [season, setSeason] = useState<"winter" | "autumn" | null>(null)
    const pathname = usePathname()

    // Audio refs
    const melodyRef = useRef<HTMLAudioElement | null>(null)
    const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const stopTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Interaction tracking for autoplay fallback
    const [hasInteracted, setHasInteracted] = useState(false)

    useEffect(() => {
        const handleInteraction = () => {
            setHasInteracted(true)
            // Cleanup listeners once interaction is detected
            window.removeEventListener('click', handleInteraction)
            window.removeEventListener('keydown', handleInteraction)
            window.removeEventListener('scroll', handleInteraction)
        }

        window.addEventListener('click', handleInteraction)
        window.addEventListener('keydown', handleInteraction)
        window.addEventListener('scroll', handleInteraction)

        return () => {
            window.removeEventListener('click', handleInteraction)
            window.removeEventListener('keydown', handleInteraction)
            window.removeEventListener('scroll', handleInteraction)
        }
    }, [])

    useEffect(() => {
        if (config?.mode && config.mode !== "auto") {
            setSeason(config.mode === "none" ? null : config.mode)
            return
        }

        const month = new Date().getMonth() // 0-11
        // ... (removed debug override comments)

        if (month === 11) { // December
            setSeason("winter")
        } else if (month === 10) { // November
            setSeason("autumn")
        } else {
            setSeason(null)
        }
    }, [config?.mode])

    // cleanup melody helper
    const stopMelody = () => {
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
    }

    // Determine if settings allow playback
    const settingsEnabled =
        season !== null &&
        weatherEffects &&
        soundEffects &&
        (config?.enableAudio ?? true)

    // Effect 1: Manage Play/Stop Lifecycle
    useEffect(() => {
        if (!settingsEnabled) {
            // If settings are disabled, stop everything
            stopMelody()
            return
        }

        // --- Logic for Shop Page (Impact) ---
        if (pathname === "/shop") {
            // 1. Stop Melody if playing
            stopMelody()

            // 2. Play Impact (One-shot)
            const vol = config?.soundEffectsVolume ?? generalVolume
            if (vol > 0) {
                const impactAudio = new Audio("/sounds/christmas-impact.mp3")
                impactAudio.volume = Math.max(0, Math.min(1, vol / 100))
                impactAudio.play().catch((err) => {
                    // Impact is short and usually triggered by a click to navigate, 
                    // but if user routed directly, it might be blocked.
                    console.error("Impact autoplay failed:", err)
                })
            }
            return
        }

        // --- Logic for Home Page (Melody) ---
        if (pathname === "/") {
            // Start Melody if not playing (and soundtrack volume allows)
            const vol = config?.musicVolume ?? soundtrackVolume
            if (!melodyRef.current && vol > 0) {
                const audio = new Audio("/sounds/christmas-melody.mp3")
                audio.loop = true
                audio.volume = Math.max(0, Math.min(1, vol / 100))

                const playPromise = audio.play()

                if (playPromise !== undefined) {
                    playPromise.catch((err) => {
                        console.error("Melody autoplay failed (blocked):", err)
                    })
                }

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
            } else if (melodyRef.current && hasInteracted && melodyRef.current.paused) {
                // Retry playing if paused (likely due to autoplay block) and we now have interaction
                melodyRef.current.play().catch(e => console.error("Retry play failed", e))
            }
        }

        // --- Logic for Other Pages ---
        // Do nothing. Melody persists if playing. Impact played and finished.

    }, [settingsEnabled, pathname, soundtrackVolume, generalVolume, hasInteracted])

    // Cleanup on unmount only
    useEffect(() => {
        return () => stopMelody()
    }, [])

    // Effect 2: Sync Volume
    useEffect(() => {
        if (melodyRef.current && !fadeIntervalRef.current) {
            // Only update volume if not currently fading out
            const vol = config?.musicVolume ?? soundtrackVolume
            melodyRef.current.volume = Math.max(0, Math.min(1, vol / 100))
        }
    }, [soundtrackVolume, config?.musicVolume])

    if (!season || !weatherEffects) return null

    return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
            {season === "winter" && <SnowEffect density={config?.snowDensity} />}
            {season === "autumn" && <LeavesEffect density={config?.leavesDensity} />}
        </div>
    )
}

function SnowEffect({ density: densityProp }: { density?: number }) {
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
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            initParticles()
        }

        const initParticles = () => {
            const density = typeof densityProp === 'number' ? densityProp : 50
            // Base count: (width / 8). Adjust by density: 50 is baseline.
            // Formula: base * (density / 50)
            const baseCount = Math.floor(window.innerWidth / 8)
            const particleCount = Math.floor(baseCount * (density / 50))
            particles = []
            for (let i = 0; i < particleCount; i++) {
                const depth = Math.random() // 0 = far, 1 = close
                const sizeBase = Math.random() * 3 + 2 // Base size 2-5

                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    radius: sizeBase * (depth * 0.8 + 0.4), // Size affected by depth
                    speed: (Math.random() * 1 + 0.8) * (depth * 0.8 + 0.4), // Speed affected by depth
                    wind: (Math.random() - 0.5) * 0.3, // Random lateral drift
                    sway: Math.random() * Math.PI * 2, // Random starting oscillator
                    swaySpeed: Math.random() * 0.02 + 0.01,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.02,
                    opacity: (Math.random() * 0.6 + 0.4) * (depth * 0.7 + 0.3), // Opacity based on depth
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
            ctx.shadowBlur = radius // Glow effect
            ctx.shadowColor = `rgba(255, 255, 255, ${opacity * 0.5})`

            ctx.beginPath()
            // Draw 6 branches
            for (let i = 0; i < 6; i++) {
                ctx.moveTo(0, 0)
                ctx.lineTo(0, radius)
                // Inner branch
                ctx.moveTo(0, radius * 0.4)
                ctx.lineTo(radius * 0.25, radius * 0.6)
                ctx.moveTo(0, radius * 0.4)
                ctx.lineTo(-radius * 0.25, radius * 0.6)
                // Rotate for next branch
                ctx.rotate(Math.PI / 3)
            }
            ctx.stroke()
            ctx.restore()
        }

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            particles.forEach((p) => {
                // Update physics
                p.y += p.speed
                p.x += p.wind + Math.sin(p.sway) * 0.5
                p.sway += p.swaySpeed
                p.rotation += p.rotationSpeed

                // Wrap around screen
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

        window.addEventListener("resize", resize)
        resize()
        draw()

        return () => {
            window.removeEventListener("resize", resize)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
}

function LeavesEffect({ density: densityProp }: { density?: number }) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        let animationFrameId: number
        // Types of leaves colors
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
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            initParticles()
        }

        const initParticles = () => {
            const density = typeof densityProp === 'number' ? densityProp : 50
            const baseCount = Math.floor(window.innerWidth / 15)
            const particleCount = Math.floor(baseCount * (density / 50))
            particles = []
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
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
                // Draw a simple leaf shape (ellipse-ish)
                ctx.beginPath()
                ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2)
                ctx.fill()

                ctx.restore()

                // Update position
                p.y += p.speed
                p.x += Math.sin(p.oscillation) * 0.5
                p.rotation += p.rotationSpeed
                p.oscillation += p.oscillationSpeed

                // Reset if out of bounds
                if (p.y > canvas.height + p.size) {
                    p.y = -p.size
                    p.x = Math.random() * canvas.width
                }
            })

            animationFrameId = requestAnimationFrame(draw)
        }

        window.addEventListener("resize", resize)
        resize()
        draw()

        return () => {
            window.removeEventListener("resize", resize)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />
}
