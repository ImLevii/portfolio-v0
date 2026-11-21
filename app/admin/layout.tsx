import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { AdminShell } from "@/components/admin/admin-shell"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    const role = (session?.user as { role?: string } | undefined)?.role

    if (role !== "ADMIN" && role !== "Admin") {
        redirect("/")
    }

    return <AdminShell user={session?.user}>{children}</AdminShell>
}
