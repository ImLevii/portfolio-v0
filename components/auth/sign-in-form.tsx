"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export function SignInForm() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                setError("Invalid email or password")
            } else {
                router.push("/")
                router.refresh()
            }
        } catch (err) {
            setError("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className="w-full max-w-sm mx-auto p-8 bg-gradient-to-b from-gray-900/80 to-black/90 backdrop-blur-xl rounded-2xl border border-gray-800/50 shadow-2xl"
            style={{
                boxShadow: '0 0 40px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
            }}
        >
            <h2
                className="text-3xl font-bold text-center mb-8 font-orbitron tracking-wider"
                style={{
                    color: '#ffffff',
                    textShadow: '0 0 20px rgba(255,255,255,0.1)'
                }}
            >
                SIGN IN
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-400 text-xs uppercase tracking-widest font-orbitron">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        required
                        className="bg-black/40 border-gray-800 focus:border-green-500/50 focus:ring-green-500/20 transition-all h-11"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-400 text-xs uppercase tracking-widest font-orbitron">Password</Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="bg-black/40 border-gray-800 focus:border-green-500/50 focus:ring-green-500/20 transition-all h-11"
                    />
                </div>

                {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-gray-800/60 to-gray-900/60 border border-gray-700/40 backdrop-blur-sm hover:bg-gray-800/80 transition-all duration-300 shadow-lg group h-12 mt-2"
                    style={{
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.3)'
                    }}
                >
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600 font-orbitron tracking-wider text-sm font-bold group-hover:from-green-300 group-hover:to-emerald-500">
                        {loading ? "SIGNING IN..." : "SIGN IN"}
                    </span>
                </Button>
            </form>


        </div>
    )
}
