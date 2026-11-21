"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import type { Project } from "@prisma/client"
import type { ProjectsSection } from "@/lib/projects"
import {
    createProject,
    deleteProject,
    duplicateProject,
    moveProject,
    restoreDefaultProjects,
    setProjectActive,
    updateProject,
    updateProjectsSection,
    type ActionResult,
    type ProjectInput,
} from "@/app/admin/projects/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChevronDown, ChevronUp, CodeXml, Copy, ExternalLink, FolderKanban, Pencil, Plus, Trash2 } from "lucide-react"
import { showTerminalToast } from "@/components/global/terminal-toast"

const inputClass = "bg-black/50 border-gray-700"

function parseTags(text: string) {
    return Array.from(new Set(text.split(",").map((t) => t.trim()).filter(Boolean)))
}

function hostOf(url: string) {
    try {
        return new URL(url).host
    } catch {
        return url
    }
}

export function ProjectsManager({ projects, section }: { projects: Project[]; section: ProjectsSection }) {
    const router = useRouter()
    const [pending, startTransition] = useTransition()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editing, setEditing] = useState<Project | null>(null)

    const run = (action: () => Promise<ActionResult>, successMessage: string) => {
        startTransition(async () => {
            const result = await action()
            if (result.success) {
                showTerminalToast.success(successMessage)
                router.refresh()
            } else {
                showTerminalToast.error("Action failed", result.error)
            }
        })
    }

    const openEditor = (project: Project | null) => {
        setEditing(project)
        setDialogOpen(true)
    }

    const handleDelete = (project: Project) => {
        if (!confirm(`Delete "${project.title}"? This cannot be undone.`)) return
        run(() => deleteProject(project.id), "Project deleted")
    }

    const visibleCount = projects.filter((p) => p.isActive).length

    return (
        <div className="space-y-6">
            <SectionSettings section={section} />

            <div className="glass-panel p-6 rounded-2xl border border-gray-800/60 bg-black/40">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-white font-orbitron">Project Cards</h2>
                        <p className="text-sm text-gray-400">
                            {projects.length} total · {visibleCount} visible on the homepage
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {projects.length === 0 && (
                            <Button
                                variant="outline"
                                className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/30"
                                disabled={pending}
                                onClick={() => run(restoreDefaultProjects, "Default projects restored")}
                            >
                                Restore Defaults
                            </Button>
                        )}
                        <Button
                            onClick={() => openEditor(null)}
                            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all active:scale-[0.98]"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Project
                        </Button>
                    </div>
                </div>

                {projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500 border border-dashed border-gray-800 rounded-xl">
                        <FolderKanban className="h-10 w-10 mb-3" />
                        <p>No projects yet. Add one, or restore the defaults.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {projects.map((project, index) => (
                            <div
                                key={project.id}
                                className="group rounded-xl border border-gray-800/60 bg-gray-900/40 hover:bg-gray-800/60 transition-all"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="flex flex-col">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-gray-500 hover:text-emerald-400"
                                                disabled={pending || index === 0}
                                                onClick={() => run(() => moveProject(project.id, "up"), "Order updated")}
                                                aria-label={`Move ${project.title} up`}
                                            >
                                                <ChevronUp className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-gray-500 hover:text-emerald-400"
                                                disabled={pending || index === projects.length - 1}
                                                onClick={() => run(() => moveProject(project.id, "down"), "Order updated")}
                                                aria-label={`Move ${project.title} down`}
                                            >
                                                <ChevronDown className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black">
                                            <Image
                                                src={project.image || "/placeholder.svg"}
                                                alt=""
                                                fill
                                                unoptimized
                                                className="object-cover"
                                            />
                                            {project.customText && (
                                                <span className="absolute inset-0 flex items-center justify-center bg-black/30 px-1 text-center text-[9px] font-bold font-orbitron text-white leading-tight">
                                                    {project.customText}
                                                </span>
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <h3 className="font-bold text-white font-orbitron text-lg flex items-center gap-2">
                                                <span className="truncate">{project.title}</span>
                                                {!project.isActive && (
                                                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-700/60 text-gray-300">
                                                        Hidden
                                                    </span>
                                                )}
                                            </h3>
                                            <p className="text-sm text-gray-400 line-clamp-1">{project.description}</p>
                                            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                                                {project.liveUrl && (
                                                    <span className="inline-flex items-center gap-1">
                                                        <ExternalLink className="h-3 w-3" /> {hostOf(project.liveUrl)}
                                                    </span>
                                                )}
                                                {project.githubUrl && (
                                                    <span className="inline-flex items-center gap-1">
                                                        <CodeXml className="h-3 w-3" /> Source
                                                    </span>
                                                )}
                                                <span>{project.tags.length} tags</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 self-end lg:self-auto">
                                        <div className="flex items-center gap-3 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                                            <Label
                                                htmlFor={`visible-${project.id}`}
                                                className="text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                                            >
                                                Visible
                                            </Label>
                                            <Switch
                                                id={`visible-${project.id}`}
                                                checked={project.isActive}
                                                disabled={pending}
                                                onCheckedChange={(checked) =>
                                                    run(
                                                        () => setProjectActive(project.id, checked),
                                                        checked ? "Project is now visible" : "Project hidden"
                                                    )
                                                }
                                                className="data-[state=checked]:bg-emerald-500"
                                            />
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openEditor(project)}
                                                className="hover:bg-blue-500/10 hover:text-blue-400"
                                                aria-label={`Edit ${project.title}`}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                disabled={pending}
                                                onClick={() => run(() => duplicateProject(project.id), "Project duplicated (hidden until you enable it)")}
                                                className="hover:bg-purple-500/10 hover:text-purple-400"
                                                aria-label={`Duplicate ${project.title}`}
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                disabled={pending}
                                                onClick={() => handleDelete(project)}
                                                className="hover:bg-red-500/10 hover:text-red-400"
                                                aria-label={`Delete ${project.title}`}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="bg-gray-900 border-gray-800 text-white max-h-[90vh] overflow-y-auto sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>{editing ? "Edit Project" : "New Project"}</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Changes appear in the homepage&apos;s &quot;My Projects&quot; section.
                        </DialogDescription>
                    </DialogHeader>
                    <ProjectForm
                        key={editing?.id ?? "new"}
                        project={editing}
                        onSaved={() => {
                            setDialogOpen(false)
                            router.refresh()
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
}

function SectionSettings({ section }: { section: ProjectsSection }) {
    const router = useRouter()
    const [pending, startTransition] = useTransition()
    const [values, setValues] = useState(section)

    const isDirty =
        values.heading !== section.heading ||
        values.highlight !== section.highlight ||
        values.description !== section.description

    const update = (field: keyof ProjectsSection) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setValues((v) => ({ ...v, [field]: e.target.value }))

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        startTransition(async () => {
            const result = await updateProjectsSection(values)
            if (result.success) {
                showTerminalToast.success("Section updated")
                router.refresh()
            } else {
                showTerminalToast.error("Save failed", result.error)
            }
        })
    }

    return (
        <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl border border-gray-800/60 bg-black/40 space-y-5">
            <div>
                <h2 className="text-xl font-bold text-white font-orbitron">Section Header</h2>
                <p className="text-sm text-gray-400">The title and intro shown above the project cards.</p>
            </div>

            <div className="rounded-xl border border-white/5 bg-black/60 p-6 text-center">
                <h3 className="text-2xl md:text-3xl font-bold font-orbitron mb-3">
                    {values.heading} {values.highlight && <span className="text-red-500">{values.highlight}</span>}
                </h3>
                <div className="w-16 h-1 bg-red-500 mx-auto mb-3" />
                <p className="text-gray-300 max-w-2xl mx-auto text-sm">{values.description}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="section-heading">Heading</Label>
                    <Input id="section-heading" value={values.heading} onChange={update("heading")} maxLength={40} className={inputClass} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="section-highlight">Highlighted text (red)</Label>
                    <Input id="section-highlight" value={values.highlight} onChange={update("highlight")} maxLength={40} className={inputClass} />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="section-description">Description</Label>
                <Textarea
                    id="section-description"
                    value={values.description}
                    onChange={update("description")}
                    maxLength={300}
                    className={`${inputClass} min-h-[70px]`}
                />
            </div>

            <div className="flex justify-end gap-3">
                {isDirty && (
                    <Button type="button" variant="ghost" onClick={() => setValues(section)} disabled={pending}>
                        Reset
                    </Button>
                )}
                <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={pending || !isDirty}>
                    {pending ? "Saving..." : "Save Header"}
                </Button>
            </div>
        </form>
    )
}

function toFormState(project: Project | null): ProjectInput {
    return {
        title: project?.title ?? "",
        description: project?.description ?? "",
        // New projects start with the placeholder art; existing ones keep whatever they have (including none)
        image: project ? project.image ?? "" : "/placeholder-animated.svg",
        customText: project?.customText ?? "",
        tags: project?.tags.join(", ") ?? "",
        liveUrl: project?.liveUrl ?? "",
        githubUrl: project?.githubUrl ?? "",
        showStatus: project?.showStatus ?? true,
        isActive: project?.isActive ?? true,
    }
}

type TextField = "title" | "description" | "image" | "customText" | "tags" | "liveUrl" | "githubUrl"

function ProjectForm({ project, onSaved }: { project: Project | null; onSaved: () => void }) {
    const [pending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [values, setValues] = useState<ProjectInput>(() => toFormState(project))

    const set = <K extends keyof ProjectInput>(field: K, value: ProjectInput[K]) =>
        setValues((v) => ({ ...v, [field]: value }))
    const bind = (field: TextField) => ({
        value: values[field],
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(field, e.target.value),
    })

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        startTransition(async () => {
            const result = project ? await updateProject(project.id, values) : await createProject(values)
            if (result.success) {
                showTerminalToast.success(project ? "Project updated" : "Project created")
                onSaved()
            } else {
                setError(result.error)
            }
        })
    }

    const tags = parseTags(values.tags)

    return (
        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-4 min-w-0">
                <div className="space-y-2">
                    <Label htmlFor="project-title">Title</Label>
                    <Input id="project-title" {...bind("title")} required maxLength={100} className={inputClass} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="project-description">Description</Label>
                    <Textarea
                        id="project-description"
                        {...bind("description")}
                        required
                        maxLength={1000}
                        className={`${inputClass} min-h-[90px]`}
                    />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="project-image">Image</Label>
                        <Input
                            id="project-image"
                            {...bind("image")}
                            placeholder="/images/project.png or https://..."
                            className={inputClass}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="project-overlay">Overlay text</Label>
                        <Input
                            id="project-overlay"
                            {...bind("customText")}
                            placeholder="e.g. VADEDTV"
                            maxLength={60}
                            className={inputClass}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="project-tags">Tags (comma separated)</Label>
                    <Input id="project-tags" {...bind("tags")} placeholder="Next.js, React, TypeScript" className={inputClass} />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="project-live">Live URL</Label>
                        <Input
                            id="project-live"
                            type="url"
                            {...bind("liveUrl")}
                            placeholder="https://example.com"
                            className={inputClass}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="project-github">Source URL</Label>
                        <Input
                            id="project-github"
                            type="url"
                            {...bind("githubUrl")}
                            placeholder="https://github.com/..."
                            className={inputClass}
                        />
                    </div>
                </div>

                <div className="space-y-3 rounded-xl border border-white/5 bg-black/30 p-4">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <Label htmlFor="project-status">Show online status</Label>
                            <p className="text-xs text-gray-500">Checks the live URL and shows an Online/Offline badge.</p>
                        </div>
                        <Switch
                            id="project-status"
                            checked={values.showStatus}
                            onCheckedChange={(checked) => set("showStatus", checked)}
                            className="data-[state=checked]:bg-emerald-500"
                        />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <Label htmlFor="project-active">Visible on homepage</Label>
                            <p className="text-xs text-gray-500">Hidden projects are kept here but not shown publicly.</p>
                        </div>
                        <Switch
                            id="project-active"
                            checked={values.isActive}
                            onCheckedChange={(checked) => set("isActive", checked)}
                            className="data-[state=checked]:bg-emerald-500"
                        />
                    </div>
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={pending}>
                    {pending ? "Saving..." : project ? "Save Changes" : "Create Project"}
                </Button>
            </div>

            <div className="lg:sticky lg:top-0 self-start space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Live preview</p>
                <ProjectCardPreview values={values} tags={tags} />
            </div>
        </form>
    )
}

/** Only preview sources the server would accept, so half-typed values don't flash broken images. */
function previewSrc(image: string) {
    const v = image.trim()
    if (/^\/(?![/\\])/.test(v) || /^https:\/\/[^\s/]+/i.test(v)) return v
    return "/placeholder.svg"
}

/** Mirrors the card markup in components/projects.tsx. */
function ProjectCardPreview({ values, tags }: { values: ProjectInput; tags: string[] }) {
    const src = previewSrc(values.image)
    const hasLive = values.liveUrl.trim() !== ""
    const hasSource = values.githubUrl.trim() !== ""
    const pill =
        "inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 border border-white/20 text-[9px] uppercase tracking-wider font-bold font-orbitron"

    return (
        <div className={`card overflow-hidden rounded-xl border border-white/10 bg-black ${values.isActive ? "" : "opacity-60"}`}>
            <div className="relative overflow-hidden">
                {/* Plain img: admin URLs can be any https host, and next/image throws on some partially typed values */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    key={src}
                    src={src}
                    alt=""
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                        if (!e.currentTarget.src.endsWith("/placeholder.svg")) e.currentTarget.src = "/placeholder.svg"
                    }}
                />
                {values.customText.trim() && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 px-2">
                        <h3 className="text-xl font-bold font-orbitron text-white text-center">{values.customText}</h3>
                    </div>
                )}
                {!values.isActive && (
                    <span className="absolute top-2 left-2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-900/80 text-gray-300">
                        Hidden
                    </span>
                )}
            </div>
            <div className="p-4">
                <h3 className="text-base font-bold mb-1 font-orbitron break-words">{values.title || "Untitled project"}</h3>
                <p className="text-sm text-gray-300 mb-3 line-clamp-4 break-words">
                    {values.description || "Description goes here."}
                </p>
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {tags.map((tag) => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 bg-red-500/10 text-red-400 rounded-full">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
                {(hasLive || hasSource) && (
                    <div className="flex flex-wrap items-center gap-1.5">
                        {hasLive && values.showStatus && <span className={`${pill} text-gray-400`}>Status</span>}
                        {hasLive && (
                            <span className={`${pill} text-red-500`}>
                                <ExternalLink className="h-3 w-3" /> Visit Site
                            </span>
                        )}
                        {hasSource && (
                            <span className={`${pill} text-red-500`}>
                                <CodeXml className="h-3 w-3" /> Source
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
