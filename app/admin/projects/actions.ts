"use server"

import { z } from "zod"
import { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { DEFAULT_PROJECTS, PROJECTS_SECTION_KEY } from "@/lib/projects"

export type ActionResult = { success: true } | { success: false; error: string }

async function isAdmin() {
    const session = await auth()
    const role = (session?.user as { role?: string } | undefined)?.role
    // Matches the check in app/admin/layout.tsx
    return role === "ADMIN" || role === "Admin"
}

function revalidate() {
    revalidatePath("/")
    revalidatePath("/admin/projects")
}

function toError(error: unknown, fallback: string): ActionResult {
    if (error instanceof z.ZodError) {
        return { success: false, error: error.issues[0]?.message ?? "Invalid input" }
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") return { success: false, error: "Project not found" }
        if (error.code === "P2021") {
            return { success: false, error: "Projects table is missing. Run `npx prisma migrate deploy`." }
        }
    }
    console.error(fallback, error)
    return { success: false, error: fallback }
}

// ---------- Validation ----------

const isHttpUrl = (value: string) => {
    try {
        const url = new URL(value)
        return url.protocol === "http:" || url.protocol === "https:"
    } catch {
        return false
    }
}

const optionalLink = (label: string) =>
    z
        .string()
        .trim()
        .max(2048, `${label} is too long`)
        .refine((v) => v === "" || isHttpUrl(v), `${label} must start with http:// or https://`)
        .transform((v) => v || null)

const imageSrc = z
    .string()
    .trim()
    .max(2048, "Image URL is too long")
    .refine(
        (v) => v === "" || /^\/(?![/\\])/.test(v) || (isHttpUrl(v) && v.toLowerCase().startsWith("https://")),
        "Image must be a site path (e.g. /images/project.png) or an https:// URL"
    )
    .transform((v) => v || null)

const tagList = z
    .string()
    .max(1000)
    .transform((v) => Array.from(new Set(v.split(",").map((t) => t.trim()).filter(Boolean))))
    .pipe(z.array(z.string().max(40, "Each tag must be 40 characters or fewer")).max(20, "Use 20 tags or fewer"))

const projectSchema = z.object({
    title: z.string().trim().min(1, "Title is required").max(100, "Title is too long"),
    description: z.string().trim().min(1, "Description is required").max(1000, "Description is too long"),
    image: imageSrc,
    customText: z.string().trim().max(60, "Overlay text is too long").transform((v) => v || null),
    tags: tagList,
    liveUrl: optionalLink("Live URL"),
    githubUrl: optionalLink("Source URL"),
    showStatus: z.boolean(),
    isActive: z.boolean(),
})

export type ProjectInput = z.input<typeof projectSchema>

const sectionSchema = z
    .object({
        heading: z.string().trim().max(40, "Heading is too long"),
        highlight: z.string().trim().max(40, "Highlighted text is too long"),
        description: z.string().trim().max(300, "Description is too long"),
    })
    .refine((v) => v.heading || v.highlight, "Enter a heading or highlighted text")

export type ProjectsSectionInput = z.input<typeof sectionSchema>

// ---------- Projects ----------

export async function createProject(input: ProjectInput): Promise<ActionResult> {
    if (!(await isAdmin())) return { success: false, error: "Unauthorized" }
    try {
        const data = projectSchema.parse(input)
        const last = await db.project.aggregate({ _max: { order: true } })
        await db.project.create({ data: { ...data, order: (last._max.order ?? -1) + 1 } })
        revalidate()
        return { success: true }
    } catch (error) {
        return toError(error, "Failed to create project")
    }
}

export async function updateProject(id: string, input: ProjectInput): Promise<ActionResult> {
    if (!(await isAdmin())) return { success: false, error: "Unauthorized" }
    try {
        const data = projectSchema.parse(input)
        await db.project.update({ where: { id }, data })
        revalidate()
        return { success: true }
    } catch (error) {
        return toError(error, "Failed to update project")
    }
}

export async function setProjectActive(id: string, isActive: boolean): Promise<ActionResult> {
    if (!(await isAdmin())) return { success: false, error: "Unauthorized" }
    try {
        await db.project.update({ where: { id }, data: { isActive: Boolean(isActive) } })
        revalidate()
        return { success: true }
    } catch (error) {
        return toError(error, "Failed to update visibility")
    }
}

/** Copy a project to the end of the list. The copy starts hidden so it can be edited before going public. */
export async function duplicateProject(id: string): Promise<ActionResult> {
    if (!(await isAdmin())) return { success: false, error: "Unauthorized" }
    try {
        const source = await db.project.findUnique({ where: { id } })
        if (!source) return { success: false, error: "Project not found" }
        const last = await db.project.aggregate({ _max: { order: true } })
        await db.project.create({
            data: {
                title: `${source.title} (copy)`.slice(0, 100),
                description: source.description,
                image: source.image,
                customText: source.customText,
                tags: source.tags,
                liveUrl: source.liveUrl,
                githubUrl: source.githubUrl,
                showStatus: source.showStatus,
                isActive: false,
                order: (last._max.order ?? -1) + 1,
            },
        })
        revalidate()
        return { success: true }
    } catch (error) {
        return toError(error, "Failed to duplicate project")
    }
}

export async function deleteProject(id: string): Promise<ActionResult> {
    if (!(await isAdmin())) return { success: false, error: "Unauthorized" }
    try {
        await db.project.delete({ where: { id } })
        revalidate()
        return { success: true }
    } catch (error) {
        return toError(error, "Failed to delete project")
    }
}

/** Swap a project with its neighbour, then renumber everything 0..n-1 so orders stay unique. */
export async function moveProject(id: string, direction: "up" | "down"): Promise<ActionResult> {
    if (!(await isAdmin())) return { success: false, error: "Unauthorized" }
    try {
        const all = await db.project.findMany({
            orderBy: [{ order: "asc" }, { createdAt: "asc" }],
            select: { id: true },
        })
        const index = all.findIndex((p) => p.id === id)
        if (index === -1) return { success: false, error: "Project not found" }

        const target = direction === "up" ? index - 1 : index + 1
        if (target < 0 || target >= all.length) return { success: true }
        ;[all[index], all[target]] = [all[target], all[index]]

        await db.$transaction(all.map((p, order) => db.project.update({ where: { id: p.id }, data: { order } })))
        revalidate()
        return { success: true }
    } catch (error) {
        return toError(error, "Failed to reorder projects")
    }
}

export async function restoreDefaultProjects(): Promise<ActionResult> {
    if (!(await isAdmin())) return { success: false, error: "Unauthorized" }
    try {
        if ((await db.project.count()) > 0) {
            return { success: false, error: "Defaults can only be restored when there are no projects" }
        }
        await db.project.createMany({
            data: DEFAULT_PROJECTS.map((p, order) => ({ ...p, isActive: true, order })),
        })
        revalidate()
        return { success: true }
    } catch (error) {
        return toError(error, "Failed to restore default projects")
    }
}

// ---------- Section header ----------

export async function updateProjectsSection(input: ProjectsSectionInput): Promise<ActionResult> {
    if (!(await isAdmin())) return { success: false, error: "Unauthorized" }
    try {
        const value = JSON.stringify(sectionSchema.parse(input))
        await db.siteSettings.upsert({
            where: { key: PROJECTS_SECTION_KEY },
            update: { value },
            create: { key: PROJECTS_SECTION_KEY, value },
        })
        revalidate()
        return { success: true }
    } catch (error) {
        return toError(error, "Failed to save section settings")
    }
}
