"use client"

import { useState } from "react"
import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createSponsoredMessage, updateSponsoredMessage, type SponsoredMessageData } from "@/actions/sponsored"
import { Loader2 } from "lucide-react"

interface SponsoredMessageFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialData?: SponsoredMessageData | null
    onSuccess: () => void
}

export function SponsoredMessageForm({ open, onOpenChange, initialData, onSuccess }: SponsoredMessageFormProps) {
    const [isPending, startTransition] = useTransition()

    // Form State
    const [title, setTitle] = useState(initialData?.title || "")
    const [description, setDescription] = useState(initialData?.description || "")
    const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "")
    const [linkUrl, setLinkUrl] = useState(initialData?.linkUrl || "")
    const [frequency, setFrequency] = useState(initialData?.frequency || 15)
    const [isActive, setIsActive] = useState(initialData?.isActive ?? true)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        startTransition(async () => {
            const data = {
                title,
                description,
                imageUrl,
                linkUrl,
                frequency,
                isActive
            }

            let res
            if (initialData?.id) {
                res = await updateSponsoredMessage(initialData.id, data)
            } else {
                res = await createSponsoredMessage(data)
            }

            if (res.success) {
                onSuccess()
                onOpenChange(false)
                // Reset form if creating new (optional, but good UX)
                if (!initialData) {
                    setTitle("")
                    setDescription("")
                    setImageUrl("")
                    setLinkUrl("")
                }
            } else {
                alert("Failed to save sponsored message")
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-zinc-800 text-zinc-100">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-emerald-500">
                        {initialData ? "Edit Sponsored Message" : "New Sponsored Message"}
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Content here will be periodically injected into the live chat.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-zinc-300">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Special Offer"
                            className="bg-black/50 border-zinc-700 focus-visible:border-emerald-500/50 focus-visible:ring-0"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-zinc-300">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Detailed text for the message..."
                            className="bg-black/50 border-zinc-700 focus-visible:border-emerald-500/50 focus-visible:ring-0 min-h-[80px]"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="imageUrl" className="text-zinc-300">Image URL (Optional)</Label>
                        <Input
                            id="imageUrl"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://..."
                            className="bg-black/50 border-zinc-700 focus-visible:border-emerald-500/50 focus-visible:ring-0"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="linkUrl" className="text-zinc-300">Link URL (Optional)</Label>
                        <Input
                            id="linkUrl"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="https://..."
                            className="bg-black/50 border-zinc-700 focus-visible:border-emerald-500/50 focus-visible:ring-0"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="frequency" className="text-zinc-300">Frequency (Minutes)</Label>
                        <Input
                            id="frequency"
                            type="number"
                            min="1"
                            value={frequency}
                            onChange={(e) => setFrequency(parseInt(e.target.value) || 15)}
                            className="bg-black/50 border-zinc-700 focus-visible:border-emerald-500/50 focus-visible:ring-0"
                        />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-black/20 p-3">
                        <Label htmlFor="active-mode" className="text-sm font-medium text-zinc-300">
                            Active Status
                        </Label>
                        <Switch
                            id="active-mode"
                            checked={isActive}
                            onCheckedChange={setIsActive}
                            className="data-[state=checked]:bg-emerald-500"
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                            className="hover:bg-zinc-800 hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
                            disabled={isPending}
                        >
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {initialData ? "Save Changes" : "Create Message"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
