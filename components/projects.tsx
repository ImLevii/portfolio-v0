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
    customText: "LEVI.DEV",
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
        await fetch(url, { mode: 'no-cors', signal: AbortSignal.timeout(6000) })
        setSiteStatus(prev => ({ ...prev, [url]: 'online' }))
      } catch {
        setSiteStatus(prev => ({ ...prev, [url]: 'offline' }))
      }
    })
  }, [])

  return (
    <section id="projects" className="section-padding py-24">
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
                  const labelColor = isOnline ? '#22c55e' : isOffline ? '#ef4444' : '#ef4444'
                  const glowColor = isOnline ? 'rgba(34,197,94,0.8)' : isOffline ? 'rgba(239,68,68,0.8)' : 'rgba(239,68,68,0.8)'
                  return (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-gradient-to-r from-gray-800/60 to-gray-900/60 border border-gray-700/40 backdrop-blur-sm hover:bg-gray-800/80 transition-all duration-300 cursor-pointer font-bold text-white relative shadow-lg"
                      style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.3)' }}
                    >
                      {/* Status dot */}
                      <span className="relative flex h-2 w-2">
                        {isOnline && (
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: dotColor }} />
                        )}
                        <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: dotColor }} />
                      </span>
                      <ExternalLink className="h-3.5 w-3.5" style={{ color: labelColor, filter: `drop-shadow(0 0 4px ${glowColor})` }} />
                      <span
                        className="uppercase font-bold tracking-wider text-[10px] sm:text-xs font-orbitron"
                        style={{ color: labelColor, textShadow: `0 0 8px ${glowColor}` }}
                      >
                        {status === 'checking' ? 'Checking...' : isOnline ? 'Online' : 'Offline'}
                      </span>
                    </a>
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
