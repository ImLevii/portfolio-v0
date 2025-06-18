"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import Image from "next/image"
import { ExternalLink, Github } from "lucide-react"

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
    title: "",
    description: "",
    image: "/placeholder-animated.svg",
    customText: "",
    tags: [],
    liveUrl: "#",
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
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-6 w-full">
                    <div className="flex gap-4 justify-end">
                      {/* <a
                        href={project.githubUrl}
                        className="w-10 h-10 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                        aria-label="View GitHub repository"
                      >
                        <Github className="h-5 w-5" />
                      </a> */}
                      <a
                        href={project.liveUrl}
                        className="w-10 h-10 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                        aria-label="View live project"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 font-orbitron">{project.title}</h3>
                <p className="text-gray-300 mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span key={tag} className="text-xs px-3 py-1 bg-red-500/10 text-red-400 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-12"
        >
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-transparent border border-white/20 hover:border-red-500/50 text-white rounded-md transition-all duration-300 font-medium hover:bg-black/30"
          >
            <Github className="h-5 w-5" />
            View More on GitHub
          </a>
        </motion.div>
      </div>
    </section>
  )
}
