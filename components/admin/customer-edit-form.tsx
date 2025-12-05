"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Pencil, Loader2 } from "lucide-react"
import { updateCustomer } from "@/app/admin/customers/actions"
import { toast } from "sonner"

interface CustomerEditFormProps {
    customer: {
        id: string
        name: string | null
        email: string | null
        role: string
    }
}

export function CustomerEditForm({ customer }: CustomerEditFormProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    async function onSubmit(formData: FormData) {
        setIsLoading(true)
        try {
            await updateCustomer(formData)
            toast.success("Customer updated successfully")
            setOpen(false)
        } catch (error) {
            toast.error("Failed to update customer")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-2 border-white/10 hover:bg-white/10 text-gray-400 hover:text-white">
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-black/90 border-gray-800 text-white backdrop-blur-xl sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="font-orbitron">Edit Customer</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Make changes to the customer's profile here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <form action={onSubmit} className="grid gap-4 py-4">
                    <input type="hidden" name="id" value={customer.id} />
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="text-gray-400">Name</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={customer.name || ""}
                            className="bg-black/50 border-gray-800 focus:border-emerald-500/50"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-gray-400">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            defaultValue={customer.email || ""}
                            className="bg-black/50 border-gray-800 focus:border-emerald-500/50"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="role" className="text-gray-400">Role</Label>
                        <Select name="role" defaultValue={customer.role}>
                            <SelectTrigger className="bg-black/50 border-gray-800 focus:border-emerald-500/50">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent className="bg-black border-gray-800 text-white">
                                <SelectItem value="CUSTOMER">Customer</SelectItem>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
