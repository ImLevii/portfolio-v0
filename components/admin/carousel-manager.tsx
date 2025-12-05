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
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Button onClick={() => { setEditingItem(null); setIsDialogOpen(true) }} className="bg-green-600 hover:bg-green-700">
                    <Plus className="mr-2 h-4 w-4" /> Add New Slide
                </Button>
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
                        className="border-green-600 text-green-500 hover:bg-green-900/20"
                        disabled={loading}
                    >
                        Load Default Slides
                    </Button>
                )}
            </div>

            <div className="grid gap-4">
                {items.map((item) => (
                    <Card key={item.id} className="bg-gray-900 border-gray-800">
                        <CardContent className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-4">
                                <GripVertical className="text-gray-500 cursor-move" />
                                <div>
                                    <h3 className="font-bold text-white font-orbitron">{item.title}</h3>
                                    <p className="text-sm text-gray-400">{item.subtitle}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Label htmlFor={`active-${item.id}`} className="text-sm text-gray-400">Active</Label>
                                    <Switch
                                        id={`active-${item.id}`}
                                        checked={item.isActive}
                                        onCheckedChange={(checked) => handleToggleActive(item.id, checked)}
                                    />
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => { setEditingItem(item); setIsDialogOpen(true) }}>
                                    <Pencil className="h-4 w-4 text-blue-400" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                                    <Trash2 className="h-4 w-4 text-red-400" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
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
