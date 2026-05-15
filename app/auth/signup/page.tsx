import { SignUpForm } from "@/components/auth/sign-up-form"
import Link from "next/link"
import MatrixRain from "@/components/matrix-rain"

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4 relative overflow-hidden">
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
            {/* Dot grid */}
            <div
                className="fixed inset-0 pointer-events-none z-0"
                aria-hidden="true"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }}
            />
            {/* Ambient glow – top-left red */}
            <div
                className="fixed -top-40 -left-40 w-[800px] h-[700px] rounded-full pointer-events-none z-0"
                aria-hidden="true"
                style={{ background: 'radial-gradient(ellipse, rgba(220,38,38,0.14) 0%, transparent 65%)' }}
            />
            {/* Ambient glow – center-right blue accent */}
            <div
                className="fixed top-1/2 -right-56 w-[600px] h-[600px] rounded-full pointer-events-none z-0 -translate-y-1/2"
                aria-hidden="true"
                style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.055) 0%, transparent 70%)' }}
            />
            {/* Ambient glow – bottom-center warm red */}
            <div
                className="fixed -bottom-48 left-1/2 w-[800px] h-[500px] rounded-full pointer-events-none z-0 -translate-x-1/2"
                aria-hidden="true"
                style={{ background: 'radial-gradient(ellipse, rgba(239,68,68,0.1) 0%, transparent 70%)' }}
            />
            <MatrixRain color="#22c55e" />
            <div className="relative z-10 w-full max-w-md flex flex-col items-center">
                <SignUpForm />
                <p className="mt-6 text-gray-400 font-orbitron text-sm tracking-wide bg-black/60 px-4 py-2 rounded-full border border-gray-800/50 backdrop-blur-md">
                    Already have an account?{" "}
                    <Link href="/auth/signin" className="text-green-400 hover:text-green-300 hover:underline transition-colors font-bold">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    )
}
