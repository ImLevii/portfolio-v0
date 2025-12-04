import { SignInForm } from "@/components/auth/sign-in-form"
import Link from "next/link"

export default function SignInPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
            <SignInForm />
            <p className="mt-4 text-gray-400">
                Don't have an account?{" "}
                <Link href="/auth/signup" className="text-green-400 hover:underline">
                    Sign Up
                </Link>
            </p>
        </div>
    )
}
