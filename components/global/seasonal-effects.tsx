"use client"

import { useEffect, useRef, useState } from "react"
import { useVisualEffectsStore } from "@/store/visual-effects-store"
import { usePathname } from "next/navigation"

export function SeasonalEffects() {
    const { weatherEffects, soundEffects, soundtrackVolume, generalVolume } = useVisualEffectsStore()
    const [season, setSeason] = useState<"winter" | "autumn" | null>(null)
    const pathname = usePathname()

    // Audio refs
    const melodyRef = useRef<HTMLAudioElement | null>(null)
    const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const stopTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        const month = new Date().getMonth() // 0-11

        // Debug override (Uncomment to test)
        // const month = 11 // December (Winter)
        // const month = 10 // November (Autumn)

        if (month === 11) { // December
            setSeason("winter")
        } else if (month === 10) { // November
            setSeason("autumn")
        } else {
            setSeason(null)
        }
    }, [])

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
        season === "winter" &&
        weatherEffects &&
        soundEffects

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
            if (generalVolume > 0) {
                const impactAudio = new Audio("/sounds/christmas-impact.mp3")
                impactAudio.volume = Math.max(0, Math.min(1, generalVolume / 100))
                impactAudio.play().catch((err) => console.error("Impact autoplay failed:", err))
            }
            return
        }

        // --- Logic for Home Page (Melody) ---
        if (pathname === "/") {
            // Start Melody if not playing (and soundtrack volume allows)
            if (!melodyRef.current && soundtrackVolume > 0) {
                const audio = new Audio("/sounds/christmas-melody.mp3")
                audio.loop = true
                audio.volume = Math.max(0, Math.min(1, soundtrackVolume / 100))

                audio.play().catch((err) => {
                    console.error("Melody autoplay failed:", err)
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

        // --- Logic for Other Pages ---
        // Do nothing. Melody persists if playing. Impact played and finished.

    }, [settingsEnabled, pathname, soundtrackVolume, generalVolume])

    // Cleanup on unmount only
    useEffect(() => {
        return () => stopMelody()
    }, [])

    // Effect 2: Sync Volume
    useEffect(() => {
        if (melodyRef.current && !fadeIntervalRef.current) {
            // Only update volume if not currently fading out
            melodyRef.current.volume = Math.max(0, Math.min(1, soundtrackVolume / 100))
        }
    }, [soundtrackVolume])

    if (!season || !weatherEffects) return null

    return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
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
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            initParticles()
        }

        const initParticles = () => {
            const particleCount = Math.floor(window.innerWidth / 8) // Moderate density for detailed flakes
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

function LeavesEffect() {
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
            const particleCount = Math.floor(window.innerWidth / 15) // Density
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
