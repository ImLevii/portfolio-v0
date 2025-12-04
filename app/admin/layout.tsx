import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    // @ts-ignore
    if (session?.user?.role !== "ADMIN") {
        redirect("/")
    }

    return (
        <div className="min-h-screen bg-black text-white flex font-sans selection:bg-green-500/30">
            <AdminSidebar />

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8 pt-24 min-h-screen bg-black relative overflow-hidden">
                {/* Cinematic Background */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-black to-black pointer-events-none" />
                <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

                {/* Floating Particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-emerald-500 rounded-full opacity-20 animate-float" style={{ animationDelay: '0s' }} />
                    <div className="absolute top-3/4 left-3/4 w-3 h-3 bg-emerald-500 rounded-full opacity-10 animate-float" style={{ animationDelay: '2s' }} />
                    <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-emerald-400 rounded-full opacity-30 animate-float" style={{ animationDelay: '4s' }} />
                </div>

                <div className="relative z-10">
                    {children}
                </div>
            </main>
        </div>
    )
}
