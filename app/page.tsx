import Hero from "@/components/hero"
import About from "@/components/about"
import Projects from "@/components/projects"
import Contact from "@/components/contact"
import Skills from "@/components/skills"
import DebugMatrixWrapper from './components/debug-matrix-wrapper'

export default async function Home() {
  // Get IP address from headers (works on Vercel, fallback to demo IP)
  let ip = null
  if (typeof window === 'undefined') {
    // @ts-ignore
    ip = (globalThis.headers?.get('x-forwarded-for') || '').split(',')[0] || null
  }
  // Fallback for local dev
  if (!ip || ip === '::1' || ip === '127.0.0.1') ip = ''

  // Fetch geolocation data from ipinfo.io (or similar)
  let geo = null
  try {
    const res = await fetch(`https://ipinfo.io/${ip}?token=febca1646e0805`, { next: { revalidate: 60 } })
    if (res.ok) {
      const data = await res.json()
      geo = {
        ip: data.ip,
        city: data.city,
        region: data.region,

        
        country: data.country,
        privacy: data.privacy
      }
    }
  } catch (e) {
    geo = null
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white overflow-hidden font-bold relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-500/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-red-500/20 via-transparent to-transparent" />
      <div className="relative z-10">
        <Hero geo={geo || undefined} />
        <About />
        <Skills />
        <Projects />
        <Contact />
      </div>

      {/* Debug component - only visible in development */}
      <DebugMatrixWrapper />
    </main>
  )
}
