"use client"

import { useState } from "react"
import { Order } from "@prisma/client"
import { updateOrderStatus } from "@/app/admin/orders/actions"
import { deleteOrder } from "@/app/admin/actions"
import { MoreHorizontal, Check, Trash2, Loader2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface OrderActionsProps {
    order: Order
}

export function OrderActions({ order }: OrderActionsProps) {
    const [loading, setLoading] = useState(false)

    const handleUpdateStatus = async (status: string) => {
        setLoading(true)
        try {
            const result = await updateOrderStatus(order.id, status)
            if (result.success) {
                toast.success(`Order status updated to ${status}`)
            } else {
                toast.error(result.error || "Failed to update status")
            }
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this order?")) return
        setLoading(true)
        try {
            await deleteOrder(order.id)
            toast.success("Order deleted")
        } catch (error) {
            toast.error("Failed to delete order")
        } finally {
            setLoading(false)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                    <span className="sr-only">Open menu</span>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-black/90 border-gray-800 backdrop-blur-xl text-gray-200">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={() => navigator.clipboard.writeText(order.id)}
                    className="hover:bg-white/10 hover:text-white cursor-pointer"
                >
                    Copy Order ID
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-800" />

                {order.status !== "completed" && (
                    <DropdownMenuItem
                        onClick={() => handleUpdateStatus("completed")}
                        className="text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400 cursor-pointer"
                    >
                        <Check className="mr-2 h-4 w-4" />
                        Mark Completed
                    </DropdownMenuItem>
                )}

                {order.status !== "pending" && (
                    <DropdownMenuItem
                        onClick={() => handleUpdateStatus("pending")}
                        className="text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-400 cursor-pointer"
                    >
                        <XCircle className="mr-2 h-4 w-4" />
                        Mark Pending
                    </DropdownMenuItem>
                )}

                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-red-500 hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Order
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
