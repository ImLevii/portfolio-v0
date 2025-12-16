"use client"

import { useState } from "react"
import { CarouselItem } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react"
import { createCarouselItem, updateCarouselItem, deleteCarouselItem } from "@/app/admin/carousel/actions"
import { toast } from "sonner"

export function CarouselManager({ initialItems }: { initialItems: CarouselItem[] }) {
    const [items, setItems] = useState(initialItems)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<CarouselItem | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const data = {
            title: formData.get("title") as string,
            subtitle: formData.get("subtitle") as string,
            description: formData.get("description") as string,
            cta: formData.get("cta") as string,
            color: formData.get("color") as string,
            accent: formData.get("accent") as string,
            button: formData.get("button") as string,
        }

        try {
            if (editingItem) {
                await updateCarouselItem(editingItem.id, data)
                toast.success("Item updated successfully")
            } else {
                await createCarouselItem(data)
                toast.success("Item created successfully")
            }
            setIsDialogOpen(false)
            setEditingItem(null)
            // Refresh items (in a real app, you might want to re-fetch or update local state optimistically)
            window.location.reload()
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this item?")) {
            try {
                await deleteCarouselItem(id)
                toast.success("Item deleted successfully")
                window.location.reload()
            } catch (error) {
                toast.error("Something went wrong")
            }
        }
    }

    const handleToggleActive = async (id: string, isActive: boolean) => {
        try {
            await updateCarouselItem(id, { isActive })
            toast.success("Status updated")
            window.location.reload()
        } catch (error) {
            toast.error("Something went wrong")
        }
    }

    return (
        <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-gray-800/60 bg-black/40">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-white font-orbitron">Carousel Slides</h2>
                        <p className="text-sm text-gray-400">Manage your homepage carousel content</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {items.length === 0 && (
                            <Button
                                onClick={async () => {
                                    setLoading(true)
                                    try {
                                        const { seedCarouselItems } = await import("@/app/admin/carousel/actions")
                                        await seedCarouselItems()
                                        toast.success("Default slides loaded")
                                        window.location.reload()
                                    } catch (error) {
                                        toast.error("Failed to load defaults")
                                    } finally {
                                        setLoading(false)
                                    }
                                }}
                                variant="outline"
                                className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/30"
                                disabled={loading}
                            >
                                Load Defaults
                            </Button>
                        )}
                        <Button
                            onClick={() => { setEditingItem(null); setIsDialogOpen(true) }}
                            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all active:scale-[0.98]"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Slide
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4">
                    {items.map((item) => (
                        <div key={item.id} className="group relative overflow-hidden rounded-xl border border-gray-800/60 bg-gray-900/40 hover:bg-gray-800/60 transition-all hover:shadow-xl hover:shadow-emerald-900/10">
                            <div className="flex items-center justify-between p-5">
                                <div className="flex items-center gap-5">
                                    <div className="p-2 rounded-lg bg-white/5 text-gray-500 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-colors cursor-move">
                                        <GripVertical className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white font-orbitron text-lg flex items-center gap-2">
                                            {item.title}
                                            {item.isActive && <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>}
                                        </h3>
                                        <p className="text-sm text-gray-400 font-light mt-1">{item.subtitle}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-3 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                                        <Label htmlFor={`active-${item.id}`} className="text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer">Active</Label>
                                        <Switch
                                            id={`active-${item.id}`}
                                            checked={item.isActive}
                                            onCheckedChange={(checked) => handleToggleActive(item.id, checked)}
                                            className="data-[state=checked]:bg-emerald-500"
                                        />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => { setEditingItem(item); setIsDialogOpen(true) }} className="hover:bg-blue-500/10 hover:text-blue-400 transition-colors">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="hover:bg-red-500/10 hover:text-red-400 transition-colors">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-gray-900 border-gray-800 text-white max-h-[90vh] overflow-y-auto sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? "Edit Slide" : "New Slide"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input name="title" defaultValue={editingItem?.title} required className="bg-black/50 border-gray-700" />
                        </div>
                        <div className="space-y-2">
                            <Label>Subtitle</Label>
                            <Input name="subtitle" defaultValue={editingItem?.subtitle} required className="bg-black/50 border-gray-700" />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea name="description" defaultValue={editingItem?.description} required className="bg-black/50 border-gray-700 min-h-[80px]" />
                        </div>
                        <div className="space-y-2">
                            <Label>CTA Text</Label>
                            <Input name="cta" defaultValue={editingItem?.cta} required className="bg-black/50 border-gray-700" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Gradient Color (Tailwind)</Label>
                                <Input name="color" defaultValue={editingItem?.color || "from-green-500 to-emerald-700"} required className="bg-black/50 border-gray-700" />
                            </div>
                            <div className="space-y-2">
                                <Label>Accent Color (Tailwind)</Label>
                                <Input name="accent" defaultValue={editingItem?.accent || "text-green-400"} required className="bg-black/50 border-gray-700" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Button Classes (Tailwind)</Label>
                            <Textarea name="button" defaultValue={editingItem?.button || "bg-green-600 hover:bg-green-700 text-white shadow-green-900/20 hover:shadow-green-500/40"} required className="bg-black/50 border-gray-700 min-h-[60px]" />
                        </div>
                        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                            {loading ? "Saving..." : "Save Slide"}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
