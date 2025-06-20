"use client"

import type React from "react"

import { useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { Mail, Phone, MapPin, Send, Github, CheckCircle, X } from "lucide-react"
import { DemoIcon } from "./ui/terminal-icons"

// AnimatedSendIcon: a green paper airplane with glow and entrance animation (for button only)
const AnimatedSendIcon = ({ size = 22, color = "#22c55e" }: { size?: number, color?: string }) => (
  <motion.svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.7, delay: 0.1 }}
    style={{ display: 'block' }}
  >
    {/* Glow */}
    <circle
      cx="12" cy="12" r="11"
      fill="url(#send-glow)"
      opacity={0.4}
      style={{ filter: 'blur(2.5px)' }}
    />
    <defs>
      <radialGradient id="send-glow" cx="0.5" cy="0.5" r="0.5" fx="0.5" fy="0.5">
        <stop offset="0%" stopColor={color} stopOpacity="0.7" />
        <stop offset="100%" stopColor={color} stopOpacity="0" />
      </radialGradient>
    </defs>
    {/* Paper airplane path (Lucide Send) */}
    <path
      d="M22 2L11 13"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 2L15 22L11 13L2 9L22 2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </motion.svg>
)

// Animated background behind the form
const AnimatedFormBg = () => (
  <div className="absolute inset-0 z-0 pointer-events-none">
    <div className="w-full h-full bg-gradient-to-br from-red-900/10 via-black/40 to-red-700/10 animate-gradient-x rounded-2xl blur-sm" />
    <div className="absolute inset-0 bg-circuit-pattern opacity-10" />
  </div>
)

export default function Contact() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<null | { type: 'success' | 'error', message: string }>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.success) {
        setStatus({ type: 'success', message: 'Message sent successfully!' })
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        })
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to send message.' })
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'An error occurred. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" className="section-padding py-24 bg-black/50">
      <div className="container mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold font-orbitron mb-4">
            Get In <span className="text-red-500">Touch</span>
          </h2>
          <div className="w-20 h-1 bg-red-500 mx-auto mb-6"></div>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Have a project in mind or want to collaborate? Feel free to reach out to me using the contact form below.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="space-y-8">
              <div className="card p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Email</h3>
                  <p className="text-gray-300">contact@levik.dev</p>
                </div>
              </div>

              {/* <div className="card p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Discord</h3>
                  <p className="text-gray-300">nulled_xrp</p>
                </div>
              </div> */}

              <div className="card p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Location</h3>
                  <p className="text-gray-300">Wisconsin</p>
                  <p className="text-gray-300">United States</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="col-span-3 lg:col-span-2 relative"
          >
            <AnimatedFormBg />
            <form onSubmit={handleSubmit} className="card p-8 relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 focus-within:border-[#ff3b3b] hover:border-[#ff3b3b]">
              {/* Animated border glow */}
              <div className="absolute inset-0 rounded-2xl pointer-events-none border-2 border-[#ff3b3b]/30 opacity-0 focus-within:opacity-100 transition-all duration-500 blur-sm animate-pulse-slow" />
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ff3b3b]/80 h-5 w-5 pointer-events-none" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-black/30 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff3b3b] focus:border-transparent transition-colors peer placeholder-transparent"
                    placeholder="Your Name"
                  />
                  <label htmlFor="name" className="absolute left-10 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400 pointer-events-none transition-all duration-200 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-[#ff3b3b] peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 bg-black/60 px-1 rounded">
                    Your Name
                  </label>
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ff3b3b]/80 h-5 w-5 pointer-events-none" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-black/30 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff3b3b] focus:border-transparent transition-colors peer placeholder-transparent"
                    placeholder="Your Email"
                  />
                  <label htmlFor="email" className="absolute left-10 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400 pointer-events-none transition-all duration-200 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-[#ff3b3b] peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 bg-black/60 px-1 rounded">
                    Your Email
                  </label>
                </div>
              </div>
              <div className="mb-6 relative">
                <Send className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ff3b3b]/80 h-5 w-5 pointer-events-none" />
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-black/30 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff3b3b] focus:border-transparent transition-colors peer placeholder-transparent"
                  placeholder="Subject"
                />
                <label htmlFor="subject" className="absolute left-10 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400 pointer-events-none transition-all duration-200 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-[#ff3b3b] peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 bg-black/60 px-1 rounded">
                  Subject
                </label>
              </div>
              <div className="mb-6 relative">
                <Mail className="absolute left-3 top-4 text-[#ff3b3b]/80 h-5 w-5 pointer-events-none" />
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full pl-10 pr-4 py-3 bg-black/30 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff3b3b] focus:border-transparent transition-colors resize-none peer placeholder-transparent"
                  placeholder="Message"
                ></textarea>
                <label htmlFor="message" className="absolute left-10 top-4 text-sm font-medium text-gray-400 pointer-events-none transition-all duration-200 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-[#ff3b3b] peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 bg-black/60 px-1 rounded">
                  Message
                </label>
              </div>
              <button
                type="submit"
                className="flex items-center gap-3 px-3 py-1.5 rounded-md bg-gradient-to-r from-gray-800/60 to-gray-900/60 border border-gray-700/40 backdrop-blur-sm hover:bg-gray-800/80 transition-all duration-300 cursor-pointer group font-bold text-base text-white relative shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.3)'
                }}
                disabled={loading}
              >
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className="flex items-center"
                >
                  <AnimatedSendIcon size={22} color="#22c55e" />
                </motion.span>
                <span className="relative z-10 uppercase font-bold tracking-wider text-[10px] sm:text-xs font-orbitron"
                  style={{
                    color: '#22c55e',
                    textShadow: '0 0 8px rgba(34,197,94,0.8)',
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                  }}
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </span>
              </button>
              {status && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`mt-4 text-sm relative ${status.type === 'success' ? 'bg-green-900/80 border border-green-500 text-green-200' : 'bg-red-900/80 border border-red-500 text-red-200'} rounded-md px-4 py-3 flex items-center gap-2 shadow-lg`}
                  role="alert"
                >
                  {status.type === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  ) : (
                    <X className="h-5 w-5 text-red-400 flex-shrink-0" />
                  )}
                  <span>{status.message}</span>
                  <button
                    type="button"
                    onClick={() => setStatus(null)}
                    className="absolute top-2 right-2 text-white/60 hover:text-white/90 rounded-full p-1 focus:outline-none"
                    aria-label="Dismiss message"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              )}
            </form>
          </motion.div>
        </div>
      </div>

      <footer className="mt-24 border-t border-white/10 pt-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-400">© {new Date().getFullYear()} LEVIK.DEV All rights reserved.</p>
            </div>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-red-600 hover:border-red-600 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-red-600 hover:border-red-600 transition-colors"
                aria-label="Twitter"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-red-600 hover:border-red-600 transition-colors"
                aria-label="LinkedIn"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </section>
  )
}
