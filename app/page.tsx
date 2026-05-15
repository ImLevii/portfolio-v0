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
    <main className="min-h-screen bg-black text-white overflow-hidden font-bold relative">
      {/* === GLOBAL CANVAS LAYERS (fixed = parallax depth as you scroll) === */}

      {/* Noise / grain texture */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
          opacity: 0.03,
          mixBlendMode: 'overlay',
        }}
      />

      {/* Subtle dot grid */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        aria-hidden="true"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Ambient glow 1 – top-left red bloom (hero anchor) */}
      <div
        className="fixed -top-40 -left-40 w-[900px] h-[700px] pointer-events-none z-0 rounded-full"
        aria-hidden="true"
        style={{ background: 'radial-gradient(ellipse, rgba(220,38,38,0.15) 0%, transparent 65%)' }}
      />

      {/* Ambient glow 2 – center-right cool accent (depth) */}
      <div
        className="fixed top-1/2 -right-56 w-[700px] h-[700px] pointer-events-none z-0 rounded-full -translate-y-1/2"
        aria-hidden="true"
        style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.055) 0%, transparent 70%)' }}
      />

      {/* Ambient glow 3 – bottom-center warm red */}
      <div
        className="fixed -bottom-56 left-1/2 w-[900px] h-[600px] pointer-events-none z-0 rounded-full -translate-x-1/2"
        aria-hidden="true"
        style={{ background: 'radial-gradient(ellipse, rgba(239,68,68,0.1) 0%, transparent 70%)' }}
      />

      {/* Content */}
      <div className="relative z-10">
        <Hero geo={geo || undefined} />
        <div className="section-divider mx-8 md:mx-16" aria-hidden="true" />
        <About />
        <div className="section-divider mx-8 md:mx-16" aria-hidden="true" />
        <Skills />
        <div className="section-divider mx-8 md:mx-16" aria-hidden="true" />
        <Projects />
        <div className="section-divider mx-8 md:mx-16" aria-hidden="true" />
        <Contact />
      </div>

      {/* Debug component - only visible in development */}
      <DebugMatrixWrapper />
    </main>
  )
}
