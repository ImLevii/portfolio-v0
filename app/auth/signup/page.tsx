import { SignUpForm } from "@/components/auth/sign-up-form"
import Link from "next/link"
import MatrixRain from "@/components/matrix-rain"

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4 relative overflow-hidden">
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
