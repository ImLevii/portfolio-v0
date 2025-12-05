"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { Edit, Loader2 } from "lucide-react"
import { updateLicense } from "@/app/admin/customers/actions"
import { toast } from "sonner"

interface EditLicenseFormProps {
    id: string
    currentStatus: string
    customerId: string
}

export function EditLicenseForm({ id, currentStatus, customerId }: EditLicenseFormProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    async function onSubmit(formData: FormData) {
        setIsLoading(true)
        try {
            await updateLicense(formData)
            toast.success("License updated successfully")
            setOpen(false)
        } catch (error) {
            toast.error("Failed to update license")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-white/10">
                    <Edit className="h-3 w-3" />
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-black/90 border-gray-800 text-white backdrop-blur-xl sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="font-orbitron">Edit License</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Update the status of this license key.
                    </DialogDescription>
                </DialogHeader>
                <form action={onSubmit} className="grid gap-4 py-4">
                    <input type="hidden" name="id" value={id} />
                    <input type="hidden" name="customerId" value={customerId} />
                    <div className="grid gap-2">
                        <Select name="status" defaultValue={currentStatus} required>
                            <SelectTrigger className="bg-black/50 border-gray-800 focus:border-emerald-500/50">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent className="bg-black border-gray-800 text-white">
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="REVOKED">Revoked</SelectItem>
                                <SelectItem value="USED">Used</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update License
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
