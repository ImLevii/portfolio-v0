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
import { Plus, Loader2 } from "lucide-react"
import { assignProduct } from "@/app/admin/customers/actions"
import { toast } from "sonner"

interface Product {
    id: string
    name: string
}

interface AssignProductFormProps {
    customerId: string
    products: Product[]
}

export function AssignProductForm({ customerId, products }: AssignProductFormProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    async function onSubmit(formData: FormData) {
        setIsLoading(true)
        try {
            await assignProduct(formData)
            toast.success("Product assigned successfully")
            setOpen(false)
        } catch (error) {
            toast.error("Failed to assign product")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="h-8 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-none">
                    <Plus className="h-3.5 w-3.5" />
                    Assign Product
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-black/90 border-gray-800 text-white backdrop-blur-xl sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="font-orbitron">Assign Product</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Manually assign a product license to this customer.
                    </DialogDescription>
                </DialogHeader>
                <form action={onSubmit} className="grid gap-4 py-4">
                    <input type="hidden" name="customerId" value={customerId} />
                    <div className="grid gap-2">
                        <Select name="productId" required>
                            <SelectTrigger className="bg-black/50 border-gray-800 focus:border-emerald-500/50">
                                <SelectValue placeholder="Select a product" />
                            </SelectTrigger>
                            <SelectContent className="bg-black border-gray-800 text-white">
                                {products.map((product) => (
                                    <SelectItem key={product.id} value={product.id}>
                                        {product.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Assign License
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
