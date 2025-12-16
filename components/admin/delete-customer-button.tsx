"use client"

import { useState } from "react"
import { Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteCustomer } from "@/app/admin/customers/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface DeleteCustomerButtonProps {
    customerId: string
    customerName: string
    variant?: "icon" | "button"
    redirectAfter?: boolean
}

export function DeleteCustomerButton({ customerId, customerName, variant = "button", redirectAfter = false }: DeleteCustomerButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const router = useRouter()

    async function onDelete() {
        setIsLoading(true)
        try {
            await deleteCustomer(customerId)
            toast.success("Customer deleted successfully")
            setOpen(false)
            if (redirectAfter) {
                router.push("/admin/customers")
            }
        } catch (error) {
            toast.error("Failed to delete customer")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                {variant === "icon" ? (
                    <div className="relative flex select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-white/10 hover:text-white focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer text-red-500 focus:text-red-500 w-full">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete Customer</span>
                    </div>
                ) : (
                    <Button variant="destructive" size="sm" className="h-8 gap-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20">
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete Customer
                    </Button>
                )}
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-black/95 border-gray-800 text-white backdrop-blur-xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="font-orbitron">Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-400">
                        This action cannot be undone. This will permanently delete the account for <span className="font-bold text-white">{customerName}</span> and remove all their data including orders and licenses.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="bg-transparent border-gray-700 hover:bg-white/10 text-white hover:text-white">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={(e) => { e.preventDefault(); onDelete(); }} className="bg-red-600 hover:bg-red-700 text-white border-0">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Delete Account
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
