import { getAllProjects, getProjectsSection } from "@/lib/projects"
import { ProjectsManager } from "@/components/admin/projects-manager"

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
            <div>
                <h1 className="text-3xl font-bold font-orbitron text-white neon-text-glow">Projects</h1>
                <p className="text-gray-400 mt-1">Control the &quot;My Projects&quot; section on the homepage.</p>
            </div>

            {loadError ? (
                <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-5 text-red-300">{loadError}</div>
            ) : (
                <ProjectsManager projects={projects} section={section} />
            )}
        </div>
    )
}
