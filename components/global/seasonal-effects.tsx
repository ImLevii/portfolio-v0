"use client"

import { useEffect, useRef, useState } from "react"
import { useVisualEffectsStore } from "@/store/visual-effects-store"
import { usePathname } from "next/navigation"

import type { SeasonalSettingsConfig } from "@/actions/seasonal-settings"

interface SeasonalEffectsProps {
    config?: SeasonalSettingsConfig
}

export function SeasonalEffects({ config }: SeasonalEffectsProps) {
    const { weatherEffects, soundEffects, soundtrackVolume, generalVolume } = useVisualEffectsStore()
    const [season, setSeason] = useState<"winter" | "autumn" | null>(null)
    const pathname = usePathname()
    const [hasInteracted, setHasInteracted] = useState(false)

    // Persistent Audio Refs
    const melodyRef = useRef<HTMLAudioElement | null>(null)
    const impactRef = useRef<HTMLAudioElement | null>(null)

    // Interval Refs
    const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const stopTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        const month = new Date().getMonth()
        if (month === 11) setSeason("winter")      // December
        else if (month === 10) setSeason("autumn") // November
        else setSeason(null)

        // Pre-initialize audio objects so they are ready for the click handler
        if (!melodyRef.current) {
            melodyRef.current = new Audio("/sounds/christmas-melody.mp3")
            melodyRef.current.loop = true
        }
        if (!impactRef.current) {
            impactRef.current = new Audio("/sounds/christmas-impact.mp3")
        }
    }, [])

    // Use config mode if available, otherwise use date
    const currentSeason = config?.mode === 'auto' || !config?.mode ? season : config.mode === 'none' ? null : config.mode

    const settingsEnabled = (currentSeason === "winter" || currentSeason === "autumn") && weatherEffects && soundEffects && (config?.enabled ?? true)
    const musicAllowed = settingsEnabled && (config?.musicEnabled ?? true)
    const shopSoundAllowed = settingsEnabled && (config?.shopSoundEnabled ?? true)

    // Volume Limits from Config
    const maxMusicVol = config?.audioVolume ?? 20
    const maxShopVol = config?.shopSoundVolume ?? 40

    // Helper to safely play audio
    const safePlay = (audio: HTMLAudioElement, volume: number) => {
        try {
            audio.volume = Math.max(0, Math.min(1, volume / 100))
            const playPromise = audio.play()
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error("Playback failed (likely autoplay policy):", error)
                })
            }
        } catch (e) {
            console.error("Audio play error:", e)
        }
    }

    const stopMelody = () => {
        if (melodyRef.current) {
            melodyRef.current.pause()
            melodyRef.current.currentTime = 0
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

    // Interaction Listener
    useEffect(() => {
        if (hasInteracted) return

        const handleInteraction = () => {
            setHasInteracted(true)

            // Try to start/resume audio CONTEXT immediately within user gesture
            // Determine what SHOULD be playing right now
            if (settingsEnabled) {
                if (pathname === "/shop") {
                    // Play impact
                    if (impactRef.current && shopSoundAllowed) {
                        impactRef.current.currentTime = 0
                        const vol = Math.min(generalVolume, maxShopVol)
                        safePlay(impactRef.current, vol)
                    }
                } else if (pathname === "/") {
                    // Play melody
                    if (melodyRef.current && musicAllowed) {
                        const vol = Math.min(soundtrackVolume, maxMusicVol)
                        safePlay(melodyRef.current, vol)
                        // Setup fade out timer
                        startFadeOutTimer()
                    }
                }
            }

            // Remove listeners
            ["click", "touchstart", "touchend", "pointerdown", "keydown"].forEach(event =>
                window.removeEventListener(event, handleInteraction)
            )
        }

        ["click", "touchstart", "touchend", "pointerdown", "keydown"].forEach(event =>
            window.addEventListener(event, handleInteraction)
        )

        return () => {
            ["click", "touchstart", "touchend", "pointerdown", "keydown"].forEach(event =>
                window.removeEventListener(event, handleInteraction)
            )
        }
    }, [hasInteracted, pathname, settingsEnabled, generalVolume, soundtrackVolume])

    const startFadeOutTimer = () => {
        if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current)

        // Configurable duration (default 15s)
        const duration = (config?.musicDuration || 15) * 1000
        const shouldFade = config?.musicFadeOut ?? true

        stopTimeoutRef.current = setTimeout(() => {
            if (!shouldFade) {
                stopMelody()
                return
            }

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
        }, duration)
    }

    // Main Logic Effect (Runs on route changes / settings changes)
    useEffect(() => {
        if (!settingsEnabled) {
            stopMelody()
            return
        }

        if (!hasInteracted) return

        // --- Shop Page ---
        if (pathname === "/shop") {
            stopMelody()
            // Impact is mostly one-shot handled by interaction or route change?
            // If we navigate TO shop, play impact (if not already handled by interaction)
            // We need a way to know if we JUST arrived. 
            // The simple "play on render" works fine IF we interacted previously.
            if (impactRef.current && impactRef.current.paused && shopSoundAllowed) {
                // We allow re-playing impact on route enter?
                // Simple logic: Play it.
                impactRef.current.currentTime = 0
                const vol = Math.min(generalVolume, maxShopVol)
                safePlay(impactRef.current, vol)
            }
            return
        }

        // --- Home Page ---
        if (pathname === "/") {
            if (melodyRef.current && melodyRef.current.paused && musicAllowed) {
                const vol = Math.min(soundtrackVolume, maxMusicVol)
                safePlay(melodyRef.current, vol)
                startFadeOutTimer()
            }
        }

        // --- Other Pages ---
        // Melody continues if running.

    }, [pathname, settingsEnabled, hasInteracted, soundtrackVolume, generalVolume])

    // Sync Volumes live
    useEffect(() => {
        if (melodyRef.current && !fadeIntervalRef.current) {
            const vol = Math.min(soundtrackVolume, maxMusicVol)
            melodyRef.current.volume = Math.max(0, Math.min(1, vol / 100))
        }
        if (impactRef.current) {
            const vol = Math.min(generalVolume, maxShopVol)
            impactRef.current.volume = Math.max(0, Math.min(1, vol / 100))
        }
    }, [soundtrackVolume, generalVolume, maxMusicVol, maxShopVol])

    if (!currentSeason || !weatherEffects || (config?.mode === 'none')) return null

    return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
            {currentSeason === "winter" && <SnowEffect />}
            {currentSeason === "autumn" && <LeavesEffect />}
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
