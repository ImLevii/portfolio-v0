"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { revokeLicense } from "@/app/admin/customers/actions"
import { toast } from "sonner"
import { Loader2, Ban } from "lucide-react"

interface RevokeLicenseButtonProps {
    id: string
    customerId: string
    status: string
}

export function RevokeLicenseButton({ id, customerId, status }: RevokeLicenseButtonProps) {
    const [isLoading, setIsLoading] = useState(false)

    if (status === "REVOKED") return null

    async function onRevoke() {
        if (!confirm("Are you sure you want to revoke this license?")) return

        setIsLoading(true)
        try {
            const formData = new FormData()
            formData.append("id", id)
            formData.append("customerId", customerId)
            await revokeLicense(formData)
            toast.success("License revoked")
        } catch (error) {
            toast.error("Failed to revoke license")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={onRevoke}
            disabled={isLoading}
            className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
            title="Revoke License"
        >
            {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Ban className="h-3 w-3" />}
        </Button>
    )
}
