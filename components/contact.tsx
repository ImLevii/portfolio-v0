"use client"

import type React from "react"

import { useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { Mail, Phone, MapPin, Send, Github, CheckCircle, X } from "lucide-react"

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
            className="lg:col-span-2"
          >
            <form onSubmit={handleSubmit} className="card p-8">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="subject" className="block text-sm font-medium mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md transition-all duration-300 font-medium flex items-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Message'}
                <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
