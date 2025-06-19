"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface TerminalEffectProps {
  commands?: string[]
  typingSpeed?: number
  cursorBlinkSpeed?: number
  className?: string
  geo?: {
    ip?: string
    city?: string
    region?: string
    country?: string
    privacy?: any
  }
}

const MATRIX_CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

const DEFAULT_COMMANDS = [
  "Welcome to Levi's Portfolio",
  "",
  "npm install portfolio",
  "Initializing developer profile...",
  "Loading skills and experience...",
  "Importing creative solutions...",
  "export default function Developer() {",
  "  return (",
  "    <FullStackDeveloper",
  "      frontend={['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Three.js']}",
  "      backend={['Node.js', 'Express.js', 'MongoDB', 'GraphQL', 'MySQL/Prisma']}",
  '      passion="Building modern web experiences"',
  "    />",
  "  )",
  "}",
  "Looking to collaborate? Contact me below.",
]

// Interactive commands that respond to user input
const INTERACTIVE_COMMANDS = {
  "help": "Available commands: help, clear, about, skills, contact, matrix, particles, xrp, dox",
  "clear": "clear",
  "about": "I'm a passionate full-stack developer focused on creating innovative web solutions.",
  "skills": "Frontend: React, Next.js, TypeScript, Tailwind CSS, Three.js\nBackend: Node.js, Express.js, MongoDB, GraphQL, MySQL/Prisma\nTools: Git, Docker, AWS, Vercel",
  "contact": "Email: levi@example.com\nLinkedIn: linkedin.com/in/levi\nGitHub: github.com/levi",
  "matrix": "matrix",
  "particles": "particles",
  "xrp": "xrp",
  "dox": "dox"
}

// Custom Demo Icon Component
const DemoIcon = ({ isActive }: { isActive: boolean }) => {
  return (
    <div className="relative w-4 h-4">
      {/* Main terminal screen */}
      <div 
        className="absolute inset-0 rounded-sm border border-current"
        style={{ 
          color: isActive ? '#ef4444' : '#64748b',
          backgroundColor: isActive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(100, 116, 139, 0.1)',
          boxShadow: isActive 
            ? '0 0 8px rgba(239, 68, 68, 0.6), inset 0 0 4px rgba(239, 68, 68, 0.2)'
            : '0 0 4px rgba(100, 116, 139, 0.3), inset 0 0 2px rgba(100, 116, 139, 0.1)'
        }}
      />
      
      {/* Terminal header */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 rounded-t-sm"
        style={{ 
          backgroundColor: isActive ? 'rgba(239, 68, 68, 0.3)' : 'rgba(100, 116, 139, 0.2)',
          borderBottom: `1px solid ${isActive ? 'rgba(239, 68, 68, 0.5)' : 'rgba(100, 116, 139, 0.3)'}`
        }}
      />
      
      {/* Terminal dots */}
      <div className="absolute top-0.5 left-1 flex gap-0.5">
        <div 
          className="w-0.5 h-0.5 rounded-full"
          style={{ backgroundColor: isActive ? '#ef4444' : '#64748b' }}
        />
        <div 
          className="w-0.5 h-0.5 rounded-full"
          style={{ backgroundColor: isActive ? '#ef4444' : '#64748b' }}
        />
        <div 
          className="w-0.5 h-0.5 rounded-full"
          style={{ backgroundColor: isActive ? '#ef4444' : '#64748b' }}
        />
      </div>
      
      {/* Terminal content lines */}
      <div className="absolute top-2 left-1 right-1 space-y-0.5">
        <div 
          className="h-0.5 rounded-full"
          style={{ 
            backgroundColor: isActive ? 'rgba(239, 68, 68, 0.6)' : 'rgba(100, 116, 139, 0.4)',
            width: '60%'
          }}
        />
        <div 
          className="h-0.5 rounded-full"
          style={{ 
            backgroundColor: isActive ? 'rgba(239, 68, 68, 0.6)' : 'rgba(100, 116, 139, 0.4)',
            width: '80%'
          }}
        />
        <div 
          className="h-0.5 rounded-full"
          style={{ 
            backgroundColor: isActive ? 'rgba(239, 68, 68, 0.6)' : 'rgba(100, 116, 139, 0.4)',
            width: '40%'
          }}
        />
      </div>
      
      {/* Cursor blink effect */}
      {isActive && (
        <motion.div
          className="absolute bottom-1 left-1 w-0.5 h-0.5"
          style={{ backgroundColor: '#ef4444' }}
          animate={{
            opacity: [1, 0, 1],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
      
      {/* Glow effect for active state */}
      {isActive && (
        <div 
          className="absolute inset-0 rounded-sm opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.4), transparent)',
            filter: 'blur(1px)'
          }}
        />
      )}
    </div>
  )
}

// Custom Interactive Icon Component
const InteractiveIcon = ({ isActive }: { isActive: boolean }) => {
  return (
    <div className="relative w-4 h-4">
      {/* Main terminal screen */}
      <div 
        className="absolute inset-0 rounded-sm border border-current"
        style={{ 
          color: isActive ? '#22c55e' : '#64748b',
          backgroundColor: isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(100, 116, 139, 0.1)',
          boxShadow: isActive 
            ? '0 0 8px rgba(34, 197, 94, 0.6), inset 0 0 4px rgba(34, 197, 94, 0.2)'
            : '0 0 4px rgba(100, 116, 139, 0.3), inset 0 0 2px rgba(100, 116, 139, 0.1)'
        }}
      />
      
      {/* Terminal header */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 rounded-t-sm"
        style={{ 
          backgroundColor: isActive ? 'rgba(34, 197, 94, 0.3)' : 'rgba(100, 116, 139, 0.2)',
          borderBottom: `1px solid ${isActive ? 'rgba(34, 197, 94, 0.5)' : 'rgba(100, 116, 139, 0.3)'}`
        }}
      />
      
      {/* Terminal dots */}
      <div className="absolute top-0.5 left-1 flex gap-0.5">
        <div 
          className="w-0.5 h-0.5 rounded-full"
          style={{ backgroundColor: isActive ? '#22c55e' : '#64748b' }}
        />
        <div 
          className="w-0.5 h-0.5 rounded-full"
          style={{ backgroundColor: isActive ? '#22c55e' : '#64748b' }}
        />
        <div 
          className="w-0.5 h-0.5 rounded-full"
          style={{ backgroundColor: isActive ? '#22c55e' : '#64748b' }}
        />
      </div>
      
      {/* Interactive prompt */}
      <div className="absolute top-2 left-1 right-1">
        <div className="flex items-center gap-0.5">
          <span 
            className="text-[4px] font-bold"
            style={{ color: isActive ? '#22c55e' : '#64748b' }}
          >
            $
          </span>
          <motion.div
            className="w-0.5 h-1"
            style={{ backgroundColor: isActive ? '#22c55e' : '#64748b' }}
            animate={isActive ? {
              opacity: [1, 0, 1],
              scale: [1, 1.2, 1],
            } : {
              opacity: 0.5
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>
      
      {/* Glow effect for active state */}
      {isActive && (
        <div 
          className="absolute inset-0 rounded-sm opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.4), transparent)',
            filter: 'blur(1px)'
          }}
        />
      )}
    </div>
  )
}

// XRP Price Chart Component
const XrpChart = ({ data, price, change24h, width = 300, height = 80 }: { 
  data: number[], 
  price: number, 
  change24h: number,
  width?: number, 
  height?: number 
}) => {
  if (!data || data.length === 0) return null

  const minPrice = Math.min(...data)
  const maxPrice = Math.max(...data)
  const priceRange = maxPrice - minPrice || 1

  const points = data.map((price, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - ((price - minPrice) / priceRange) * height
    return `${x},${y}`
  }).join(' ')

  const gradientId = `xrp-gradient-${Math.random().toString(36).substr(2, 9)}`
  const changeColor = change24h >= 0 ? '#22c55e' : '#ef4444'
  const changeSymbol = change24h >= 0 ? '↗' : '↘'

  return (
    <div className="inline-block relative">
      <svg width={width} height={height} className="border border-gray-600 rounded-lg">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Area fill */}
        <polygon
          points={`0,${height} ${points} ${width},${height}`}
          fill={`url(#${gradientId})`}
        />
        
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke="#ef4444"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
        />
        
        {/* Current price indicator */}
        <circle
          cx={width}
          cy={height - ((data[data.length - 1] - minPrice) / priceRange) * height}
          r="5"
          fill="#ef4444"
          stroke="#ffffff"
          strokeWidth="2"
          filter="url(#glow)"
        />
        
        {/* Price label background */}
        <rect
          x={width - 170}
          y="25"
          width="150"
          height="75"
          rx="10"
          fill="rgba(0, 0, 0, 0.85)"
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="1"
        />
        
        {/* Current price text */}
        <text
          x={width - 165}
          y="55"
          fill="#ffffff"
          fontSize="18"
          fontWeight="bold"
          fontFamily="monospace"
        >
          ${price.toFixed(4)}
        </text>
        
        {/* 24h change */}
        <text
          x={width - 165}
          y="80"
          fill={changeColor}
          fontSize="16"
          fontWeight="bold"
          fontFamily="monospace"
        >
          {changeSymbol} {change24h.toFixed(2)}%
        </text>
        
        {/* XRP label background */}
        <rect
          x="20"
          y="10"
          width="70"
          height="40"
          rx="8"
          fill="rgba(0, 0, 0, 0.85)"
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="1"
        />
        
        {/* XRP label */}
        <text
          x="25"
          y="35"
          fill="#ef4444"
          fontSize="16"
          fontWeight="bold"
          fontFamily="monospace"
          filter="url(#glow)"
        >
          XRP/USD
        </text>
        
        {/* Time labels */}
        <text
          x="25"
          y={height - 25}
          fill="#64748b"
          fontSize="12"
          fontFamily="monospace"
        >
          24h ago
        </text>
        <text
          x={width - 60}
          y={height - 25}
          fill="#64748b"
          fontSize="12"
          fontFamily="monospace"
        >
          now
        </text>
      </svg>
    </div>
  )
}

export default function TerminalEffect({
  commands = DEFAULT_COMMANDS,
  typingSpeed = 50,
  cursorBlinkSpeed = 530,
  className = "",
  geo,
}: TerminalEffectProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentCommandIndex, setCurrentCommandIndex] = useState(0)
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [cursorVisible, setCursorVisible] = useState(true)
  const [showCommands, setShowCommands] = useState(false)
  const [scanlinePosition, setScanlinePosition] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, vx: number, vy: number, life: number, type: string}>>([])
  const [currentTime, setCurrentTime] = useState("")
  const [currentDate, setCurrentDate] = useState("")
  const [isClient, setIsClient] = useState(false)
  const [isInteractive, setIsInteractive] = useState(false)
  const [userInput, setUserInput] = useState("")
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [showMatrix, setShowMatrix] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const [typingSound, setTypingSound] = useState(false)
  const [systemLoad, setSystemLoad] = useState(0)
  const [networkStatus, setNetworkStatus] = useState('online')
  const [memoryUsage, setMemoryUsage] = useState(0)
  const [cpuUsage, setCpuUsage] = useState(0)
  const [manualModeSwitch, setManualModeSwitch] = useState(false)
  const [hoverEffect, setHoverEffect] = useState(false)
  const [keyPressEffect, setKeyPressEffect] = useState(false)
  const [ambientGlow, setAmbientGlow] = useState(0)
  const [circuitPattern, setCircuitPattern] = useState(0)
  const [xrpData, setXrpData] = useState<{price: number, change24h: number, history: number[]} | null>(null)
  const [xrpLoading, setXrpLoading] = useState(false)
  const [showXrpChart, setShowXrpChart] = useState(false)
  const [xrpDisplayed, setXrpDisplayed] = useState(false)
  const [pendingTypeQueue, setPendingTypeQueue] = useState<string | null>(null)
  const [pendingTypeCallback, setPendingTypeCallback] = useState<(() => void) | null>(null)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particleCanvasRef = useRef<HTMLCanvasElement>(null)
  const circuitCanvasRef = useRef<HTMLCanvasElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const particlesRef = useRef(particles)

  // Client-side only initialization
  useEffect(() => {
    setIsClient(true)
    setCurrentTime(new Date().toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    }))
    setCurrentDate(new Date().toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }).toUpperCase())
    
    // Start demo after 2 seconds
    const demoTimeout = setTimeout(() => {
      setShowCommands(true)
    }, 2000)
    
    // Simulate system metrics
    const systemInterval = setInterval(() => {
      setSystemLoad(Math.random() * 100)
      setMemoryUsage(Math.random() * 100)
      setCpuUsage(Math.random() * 100)
      const newStatus = Math.random() > 0.7 ? 'offline' : 'online'
      setNetworkStatus(newStatus)
      console.log('Network status changed to:', newStatus) // Debug log
    }, 2000)

    // Ambient glow animation
    const glowInterval = setInterval(() => {
      setAmbientGlow(prev => (prev + 0.02) % (Math.PI * 2))
    }, 50)

    // Circuit pattern animation
    const circuitInterval = setInterval(() => {
      setCircuitPattern(prev => (prev + 0.01) % 100)
    }, 100)

    return () => {
      clearTimeout(demoTimeout)
      clearInterval(systemInterval)
      clearInterval(glowInterval)
      clearInterval(circuitInterval)
    }
  }, [])

  // Update time every second
  useEffect(() => {
    if (!isClient) return

    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      }))
      setCurrentDate(new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }).toUpperCase())
    }, 1000)

    return () => clearInterval(interval)
  }, [isClient])

  // Enhanced Matrix animation setup
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !showMatrix) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Detect mobile device
    const isMobile = typeof window !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    // Use device pixel ratio for crisp rendering
    const dpr = window.devicePixelRatio || 1
    // Responsive font size and density
    const fontSize = isMobile ? 20 : 14
    const frameInterval = isMobile ? 50 : 33 // 20fps on mobile, 30fps on desktop

    const resizeCanvas = () => {
      // Set canvas size for device pixel ratio
      canvas.width = Math.floor(canvas.offsetWidth * dpr)
      canvas.height = Math.floor(canvas.offsetHeight * dpr)
      ctx.setTransform(1, 0, 0, 1, 0, 0) // Reset transform
      ctx.scale(dpr, dpr)
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Calculate columns based on font size and density
    const columns = Math.floor(canvas.offsetWidth / fontSize)
    const drops: number[] = Array(columns).fill(1)
    const speeds: number[] = Array(columns).fill(0).map(() => (isMobile ? Math.random() * 1.2 + 0.3 : Math.random() * 2 + 0.5))
    const opacities: number[] = Array(columns).fill(0).map(() => Math.random() * 0.8 + 0.2)

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'
      ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr)

      for (let i = 0; i < drops.length; i++) {
        const text = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
        const x = i * fontSize
        const y = drops[i] * fontSize
        // Create gradient for each character
        const gradient = ctx.createLinearGradient(x, y - fontSize, x, y + fontSize)
        gradient.addColorStop(0, `rgba(255, 0, 0, ${opacities[i] * 0.3})`)
        gradient.addColorStop(0.5, `rgba(255, 0, 0, ${opacities[i]})`)
        gradient.addColorStop(1, `rgba(255, 0, 0, ${opacities[i] * 0.3})`)
        ctx.fillStyle = gradient
        ctx.font = `${fontSize}px monospace`
        ctx.shadowColor = 'rgba(255, 0, 0, 0.8)'
        ctx.shadowBlur = 8
        ctx.fillText(text, x, y)
        ctx.shadowBlur = 0
        drops[i] += speeds[i]
        if (drops[i] * fontSize > canvas.height / dpr && Math.random() > 0.975) {
          drops[i] = 0
          speeds[i] = isMobile ? Math.random() * 1.2 + 0.3 : Math.random() * 2 + 0.5
          opacities[i] = Math.random() * 0.8 + 0.2
        }
      }
    }

    // Use setInterval for frame rate limiting
    const interval = setInterval(draw, frameInterval)

    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [showMatrix])

  // Enhanced particle system with multiple types
  useEffect(() => {
    const canvas = particleCanvasRef.current
    if (!canvas || !showParticles) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const animateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      setParticles(prevParticles => {
        const updatedParticles = prevParticles
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            life: particle.life - 1
          }))
          .filter(particle => particle.life > 0)

        // Add new particles with variety
        if (Math.random() < 0.2) {
          const types = ['data', 'energy']
          const type = types[Math.floor(Math.random() * types.length)]
          updatedParticles.push({
            id: Date.now() + Math.random(),
            x: Math.random() * canvas.width,
            y: canvas.height + 10,
            vx: (Math.random() - 0.5) * 4,
            vy: -Math.random() * 6 - 2,
            life: Math.random() * 200 + 100,
            type
          })
        }

        return updatedParticles
      })

      // Draw particles with enhanced effects
      particlesRef.current.forEach(particle => {
        const alpha = particle.life / 200
        const size = (particle.life / 200) * 4
        
        if (particle.type === 'data') {
          // Data particles - small dots
          const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, size)
          gradient.addColorStop(0, `rgba(255, 0, 0, ${alpha})`)
          gradient.addColorStop(1, `rgba(255, 0, 0, 0)`)
          
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2)
          ctx.fill()
        } else if (particle.type === 'energy') {
          // Energy particles - lines
          ctx.strokeStyle = `rgba(255, 0, 0, ${alpha})`
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(particle.x, particle.y)
          ctx.lineTo(particle.x + particle.vx * 2, particle.y + particle.vy * 2)
          ctx.stroke()
        }
      })

      requestAnimationFrame(animateParticles)
    }

    const animationId = requestAnimationFrame(animateParticles)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [showParticles])

  // Circuit pattern animation
  useEffect(() => {
    const canvas = circuitCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const drawCircuit = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const gridSize = 30
      const cols = Math.floor(canvas.width / gridSize)
      const rows = Math.floor(canvas.height / gridSize)
      
      ctx.strokeStyle = `rgba(239, 68, 68, ${0.1 + Math.sin(ambientGlow) * 0.05})`
      ctx.lineWidth = 1
      
      // Draw circuit grid
      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const x = i * gridSize
          const y = j * gridSize
          
          if (Math.random() > 0.7) {
            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.lineTo(x + gridSize, y)
            ctx.stroke()
          }
          
          if (Math.random() > 0.7) {
            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.lineTo(x, y + gridSize)
            ctx.stroke()
          }
        }
      }
      
      // Draw animated data flow
      const flowX = (circuitPattern / 100) * canvas.width
      ctx.strokeStyle = `rgba(239, 68, 68, ${0.3 + Math.sin(ambientGlow * 2) * 0.2})`
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(flowX, 0)
      ctx.lineTo(flowX, canvas.height)
      ctx.stroke()
    }

    const interval = setInterval(drawCircuit, 100)

    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [ambientGlow, circuitPattern])

  // Update particles ref when particles state changes
  useEffect(() => {
    particlesRef.current = particles
  }, [particles])

  // Handle XRP data display when fetched
  useEffect(() => {
    if (xrpData && showXrpChart && !xrpDisplayed) {
      setDisplayedText(prev => prev + `\nXRP Price Data:\n`)
      setXrpDisplayed(true)
    }
  }, [xrpData, showXrpChart, xrpDisplayed])

  // XRP price fetching function
  const fetchXrpPrice = useCallback(async () => {
    setXrpLoading(true)
    try {
      // Using CoinGecko API (free, no API key required)
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd&include_24hr_change=true')
      const data = await response.json()
      
      if (data.ripple) {
        const price = data.ripple.usd
        const change24h = data.ripple.usd_24h_change
        
        // Generate mock historical data for the last 24 hours (24 data points)
        const history = Array.from({ length: 24 }, (_, i) => {
          const basePrice = price
          const variation = (Math.random() - 0.5) * 0.1 // ±5% variation
          return basePrice * (1 + variation)
        })
        
        setXrpData({ price, change24h, history })
      }
    } catch (error) {
      console.error('Error fetching XRP price:', error)
      // Fallback data if API fails
      const fallbackPrice = 0.52 + (Math.random() - 0.5) * 0.1
      const fallbackChange = (Math.random() - 0.5) * 10
      const fallbackHistory = Array.from({ length: 24 }, (_, i) => {
        const basePrice = fallbackPrice
        const variation = (Math.random() - 0.5) * 0.1
        return basePrice * (1 + variation)
      })
      setXrpData({ price: fallbackPrice, change24h: fallbackChange, history: fallbackHistory })
    } finally {
      setXrpLoading(false)
    }
  }, [])

  // Enhanced scanline animation
  useEffect(() => {
    const interval = setInterval(() => {
      setScanlinePosition((prev) => (prev + 1.5) % 100)
    }, 30)

    return () => clearInterval(interval)
  }, [])

  // Handle typing animation
  useEffect(() => {
    if (!showCommands || currentCommandIndex >= commands.length || isInteractive) return

    const currentCommand = commands[currentCommandIndex]
    setIsTyping(true)

    if (currentCharIndex < currentCommand.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + currentCommand[currentCharIndex])
        setCurrentCharIndex(currentCharIndex + 1)
        setKeyPressEffect(true)
        setTimeout(() => setKeyPressEffect(false), 50)
      }, typingSpeed)

      return () => clearTimeout(timeout)
    } else {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + "\n")
        setCurrentCommandIndex(currentCommandIndex + 1)
        setCurrentCharIndex(0)
        setIsTyping(false)
      }, typingSpeed * 10)

      return () => clearTimeout(timeout)
    }
  }, [currentCommandIndex, currentCharIndex, commands, typingSpeed, showCommands, isInteractive])

  // Reset animation after completion and switch to interactive
  useEffect(() => {
    if (currentCommandIndex >= commands.length && !isInteractive && !manualModeSwitch) {
      const resetTimeout = setTimeout(() => {
        // Restart the demo animation instead of switching to interactive
        setDisplayedText("")
        setCurrentCommandIndex(0)
        setCurrentCharIndex(0)
        setIsTyping(false)
        setShowCommands(true)
        // Reset manual mode switch to allow automatic cycling
        setManualModeSwitch(false)
      }, 3000) // Reduced delay for faster restart

      return () => clearTimeout(resetTimeout)
    }
  }, [currentCommandIndex, commands.length, isInteractive, manualModeSwitch, commands])

  // Focus input when interactive mode starts
  useEffect(() => {
    if (isInteractive && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isInteractive])

  // Enhanced cursor blinking with typing effect
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isTyping) {
      interval = setInterval(() => {
        setCursorVisible((prev) => !prev)
      }, 200)
    } else {
      interval = setInterval(() => {
        setCursorVisible((prev) => !prev)
      }, 600)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isTyping])

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [displayedText])

  // Handle interactive mode
  const handleCommand = useCallback((command: string) => {
    const cmd = command.toLowerCase().trim()
    const response = INTERACTIVE_COMMANDS[cmd as keyof typeof INTERACTIVE_COMMANDS]
    
    if (response) {
      if (cmd === 'clear') {
        setDisplayedText("")
        setShowXrpChart(false)
        setXrpDisplayed(false)
        return
      }
      if (cmd === 'matrix') {
        setShowMatrix(prev => !prev)
        setDisplayedText(prev => prev + `\nMatrix effect ${!showMatrix ? 'enabled' : 'disabled'}\n`)
        return
      }
      if (cmd === 'particles') {
        setShowParticles(prev => !prev)
        setDisplayedText(prev => prev + `\nParticle effect ${!showParticles ? 'enabled' : 'disabled'}\n`)
        return
      }
      if (cmd === 'xrp') {
        setDisplayedText(prev => prev + `\nFetching XRP price data...\n`)
        fetchXrpPrice().then(() => {
          setShowXrpChart(true)
        })
        return
      }
      if (cmd === 'dox') {
        setDisplayedText(prev => prev + `\nFetching IP info...\n`)
        setDisplayedText(prev => prev + `\nFetching GEO info...\n`)

        fetch('https://ipinfo.io/json?token=febca1646e0805')
          .then(res => res.json())
          .then(data => {
            const jsonStr = `\n${JSON.stringify(data, null, 2)}\n`
            setPendingTypeQueue(jsonStr)
          })
          .catch(() => {
            setPendingTypeQueue("\nFailed to fetch IP info.\n")
          })
        return
      }
      setDisplayedText(prev => prev + `\n${response}\n`)
    } else {
      setDisplayedText(prev => prev + `\nCommand not found: ${command}. Type 'help' for available commands.\n`)
    }
  }, [showMatrix, showParticles, fetchXrpPrice])

  // Handle keyboard input
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (userInput.trim()) {
        setCommandHistory(prev => [...prev, userInput])
        setDisplayedText(prev => prev + `\n$ ${userInput}\n`)
        handleCommand(userInput)
        setUserInput("")
        setHistoryIndex(-1)
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = Math.max(-1, historyIndex - 1)
        setHistoryIndex(newIndex)
        setUserInput(commandHistory[commandHistory.length + newIndex] || "")
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex < -1) {
        const newIndex = Math.min(-1, historyIndex + 1)
        setHistoryIndex(newIndex)
        setUserInput(commandHistory[commandHistory.length + newIndex] || "")
      }
    }
  }, [userInput, commandHistory, historyIndex, handleCommand])

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value)
  }, [])

  // Enhanced text formatting with more sophisticated syntax highlighting
  const formatText = (text: string) => {
    return text.split("\n").map((line, index) => {
      // Simple and reliable syntax highlighting
      const highlightSyntax = (text: string) => {
        // Define all patterns with their styling - REVAMPED COLORS
        const patterns = [
          { regex: /(import|export|default|function|return|const|let|var)\b/g, color: '#ef4444', weight: '600' }, // Red for keywords
          { regex: /(['"].*?['"])/g, color: '#fbbf24', weight: '400' }, // Amber for strings
          { regex: /(\{|\}|\[|\]|\(|\))/g, color: '#a78bfa', weight: '400' }, // Purple for brackets
          { regex: /(npm install|Loading|Initializing|Importing)/g, color: '#ef4444', weight: '600' }, // Red for commands
          { regex: /(React|Next\.js|TypeScript|Tailwind CSS|Three\.js|Node\.js|Express\.js|MongoDB|GraphQL|MySQL|Prisma)/g, color: '#f87171', weight: '600' }, // Red for tech
          { regex: /(FullStackDeveloper)/g, color: '#ef4444', weight: '700' }, // Red for class names
          { regex: /(frontend|backend|passion)/g, color: '#a3a3a3', weight: '400' }, // Gray for props
          { regex: /(help|clear|about|skills|contact|matrix|particles|xrp)/g, color: '#ef4444', weight: '600' }, // Red for commands
          { regex: /(\d+)/g, color: '#ec4899', weight: '400' }, // Pink for numbers
          { regex: /(true|false|null|undefined)/g, color: '#8b5cf6', weight: '400' } // Violet for booleans
        ]

        // Define types for better type safety
        type Match = {
          start: number
          end: number
          text: string
          color: string
          weight: string
          patternIndex: number
        }

        type ResultPart = {
          text: string
          color: string
          weight: string
        }

        // Find all matches with their positions
        const matches: Match[] = []
        
        patterns.forEach((pattern, patternIndex) => {
          let match
          while ((match = pattern.regex.exec(text)) !== null) {
            matches.push({
              start: match.index,
              end: match.index + match[0].length,
              text: match[0],
              color: pattern.color,
              weight: pattern.weight,
              patternIndex
            })
          }
        })

        // Sort matches by start position
        matches.sort((a, b) => a.start - b.start)

        // Remove overlapping matches (keep the first one)
        const filteredMatches: Match[] = []
        let lastEnd = 0
        
        matches.forEach(match => {
          if (match.start >= lastEnd) {
            filteredMatches.push(match)
            lastEnd = match.end
          }
        })

        // Create the final result
        const result: ResultPart[] = []
        let currentPos = 0

        filteredMatches.forEach(match => {
          // Add text before this match
          if (match.start > currentPos) {
            result.push({
              text: text.slice(currentPos, match.start),
              color: '#f8fafc',
              weight: '400'
            })
          }
          
          // Add the match
          result.push({
            text: match.text,
            color: match.color,
            weight: match.weight
          })
          
          currentPos = match.end
        })

        // Add remaining text
        if (currentPos < text.length) {
          result.push({
            text: text.slice(currentPos),
            color: '#f8fafc',
            weight: '400'
          })
        }

        // If no matches found, return the original text
        if (result.length === 0) {
          return [{
            text: text,
            color: '#f8fafc',
            weight: '400'
          }]
        }

        return result
      }

      const highlightedParts = highlightSyntax(line.replace(/^\$ /, ''))

      return (
        <motion.div 
          key={index} 
          className="terminal-line leading-relaxed"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: index * 0.1 }}
        >
          {line.startsWith('$ ') && <span style={{ color: '#ef4444', fontWeight: '700', marginRight: '0.5rem' }}>$ </span>}
          {highlightedParts.map((part, partIndex) => (
            <span 
              key={partIndex} 
              style={{ 
                color: part.color, 
                fontWeight: part.weight 
              }}
            >
              {part.text}
            </span>
          ))}
        </motion.div>
      )
    })
  }

  // Handle mode switching
  const handleModeSwitch = useCallback(() => {
    if (isInteractive) {
      // Switch to demo mode
      setIsInteractive(false)
      setManualModeSwitch(false)
      setDisplayedText("")
      setCurrentCommandIndex(0)
      setCurrentCharIndex(0)
      setIsTyping(false)
      setShowCommands(true)
      setUserInput("")
      setCommandHistory([])
      setHistoryIndex(-1)
      setShowXrpChart(false)
      setXrpDisplayed(false)
    } else {
      // Switch to interactive mode
      setIsInteractive(true)
      setManualModeSwitch(true)
      setDisplayedText("Welcome to Interactive Terminal Mode!\n\nType 'help' to see available commands.\n")
      setCurrentCommandIndex(0)
      setCurrentCharIndex(0)
      setIsTyping(false)
      setShowCommands(false)
      setShowXrpChart(false)
      setXrpDisplayed(false)
    }
  }, [isInteractive])

  // Prepare welcome commands with geolocation if available
  //const welcomeCommands = geo && geo.ip ? [
  //   `IP: ${geo.ip}`,
  //   `Location: ${[geo.city, geo.region, geo.country].filter(Boolean).join(", ")}`,
  //   geo.privacy && geo.privacy.vpn ? "VPN/Proxy detected: Yes" : undefined
  // ].filter(Boolean) as string[] : [
  //   "IP: 127.0.0.1",
  //   "Location: Matrix City"
  //]

  // Merge with the rest of the commands
  commands = [
    ...DEFAULT_COMMANDS
  ]

  // Typing animation for queued text (used for dox command)
  useEffect(() => {
    if (pendingTypeQueue && !isTyping) {
      let i = 0
      setIsTyping(true)
      const typeNext = () => {
        if (i < pendingTypeQueue.length) {
          setDisplayedText(prev => prev + pendingTypeQueue[i])
          i++
          setTimeout(typeNext, typingSpeed)
        } else {
          setIsTyping(false)
          setPendingTypeQueue(null)
          if (pendingTypeCallback) {
            pendingTypeCallback()
            setPendingTypeCallback(null)
          }
        }
      }
      typeNext()
    }
  }, [pendingTypeQueue, isTyping, typingSpeed, pendingTypeCallback])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`terminal-container relative w-full max-w-full sm:max-w-4xl lg:max-w-5xl mx-auto ${className}`}
      onMouseEnter={() => setHoverEffect(true)}
      onMouseLeave={() => setHoverEffect(false)}
    >
      {/* Multi-layered background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black/40 to-red-800/20 rounded-2xl blur-3xl animate-pulse"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-2xl"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5 rounded-2xl"></div>
      
      {/* Circuit pattern background */}
      <canvas
        ref={circuitCanvasRef}
        className="absolute inset-0 w-full h-full rounded-2xl pointer-events-none z-0"
        style={{ 
          width: '100%', 
          height: '100%',
          opacity: 0.3
        }}
      />
      
      {/* Enhanced CRT scanlines */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-transparent via-white/8 to-transparent rounded-2xl pointer-events-none z-10"
        style={{
          backgroundSize: '100% 3px',
          animation: 'scanlines 0.08s linear infinite'
        }}
      />
      
      {/* Moving scanline with glow */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/30 to-transparent rounded-2xl pointer-events-none z-20"
        style={{
          height: '3px',
          top: `${scanlinePosition}%`,
          transition: 'top 0.03s linear',
          filter: 'blur(1px)',
          boxShadow: '0 0 10px rgba(245, 158, 11, 0.5)'
        }}
      />

      {/* Terminal frame with enhanced styling and depth */}
      <motion.div 
        className={`relative z-30 rounded-2xl border border-white/20 bg-gradient-to-b from-black/80 via-gray-900/70 to-black/80 shadow-2xl overflow-hidden backdrop-blur-xl`}
        style={{
          boxShadow: `
            0 0 20px rgba(255, 255, 255, 0.05),
            0 0 40px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            inset 0 -1px 0 rgba(0, 0, 0, 0.5)
          `
        }}
      >
        {/* Enhanced terminal header with depth */}
        <div className="terminal-header flex flex-wrap items-center gap-1 sm:gap-2 md:gap-4 px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3 lg:px-6 lg:py-4 bg-gradient-to-r from-black/90 via-gray-900/80 to-black/90 border-b border-white/20 rounded-t-2xl relative overflow-hidden backdrop-blur-sm">
          {/* Header background pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/3 via-transparent to-white/3 opacity-50"></div>
          
          <div className="flex gap-1 sm:gap-2 relative z-10">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors cursor-pointer" title="Close"></div>
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors cursor-pointer" title="Minimize"></div>
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors cursor-pointer" title="Maximize"></div>
          </div>
          <div className="ml-1 sm:ml-2 md:ml-4 text-[10px] sm:text-xs md:text-sm font-mono font-semibold tracking-wider relative z-10" style={{ color: '#cbd5e1' }}>
            levi@portfolio:~ <span style={{ color: '#ef4444' }}>/dev/portfolio</span>
          </div>
          
          {/* Enhanced system status indicators */}
          <div className="ml-auto flex flex-wrap items-center gap-1 sm:gap-2 md:gap-4 text-xs font-mono relative z-10" style={{ color: '#64748b' }}>
            <motion.div
              className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md bg-gradient-to-r from-gray-800/60 to-gray-900/60 border border-gray-700/40 backdrop-blur-sm"
              style={{ 
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.3)'
              }}
            >
              <div className="flex items-center gap-2">
                <motion.svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={networkStatus === 'online' ? '#22c55e' : '#ef4444'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  animate={networkStatus === 'online' ? {
                    scale: [1, 1.1, 1],
                  } : {
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: networkStatus === 'online' ? 2 : 1,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  <circle cx="12" cy="12" r="3"/>
                </motion.svg>
                <span style={{ 
                  color: networkStatus === 'online' ? '#22c55e' : '#ef4444',
                  fontWeight: '700',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  textShadow: `0 0 4px ${networkStatus === 'online' ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`
                }}
                >
                  {networkStatus}
                </span>
              </div>
            </motion.div>
            
            {/* Compact Enhanced Date & Time display */}
            {isClient && (
              <motion.div
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md bg-gradient-to-r from-gray-800/60 to-gray-900/60 border border-gray-700/40 backdrop-blur-sm relative overflow-hidden"
                style={{ 
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.3)'
                }}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  {/* Main clock icon */}
                  <div className="relative">
                    <motion.svg 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="relative z-10 w-2.5 h-2.5 sm:w-3 sm:h-3"
                      style={{ color: '#ef4444' }}
                      animate={{ 
                        rotate: [0, 360],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ 
                        rotate: { duration: 60, repeat: Infinity, ease: "linear" },
                        scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                      }}
                    >
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12,6 12,12 16,14"/>
                    </motion.svg>
                    
                    {/* Subtle clock glow */}
                    <div 
                      className="absolute inset-0 w-2.5 h-2.5 sm:w-3 sm:h-3 opacity-20"
                      style={{
                        background: 'radial-gradient(circle, rgba(245, 158, 11, 0.4), transparent)',
                        filter: 'blur(1px)'
                      }}
                    />
                  </div>
                  
                  {/* Date and Time display */}
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    <span 
                      style={{ 
                        color: '#ffffff',
                        fontWeight: '700',
                        fontSize: '9px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.6px'
                      }}
                      className="sm:text-[11px] sm:tracking-[0.8px]"
                    >
                      {currentTime}
                    </span>
                    <span className="hidden sm:inline" style={{ color: '#94a3b8', fontSize: '6px' }}>•</span>
                    <span 
                      className="hidden sm:inline"
                      style={{ 
                        color: '#e2e8f0',
                        fontWeight: '600',
                        fontSize: '9px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.6px',
                        textShadow: '0 0 4px rgba(226, 232, 240, 0.6)'
                      }}
                    >
                      {currentDate}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
            
            {showMatrix && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gradient-to-r from-gray-800/60 to-gray-900/60 border border-gray-700/40 backdrop-blur-sm"
                style={{ 
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.3)'
                }}
              >
                <div className="w-2 h-2 animate-pulse shadow-sm" style={{ 
                  backgroundColor: '#dc2626',
                  boxShadow: '0 1px 2px rgba(220, 38, 38, 0.5)'
                }}></div>
                <span style={{ 
                  color: '#ef4444',
                  fontWeight: '700',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  textShadow: '0 0 4px rgba(239, 68, 68, 0.5)'
                }}>
                  MATRIX
                </span>
              </motion.div>
            )}
            {showParticles && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gradient-to-r from-gray-800/60 to-gray-900/60 border border-gray-700/40 backdrop-blur-sm"
                style={{ 
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.3)'
                }}
              >
                <div className="w-2 h-2 animate-pulse shadow-sm" style={{ 
                  backgroundColor: '#dc2626',
                  boxShadow: '0 1px 2px rgba(220, 38, 38, 0.5)'
                }}></div>
                <span style={{ 
                  color: '#ef4444',
                  fontWeight: '700',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  textShadow: '0 0 4px rgba(239, 68, 68, 0.5)'
                }}>
                  PARTICLES
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Enhanced terminal body with multiple layers */}
        <motion.div
          ref={containerRef}
          className="terminal-body backdrop-blur-sm p-3 sm:p-4 md:p-6 lg:p-8 font-mono text-xs sm:text-sm md:text-base rounded-b-2xl border-t overflow-y-auto overflow-x-auto relative shadow-inner scrollbar-hide"
          style={{ 
            maxHeight: "70vh",
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            color: '#f8fafc',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(239, 68, 68, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(239, 68, 68, 0.03) 0%, transparent 50%)'
          }}
          onClick={() => {
            if (isInteractive && inputRef.current) {
              inputRef.current.focus()
            }
          }}
        >
          {/* Particle canvas - only in terminal body */}
          <canvas
            ref={particleCanvasRef}
            className="absolute inset-0 w-full h-full rounded-2xl pointer-events-none z-0"
            style={{ 
              width: '100%', 
              height: '100%',
              opacity: showParticles ? 0.4 : 0
            }}
          />

          {/* Matrix canvas - only in terminal body */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full rounded-2xl z-0"
            style={{ 
              width: '100%', 
              height: '100%',
              opacity: showMatrix ? 0.5 : 0
            }}
          />

          {/* Terminal content with enhanced styling */}
          <div className="space-y-1 relative z-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {formatText(displayedText)}
            </motion.div>
            
            {/* XRP Chart Display */}
            {showXrpChart && xrpData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-4 flex justify-center"
              >
                <div className="p-2 sm:p-4 bg-gradient-to-r from-gray-800/60 to-gray-900/60 border border-gray-700/40 rounded-lg backdrop-blur-sm shadow-lg max-w-full w-full sm:w-auto">
                  <XrpChart data={xrpData.history} price={xrpData.price} change24h={xrpData.change24h} width={Math.min(450, typeof window !== 'undefined' ? window.innerWidth - 48 : 300)} height={120} />
                </div>
              </motion.div>
            )}
            
            {/* Interactive input line with enhanced effects */}
            {isInteractive && (
              <div className="flex items-center">
                <span style={{ color: '#ef4444', fontWeight: '700', marginRight: '0.5rem' }}>$ </span>
                <div className="flex-1 flex items-center relative">
                  <span className="font-mono" style={{ color: '#f8fafc' }}>{userInput}</span>
                  <motion.span 
                    className="inline-block w-3 h-5 ml-1 rounded-sm shadow-lg"
                    style={{ 
                      backgroundColor: '#ef4444',
                      boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.5)'
                    }}
                    animate={{
                      opacity: cursorVisible ? 1 : 0,
                      scale: isTyping ? [1, 1.2, 1] : 1,
                      boxShadow: cursorVisible ? 
                        (isTyping ? 
                          ["0 0 8px #ef4444, 0 0 15px #ef4444", "0 0 15px #ef4444, 0 0 25px #ef4444, 0 0 35px #ef4444", "0 0 8px #ef4444, 0 0 15px #ef4444"] :
                          "0 0 8px #ef4444, 0 0 15px #ef4444, 0 0 20px #ef4444"
                        ) : 
                        "0 0 0px #ef4444"
                    }}
                    transition={{ 
                      opacity: { duration: 0.1 },
                      scale: { duration: 0.3 },
                      boxShadow: { duration: 0.3 }
                    }}
                  />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPress}
                  className="absolute inset-0 bg-transparent text-transparent font-mono outline-none border-none caret-transparent"
                  style={{ fontSize: '16px' }}
                  placeholder=""
                  autoFocus
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>
            )}
            
            {/* Fixed cursor for demo mode with enhanced effects */}
            {!isInteractive && (
              <div className="flex items-center">
                <motion.span 
                  className="inline-block w-3 h-5 ml-1 rounded-sm shadow-lg"
                  style={{ 
                    backgroundColor: '#ef4444',
                    boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.5)'
                  }}
                  animate={{
                    opacity: cursorVisible ? 1 : 0,
                    scale: isTyping ? [1, 1.2, 1] : 1,
                    boxShadow: cursorVisible ? 
                      (isTyping ? 
                        ["0 0 8px #ef4444, 0 0 15px #ef4444", "0 0 15px #ef4444, 0 0 25px #ef4444, 0 0 35px #ef4444", "0 0 8px #ef4444, 0 0 15px #ef4444"] :
                        "0 0 8px #ef4444, 0 0 15px #ef4444, 0 0 20px #ef4444"
                      ) : 
                      "0 0 0px #ef4444"
                  }}
                  transition={{ 
                    opacity: { duration: 0.1 },
                    scale: { duration: 0.3 },
                    boxShadow: { duration: 0.3 }
                  }}
                />
              </div>
            )}
          </div>
        </motion.div>

        {/* Enhanced terminal footer with depth */}
        <div className="px-3 py-1 sm:px-4 sm:py-2 md:px-6 md:py-2 bg-gradient-to-r from-black/90 via-gray-900/80 to-black/90 border-t border-white/20 rounded-b-2xl text-xs font-mono relative overflow-hidden backdrop-blur-sm">
          {/* Footer background pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/3 via-transparent to-white/3 opacity-50"></div>
          
          <div className="flex flex-wrap justify-between items-center gap-2 sm:gap-4 relative z-10" style={{ color: '#64748b' }}>
            {/* Enhanced mode toggle button with Glass UI */}
            <div
              className="flex items-center gap-3 px-3 py-1.5 rounded-md bg-white/10 border border-white/20 backdrop-blur-md hover:bg-white/15 transition-all duration-300 cursor-pointer group shadow-lg"
              style={{ 
                boxShadow: `
                  0 4px 12px rgba(0, 0, 0, 0.3),
                  0 2px 4px rgba(0, 0, 0, 0.2),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                `,
                backdropFilter: 'blur(16px) saturate(180%)',
                WebkitBackdropFilter: 'blur(16px) saturate(180%)'
              }}
              onClick={handleModeSwitch}
            >
              {isInteractive ? (
                <InteractiveIcon isActive={true} />
              ) : (
                <DemoIcon isActive={true} />
              )}
              <div className="flex flex-col">
                <span 
                  className="font-bold text-xs uppercase tracking-wider"
                  style={{ 
                    color: isInteractive ? '#22c55e' : '#ef4444',
                    textShadow: `0 0 8px ${isInteractive ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'}`,
                    filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))'
                  }}
                >
                  {isInteractive ? 'INTERACTIVE' : 'DEMO'}
                </span>
                <span 
                  className="text-[10px] opacity-80 group-hover:opacity-100 transition-opacity"
                  style={{ 
                    color: '#e2e8f0',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  {isInteractive ? 'Click to switch to demo mode' : 'Click to try interactive mode'}
                </span>
              </div>
              <motion.div
                className="ml-1"
                animate={{ 
                  x: [0, 2, 0],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <svg 
                  width="12" 
                  height="12" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  style={{ 
                    color: '#e2e8f0',
                    filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))'
                  }}
                >
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </motion.div>
            </div>
            
            <div className="flex items-center gap-4 text-xs">
              <span>CPU: {cpuUsage.toFixed(1)}%</span>
              <span>MEM: {memoryUsage.toFixed(1)}%</span>
              <span>Load: {systemLoad.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced CSS for animations */}
      <style jsx>{`
        @keyframes scanlines {
          0% { transform: translateY(0); }
          100% { transform: translateY(3px); }
        }
        
        @keyframes glow {
          from { box-shadow: 0 0 8px #ef4444, 0 0 15px #ef4444, 0 0 20px #ef4444; }
          to { box-shadow: 0 0 15px #ef4444, 0 0 25px #ef4444, 0 0 35px #ef4444; }
        }
        
        .terminal-line {
          text-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
          transition: text-shadow 0.3s ease;
        }
        
        .terminal-container:hover .terminal-line {
          text-shadow: 0 0 12px rgba(239, 68, 68, 0.6);
        }

        /* Hide scrollbar for Chrome, Safari and Opera */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        /* Hide scrollbar for IE, Edge and Firefox */
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </motion.div>
  )
}
