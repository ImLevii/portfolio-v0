import { SignUpForm } from "@/components/auth/sign-up-form"
import Link from "next/link"

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
            <SignUpForm />
            <p className="mt-4 text-gray-400">
                Already have an account?{" "}
                <Link href="/auth/signin" className="text-green-400 hover:underline">
                    Sign In
                </Link>
            </p>
        </div>
    )
}
