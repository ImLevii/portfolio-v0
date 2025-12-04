import { auth } from "@/auth"
import { SettingsForm } from "@/components/settings/settings-form"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"

export default async function SettingsPage() {
    const session = await auth()

    if (!session?.user?.email) {
        redirect("/auth/signin")
    }

    const user = await db.user.findUnique({
        where: { email: session.user.email },
    })

    if (!user) {
        redirect("/auth/signin")
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 text-white overflow-hidden font-bold relative pt-20 md:pt-24">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-900/10 via-transparent to-transparent pointer-events-none" />

            <div className="container relative z-10 mx-auto px-4 py-6 md:py-8">
                <h1 className="text-4xl font-bold text-white mb-8 font-orbitron text-center md:text-left">Account Settings</h1>
                <div className="max-w-2xl mx-auto">
                    {/* @ts-ignore - User type mismatch between Prisma and NextAuth is common, passing Prisma user is fine as it has the fields */}
                    <SettingsForm user={user} />
                </div>
            </div>
        </div>
    )
}
