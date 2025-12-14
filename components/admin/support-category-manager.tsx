"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Plus, GripVertical, CreditCard, Gamepad2, Headphones, DollarSign, ShieldCheck, MessageSquare, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createSupportCategory, deleteSupportCategory, type getSupportCategories, ALLOWED_ICONS } from "@/actions/categories"

// Map string icon names to components for display
export const iconMap: Record<string, React.ReactNode> = {
    "credit-card": <CreditCard className="h-4 w-4" />,
    "gamepad": <Gamepad2 className="h-4 w-4" />,
    "headphones": <Headphones className="h-4 w-4" />,
    "dollar-sign": <DollarSign className="h-4 w-4" />,
    "shield-check": <ShieldCheck className="h-4 w-4" />,
    "message-square": <MessageSquare className="h-4 w-4" />,
}

interface SupportCategoryManagerProps {
    initialCategories: Awaited<ReturnType<typeof getSupportCategories>>
}

export function SupportCategoryManager({ initialCategories }: SupportCategoryManagerProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // New Category State
    const [newTitle, setNewTitle] = useState("")
    const [newSubtitle, setNewSubtitle] = useState("")
    const [newIcon, setNewIcon] = useState("message-square")

    const handleCreate = async () => {
        if (!newTitle) return toast.error("Title is required")

        startTransition(async () => {
            const res = await createSupportCategory({
                title: newTitle,
                subtitle: newSubtitle,
                icon: newIcon,
                order: initialCategories.length // append to end
            })

            if (res.success) {
                toast.success("Category created")
                setIsDialogOpen(false)
                setNewTitle("")
                setNewSubtitle("")
                setNewIcon("message-square")
                router.refresh()
            } else {
                toast.error("Failed to create category")
            }
        })
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this category?")) return

        startTransition(async () => {
            const res = await deleteSupportCategory(id)
            if (res.success) {
                toast.success("Category deleted")
                router.refresh()
            } else {
                toast.error("Failed to delete")
            }
        })
    }

    return (
        <Card className="border-cyan-500/20 bg-black/40 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-cyan-100">Support Categories</CardTitle>
                    <CardDescription>Manage the options available in the Support Hub</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Category
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-900 border-zinc-800">
                        <DialogHeader>
                            <DialogTitle>Add New Category</DialogTitle>
                            <DialogDescription>Create a new option requiring support.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title</label>
                                <Input
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="e.g. Payments"
                                    className="bg-black/20 border-zinc-700"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Subtitle</label>
                                <Input
                                    value={newSubtitle}
                                    onChange={(e) => setNewSubtitle(e.target.value)}
                                    placeholder="Short description..."
                                    className="bg-black/20 border-zinc-700"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Icon</label>
                                <Select value={newIcon} onValueChange={setNewIcon}>
                                    <SelectTrigger className="bg-black/20 border-zinc-700">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ALLOWED_ICONS.map(icon => (
                                            <SelectItem key={icon} value={icon}>
                                                <div className="flex items-center gap-2">
                                                    {iconMap[icon]}
                                                    <span className="capitalize">{icon.replace('-', ' ')}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate} disabled={isPending} className="bg-cyan-600 hover:bg-cyan-500">
                                {isPending ? "Creating..." : "Create Category"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent className="space-y-2">
                {initialCategories.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
                        No categories found. Create one to get started.
                    </div>
                ) : (
                    initialCategories.map((cat: { id: string, title: string, subtitle: string | null, icon: string }) => (
                        <div key={cat.id} className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/5 group">
                            <GripVertical className="h-4 w-4 text-zinc-600 cursor-move" />
                            <div className="p-2 rounded-full bg-cyan-500/10 text-cyan-500">
                                {iconMap[cat.icon] || <MessageSquare className="h-4 w-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-zinc-200">{cat.title}</p>
                                <p className="text-xs text-zinc-500 truncate">{cat.subtitle}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(cat.id)}
                                disabled={isPending}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-400 hover:bg-red-500/10"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    )
}
