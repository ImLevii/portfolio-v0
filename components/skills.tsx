"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import Image from "next/image"

const techStack = [
  {
    name: "React",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg"
  },
  {
    name: "Next.js",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg"
  },
  {
    name: "TypeScript",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg"
  },
  {
    name: "JavaScript",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg"
  },
  {
    name: "Node.js",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg"
  },
  {
    name: "Tailwind CSS",
    logo: "https://www.vectorlogo.zone/logos/tailwindcss/tailwindcss-icon.svg"
  },
  {
    name: "HTML5",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg"
  },
  {
    name: "CSS3",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg"
  },
  {
    name: "Git",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg"
  },
  {
    name: "Three.js",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/threejs/threejs-original.svg"
  },
  {
    name: "MongoDB",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg"
  },
  {
    name: "PostgreSQL",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg"
  },
  {
    name: "GraphQL",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg"
  },
  {
    name: "Framer Motion",
    logo: "https://cdn.worldvectorlogo.com/logos/framer-1.svg"
  },
  {
    name: "WebGL",
    logo: "https://www.khronos.org/assets/images/logo/khronos-group-logo.svg"
  }
]

export default function Skills() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="skills" className="section-padding py-24 relative overflow-hidden">
      <div className="container mx-auto relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          {/* My Skills Text*/}
          <h2 className="text-3xl md:text-4xl font-bold font-orbitron mb-4">
            My <span className="text-red-500">Tech Stack</span>
          </h2>
          <div className="w-20 h-1 bg-red-500 mx-auto mb-6"></div>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed">
            A comprehensive collection of modern technologies and tools I use to build cutting-edge web applications. 
            From frontend frameworks to backend solutions, each technology is carefully chosen for performance, 
            scalability, and developer experience.
          </p>
        </motion.div>

        {/* Tech Stack Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16"
        >
          {/* Enhanced carousel container with sophisticated backdrop */}
          <div className="relative mx-2 sm:mx-4 md:mx-8">
            {/* Carousel backdrop with multiple layers */}
            <div className="absolute inset-0 rounded-2xl carousel-backdrop">
              {/* Animated SVG background */}
              <div className="absolute inset-0 opacity-20">
                <Image
                  src="/placeholder-animated.svg"
                  alt=""
                  fill
                  className="object-cover rounded-2xl"
                  style={{ objectPosition: 'center' }}
                />
              </div>
              
              <div className="carousel-glow"></div>
              <div className="carousel-scan-line"></div>
              <div className="geometric-pattern"></div>
              
              {/* Floating particles */}
              <div className="floating-particles">
                <div className="floating-particle"></div>
                <div className="floating-particle"></div>
                <div className="floating-particle"></div>
              </div>
            </div>
            
            {/* Carousel content */}
            <div className="relative overflow-hidden p-3 sm:p-4 md:p-6 lg:p-8 rounded-xl">
              <div className="flex animate-scroll-mobile md:animate-scroll">
                {/* First set of items */}
                {techStack.map((tech, index) => (
                  <div
                    key={`first-${index}`}
                    className="tech-card flex-shrink-0 mx-1.5 sm:mx-2 md:mx-3 lg:mx-4 px-2 sm:px-3 md:px-4 lg:px-6 py-2.5 sm:py-3 md:py-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:border-red-500/50 transition-all duration-300 hover:bg-white/15 flex flex-col items-center justify-center min-w-[70px] sm:min-w-[85px] md:min-w-[100px] lg:min-w-[120px] shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-red-500/20 group"
                  >
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative z-10 w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 mb-1.5 sm:mb-2 flex items-center justify-center">
                      <Image
                        src={tech.logo}
                        alt={tech.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-contain filter drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <span className="relative z-10 text-white font-medium text-[10px] sm:text-xs md:text-sm text-center group-hover:text-red-300 transition-colors duration-300 leading-tight">{tech.name}</span>
                  </div>
                ))}
                {/* Duplicate set for seamless loop */}
                {techStack.map((tech, index) => (
                  <div
                    key={`second-${index}`}
                    className="tech-card flex-shrink-0 mx-1.5 sm:mx-2 md:mx-3 lg:mx-4 px-2 sm:px-3 md:px-4 lg:px-6 py-2.5 sm:py-3 md:py-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:border-red-500/50 transition-all duration-300 hover:bg-white/15 flex flex-col items-center justify-center min-w-[70px] sm:min-w-[85px] md:min-w-[100px] lg:min-w-[120px] shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-red-500/20 group"
                  >
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative z-10 w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 mb-1.5 sm:mb-2 flex items-center justify-center">
                      <Image
                        src={tech.logo}
                        alt={tech.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-contain filter drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <span className="relative z-10 text-white font-medium text-[10px] sm:text-xs md:text-sm text-center group-hover:text-red-300 transition-colors duration-300 leading-tight">{tech.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
