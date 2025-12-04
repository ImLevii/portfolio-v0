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
            <main className="flex-1 md:ml-64 p-8 pt-24 min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-900/10 via-black to-black">
                {children}
            </main>
        </div>
    )
}
