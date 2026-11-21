import { db } from "@/lib/db"

// Server-side data access for the "My Projects" section.
// Client components must only use `import type` from this file.

export const PROJECTS_SECTION_KEY = "projects-section"

export interface ProjectsSection {
    heading: string // Plain part of the title, e.g. "My"
    highlight: string // Red accent part of the title, e.g. "Projects"
    description: string
}

export interface PublicProject {
    id: string
    title: string
    description: string
    image: string | null
    customText: string | null
    tags: string[]
    liveUrl: string | null
    githubUrl: string | null
    showStatus: boolean
}

export const DEFAULT_PROJECTS_SECTION: ProjectsSection = {
    heading: "My",
    highlight: "Projects",
    description: "Explore my recent projects showcasing my skills and expertise in web development and design.",
}

// Used as a fallback when the database is unreachable and by "Restore Defaults" in the admin panel.
// Keep in sync with the seed in prisma/migrations/20261120000000_add_projects.
export const DEFAULT_PROJECTS: Omit<PublicProject, "id">[] = [
    {
        title: "Vaded Hosting",
        description: "A comprehensive server hosting platform offering cloud infrastructure, automated deployments, and scalable hosting solutions for web applications.",
        image: "/placeholder-animated.svg",
        customText: "VADED HOSTING",
        tags: ["Node.js", "React", "Docker", "Kubernetes", "AWS", "Oracle Cloud", "Nginx", "MySQL", "Redis"],
        liveUrl: "https://vaded-hosting.com",
        githubUrl: null,
        showStatus: true,
    },
    {
        title: "Portfolio Website",
        description: "A responsive portfolio website showcasing projects and skills with a modern design.",
        image: "/placeholder-animated.svg",
        customText: "LEVIK.DEV",
        tags: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion", "Three.js", "Radix UI"],
        liveUrl: null,
        githubUrl: null,
        showStatus: true,
    },
    {
        title: "VadedTV",
        description: "A movie and TV streaming platform offering a sleek browsing experience with curated content, search, and media playback.",
        image: "/placeholder-animated.svg",
        customText: "VADEDTV",
        tags: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Streaming", "Media"],
        liveUrl: "https://vadedtv.com",
        githubUrl: null,
        showStatus: true,
    },
]

/** Visible projects for the public homepage. Falls back to defaults if the DB is unavailable. */
export async function getVisibleProjects(): Promise<PublicProject[]> {
    try {
        const rows = await db.project.findMany({
            where: { isActive: true },
            orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        })
        return rows.map((p) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            image: p.image,
            customText: p.customText,
            tags: p.tags,
            liveUrl: p.liveUrl,
            githubUrl: p.githubUrl,
            showStatus: p.showStatus,
        }))
    } catch (error) {
        console.error("Failed to load projects, using defaults:", error instanceof Error ? error.message : error)
        return DEFAULT_PROJECTS.map((p, i) => ({ ...p, id: `default-${i}` }))
    }
}

/** All projects (including hidden) for the admin panel. Throws on DB errors. */
export async function getAllProjects() {
    return db.project.findMany({
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    })
}

export async function getProjectsSection(): Promise<ProjectsSection> {
    try {
        const row = await db.siteSettings.findUnique({ where: { key: PROJECTS_SECTION_KEY } })
        if (!row) return DEFAULT_PROJECTS_SECTION
        return { ...DEFAULT_PROJECTS_SECTION, ...JSON.parse(row.value) }
    } catch (error) {
        console.error("Failed to load projects section settings:", error instanceof Error ? error.message : error)
        return DEFAULT_PROJECTS_SECTION
    }
}
