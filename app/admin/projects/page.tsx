import { getAllProjects, getProjectsSection } from "@/lib/projects"
import { ProjectsManager } from "@/components/admin/projects-manager"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { FolderKanban } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ProjectsAdminPage() {
    const section = await getProjectsSection()

    let projects: Awaited<ReturnType<typeof getAllProjects>> = []
    let loadError: string | null = null
    try {
        projects = await getAllProjects()
    } catch (error) {
        console.error("Failed to load projects:", error)
        loadError =
            (error as { code?: string })?.code === "P2021"
                ? "The Project table doesn't exist yet. Run `npx prisma migrate deploy` to create it."
                : "Could not load projects from the database."
    }

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Projects"
                description={<>Control the &quot;My Projects&quot; section on the homepage.</>}
                icon={FolderKanban}
            />

            {loadError ? (
                <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-5 text-red-300">{loadError}</div>
            ) : (
                <ProjectsManager projects={projects} section={section} />
            )}
        </div>
    )
}
