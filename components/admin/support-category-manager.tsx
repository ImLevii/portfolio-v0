"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Plus, GripVertical, CreditCard, Gamepad2, Headphones, DollarSign, ShieldCheck, MessageSquare, Save } from "lucide-react"
import { showTerminalToast } from "@/components/global/terminal-toast"

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
import { createSupportCategory, deleteSupportCategory, type getSupportCategories } from "@/actions/categories"

export const ALLOWED_ICONS = ["credit-card", "gamepad", "headphones", "dollar-sign", "shield-check", "message-square"]

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
        if (!newTitle) return showTerminalToast.error("Title is required")

        startTransition(async () => {
            const res = await createSupportCategory({
                title: newTitle,
                subtitle: newSubtitle,
                icon: newIcon,
                order: initialCategories.length // append to end
            })

            if (res.success) {
                showTerminalToast.success("Category created")
                setIsDialogOpen(false)
                setNewTitle("")
                setNewSubtitle("")
                setNewIcon("message-square")
                router.refresh()
            } else {
                showTerminalToast.error("Failed to create category")
            }
        })
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this category?")) return

        startTransition(async () => {
            const res = await deleteSupportCategory(id)
            if (res.success) {
                showTerminalToast.success("Category deleted")
                router.refresh()
            } else {
                showTerminalToast.error("Failed to delete")
            }
        })
    }

    return (
        <div className="glass-panel p-6 rounded-2xl border border-gray-800/60 bg-black/40">
            <div className="flex flex-row items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold font-orbitron text-cyan-400">Support Categories</h3>
                    <p className="text-sm text-gray-400 mt-1">Manage the options available in the Support Hub</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-950/30 hover:text-cyan-300">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Category
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-panel border-gray-800/60 bg-black/90 backdrop-blur-xl">
                        <DialogHeader>
                            <DialogTitle className="font-orbitron text-white text-xl">Add New Category</DialogTitle>
                            <DialogDescription className="text-gray-400">Create a new option requiring support.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Title</label>
                                <Input
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="e.g. Payments"
                                    className="bg-white/5 border-gray-700 text-white placeholder:text-gray-600 focus:border-cyan-500/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Subtitle</label>
                                <Input
                                    value={newSubtitle}
                                    onChange={(e) => setNewSubtitle(e.target.value)}
                                    placeholder="Short description..."
                                    className="bg-white/5 border-gray-700 text-white placeholder:text-gray-600 focus:border-cyan-500/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Icon</label>
                                <Select value={newIcon} onValueChange={setNewIcon}>
                                    <SelectTrigger className="bg-white/5 border-gray-700 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-gray-800">
                                        {ALLOWED_ICONS.map(icon => (
                                            <SelectItem key={icon} value={icon} className="focus:bg-cyan-500/20 focus:text-cyan-400">
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
                            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-gray-400 hover:text-white">Cancel</Button>
                            <Button onClick={handleCreate} disabled={isPending} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] border-0">
                                {isPending ? "Creating..." : "Create Category"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="space-y-3">
                {initialCategories.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 border border-dashed border-gray-800/60 rounded-xl bg-white/5">
                        No categories found. Create one to get started.
                    </div>
                ) : (
                    initialCategories.map((cat: { id: string, title: string, subtitle: string | null, icon: string }) => (
                        <div key={cat.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-800/60 bg-gray-900/40 hover:bg-gray-800/60 group transition-all">
                            <GripVertical className="h-5 w-5 text-gray-600 cursor-move hover:text-gray-400 transition-colors" />
                            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                                {iconMap[cat.icon] || <MessageSquare className="h-5 w-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-white font-orbitron text-base">{cat.title}</p>
                                <p className="text-sm text-gray-400 truncate">{cat.subtitle}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(cat.id)}
                                disabled={isPending}
                                className="opacity-0 group-hover:opacity-100 transition-all text-gray-500 hover:text-red-400 hover:bg-red-500/10"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
