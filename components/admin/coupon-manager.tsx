"use client"

import { useState } from "react"
import { Coupon } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Trash2, Plus, Calendar } from "lucide-react"
import { toast } from "sonner"
import { createCoupon, deleteCoupon, toggleCoupon } from "@/app/admin/coupons/actions"
import { format } from "date-fns"

export function CouponManager({ coupons }: { coupons: Coupon[] }) {
    const [isCreating, setIsCreating] = useState(false)

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return
        const result = await deleteCoupon(id)
        if (result.success) toast.success("Coupon deleted")
        else toast.error("Failed to delete")
    }

    const handleToggle = async (id: string, current: boolean) => {
        const result = await toggleCoupon(id, !current)
        if (result.success) toast.success("Updated coupon status")
        else toast.error("Failed to update")
    }

    return (
        <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white font-orbitron">Coupons</CardTitle>
                    <Button onClick={() => setIsCreating(true)} className="bg-green-600 hover:bg-green-700">
                        <Plus className="h-4 w-4 mr-2" />
                        New Coupon
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-gray-800">
                        <div className="grid grid-cols-6 gap-4 p-4 border-b border-gray-800 text-gray-400 text-sm font-medium">
                            <div className="col-span-1">Code</div>
                            <div className="col-span-1">Discount</div>
                            <div className="col-span-1">Usage</div>
                            <div className="col-span-1">Expires</div>
                            <div className="col-span-1">Status</div>
                            <div className="col-span-1 text-right">Actions</div>
                        </div>
                        {coupons.map((coupon) => (
                            <div key={coupon.id} className="grid grid-cols-6 gap-4 p-4 items-center text-white border-b border-gray-800 last:border-0 hover:bg-gray-800/50">
                                <div className="font-mono text-green-400">{coupon.code}</div>
                                <div>{coupon.percent}%</div>
                                <div className="text-sm text-gray-400">
                                    {coupon.uses} / {coupon.maxUses || "∞"}
                                </div>
                                <div className="text-sm text-gray-400">
                                    {coupon.expiresAt ? format(new Date(coupon.expiresAt), 'PP') : "-"}
                                </div>
                                <div>
                                    <Switch
                                        checked={coupon.isActive}
                                        onCheckedChange={() => handleToggle(coupon.id, coupon.isActive)}
                                    />
                                </div>
                                <div className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(coupon.id)} className="text-gray-500 hover:text-red-400">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {coupons.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                                No coupons created yet.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {isCreating && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-md bg-gray-900 border-gray-800">
                        <CardHeader>
                            <CardTitle className="text-white">Create Coupon</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form action={async (formData) => {
                                const res = await createCoupon(null, formData)
                                if (res.success) {
                                    toast.success("Coupon created")
                                    setIsCreating(false)
                                } else {
                                    toast.error(res.error || "Failed")
                                }
                            }} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Code</label>
                                    <Input name="code" placeholder="SUMMER2025" required className="bg-gray-800 border-gray-700 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Discount Percentage (%)</label>
                                    <Input name="percent" type="number" min="1" max="100" required className="bg-gray-800 border-gray-700 text-white" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Max Uses (Optional)</label>
                                        <Input name="maxUses" type="number" className="bg-gray-800 border-gray-700 text-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Expires At (Optional)</label>
                                        <Input name="expiresAt" type="date" className="bg-gray-800 border-gray-700 text-white" />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 mt-4">
                                    <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
                                    <Button type="submit" className="bg-green-600 hover:bg-green-700">Create</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
