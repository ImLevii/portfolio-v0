"use client"

import { useRef, useMemo } from "react"
import { motion, useInView } from "framer-motion"
import Image from "next/image"

// Custom availability status component with memoization
const AvailabilityStatus = ({ status = "available" }: { status?: "available" | "busy" | "unavailable" }) => {
  const isAvailable = status === "available"
  
  return (
    <div className="flex items-center gap-2">
      <motion.div
        className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        aria-label={`Status: ${status}`}
      />
      <span className={`font-medium ${isAvailable ? 'text-green-400' : 'text-red-400'}`}>
        {status.toUpperCase()}
      </span>
    </div>
  )
}

type PersonalInfoItem = {
  label: string
  value: string
  type: 'text' | 'availability'
}

export default function About() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  // Memoize static data to prevent unnecessary re-renders
  const personalInfo = useMemo<PersonalInfoItem[]>(() => [
    { label: "Name", value: "LEVI", type: 'text' },
    { label: "Email", value: "contact@levi.dev", type: 'text' },
    { label: "Location", value: "Wisconsin, USA", type: 'text' },
    { label: "Availability", value: "available", type: 'availability' }
  ], [])

  const imageUrl = "/images/about.jpg"

  return (
    <section id="about" className="section-padding py-24">
      <div className="container mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold font-orbitron mb-4">
            About <span className="text-red-500">Me</span>
          </h2>
          <div className="w-20 h-1 bg-red-500 mx-auto" aria-hidden="true"></div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative w-full max-w-[600px] mx-auto">
              <div className="aspect-square relative rounded-lg overflow-hidden border-2 border-red-500/20">
                <Image
                  src={imageUrl}
                  alt="Levi - System Administrator & Full-Stack Developer"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                  className="object-cover"
                  priority
                  loading="eager"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" aria-hidden="true"></div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h3 className="text-2xl font-bold mb-4 font-orbitron">System Administrator & Full-Stack Developer</h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              I am a system administrator and full-stack developer with over 5 years of experience managing
              infrastructure and building robust backend systems. I combine technical expertise with strategic
              problem-solving to deliver reliable, scalable solutions.
            </p>
            <p className="text-gray-300 mb-8 leading-relaxed">
              I specialize in server administration, database management, and backend development with Node.js,
              Python, and Oracle Cloud infrastructure. My expertise includes system monitoring, security implementation,
              and backend architectures. I have frontend skills with Next.js, React and modern web technologies,
              allowing me to deliver complete end-to-end solutions.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {personalInfo.map(({ label, value, type }) => (
                <div key={label}>
                  <h4 className="font-bold text-red-500 mb-2">{label}:</h4>
                  {type === "availability" ? (
                    <AvailabilityStatus status={value as "available" | "busy" | "unavailable"} />
                  ) : (
                    <p>{value}</p>
                  )}
                </div>
              ))}
            </div>

            <a
              href="#contact"
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md transition-all duration-300 inline-block font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              aria-label="Navigate to contact section"
            >
              Contact Me
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}