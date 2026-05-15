"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useInView } from "framer-motion"
import Image from "next/image"
import { ExternalLink } from "lucide-react"

const projects = [
  {
    title: "Vaded Hosting",
    description: "A comprehensive server hosting platform offering cloud infrastructure, automated deployments, and scalable hosting solutions for web applications.",
    image: "/placeholder-animated.svg",
    customText: "VADED HOSTING",
    tags: ["Node.js", "React", "Docker", "Kubernetes", "AWS", "Oracle Cloud", "Nginx", "MySQL", "Redis"],
    liveUrl: "https://vaded-hosting.com",
    githubUrl: "#",
  },
  {
    title: "Portfolio Website",
    description: "A responsive portfolio website showcasing projects and skills with a modern design.",
    image: "/placeholder-animated.svg",
    customText: "LEVIK.DEV",
    tags: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion", "Three.js", "Radix UI"],
    liveUrl: "#",
    githubUrl: "#",
  },
  {
    title: "VadedTV",
    description: "A movie and TV streaming platform offering a sleek browsing experience with curated content, search, and media playback.",
    image: "/placeholder-animated.svg",
    customText: "VADEDTV",
    tags: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Streaming", "Media"],
    liveUrl: "https://vadedtv.com",
    githubUrl: "#",
  },
  {
    title: "",
    description: "",
    image: "/placeholder-animated.svg",
    customText: "",
    tags: [],
    liveUrl: "#",
    githubUrl: "#",
  },
]

export default function Projects() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [siteStatus, setSiteStatus] = useState<Record<string, 'checking' | 'online' | 'offline'>>({})

  useEffect(() => {
    const urls = projects.map(p => p.liveUrl).filter(u => u && u !== "#")
    urls.forEach(async (url) => {
      setSiteStatus(prev => ({ ...prev, [url]: 'checking' }))
      try {
        const res = await fetch(`/api/status?url=${encodeURIComponent(url)}`)
        const data = await res.json()
        setSiteStatus(prev => ({ ...prev, [url]: data.status === 'online' ? 'online' : 'offline' }))
      } catch {
        setSiteStatus(prev => ({ ...prev, [url]: 'offline' }))
      }
    })
  }, [])

  return (
    <section id="projects" className="section-padding py-24 relative overflow-hidden">
      {/* Section ambient glow */}
      <div className="absolute -left-48 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none" aria-hidden="true" style={{ background: 'radial-gradient(ellipse, rgba(239,68,68,0.055) 0%, transparent 65%)' }} />
      <div className="container mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold font-orbitron mb-4">
            My <span className="text-red-500">Projects</span>
          </h2>
          <div className="w-20 h-1 bg-red-500 mx-auto mb-6"></div>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Explore my recent projects showcasing my skills and expertise in web development and design.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.title || `project-${index}`}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.2 * index }}
              className="card group"
            >
              <div className="relative overflow-hidden">
                <Image
                  src={project.image || "/placeholder.svg"}
                  alt={project.title}
                  width={600}
                  height={400}
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {project.customText && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <h3 className="text-2xl md:text-3xl font-bold font-orbitron text-white text-center">
                      {project.customText}
                    </h3>
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 font-orbitron">{project.title}</h3>
                <p className="text-gray-300 mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {project.tags.map((tag) => (
                    <span key={tag} className="text-xs px-3 py-1 bg-red-500/10 text-red-400 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                {project.liveUrl && project.liveUrl !== "#" && (() => {
                  const status = siteStatus[project.liveUrl] ?? 'checking'
                  const isOnline = status === 'online'
                  const isOffline = status === 'offline'
                  const dotColor = isOnline ? '#22c55e' : isOffline ? '#ef4444' : '#6b7280'
                  const statusLabel = isOnline ? 'Online' : isOffline ? 'Offline' : 'Checking...'
                  const statusColor = isOnline ? '#22c55e' : isOffline ? '#ef4444' : '#9ca3af'
                  const statusGlow = isOnline ? 'rgba(34,197,94,0.7)' : isOffline ? 'rgba(239,68,68,0.7)' : 'transparent'
                  const statusBorder = isOnline ? 'rgba(34,197,94,0.35)' : isOffline ? 'rgba(239,68,68,0.35)' : 'rgba(255,255,255,0.12)'
                  const glassStyle = {
                    backdropFilter: 'blur(16px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1)',
                  }
                  return (
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Status pill — non-interactive */}
                      <div
                        className="inline-flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md bg-white/[0.07] border font-bold"
                        style={{ ...glassStyle, borderColor: statusBorder }}
                      >
                        <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2 flex-shrink-0">
                          {isOnline && (
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: dotColor }} />
                          )}
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2" style={{ backgroundColor: dotColor }} />
                        </span>
                        <span
                          className="uppercase font-bold tracking-wider text-[9px] sm:text-xs font-orbitron"
                          style={{ color: statusColor, textShadow: isOnline || isOffline ? `0 0 8px ${statusGlow}` : 'none' }}
                        >
                          {statusLabel}
                        </span>
                      </div>

                      {/* Visit URL button */}
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md bg-white/10 border border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer font-bold"
                        style={glassStyle}
                      >
                        <ExternalLink
                          className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0"
                          style={{ color: '#ef4444', filter: 'drop-shadow(0 0 4px rgba(239,68,68,0.8))' }}
                        />
                        <span
                          className="uppercase font-bold tracking-wider text-[9px] sm:text-xs font-orbitron"
                          style={{ color: '#ef4444', textShadow: '0 0 8px rgba(239,68,68,0.8)' }}
                        >
                          Visit Site
                        </span>
                      </a>
                    </div>
                  )
                })()}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
