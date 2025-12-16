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
            <div className="glass-panel p-1 rounded-2xl border border-gray-800/60 overflow-hidden">
                <div className="p-6 flex flex-row items-center justify-between border-b border-gray-800/60 bg-black/40">
                    <div className="space-y-1">
                        <h3 className="text-lg font-medium text-white font-orbitron">Active Coupons</h3>
                        <p className="text-sm text-gray-400">Manage discounts and promotional codes</p>
                    </div>
                    <Button
                        onClick={() => setIsCreating(true)}
                        className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all active:scale-[0.98]"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Coupon
                    </Button>
                </div>
                <div>
                    <div className="rounded-md">
                        <div className="grid grid-cols-6 gap-4 p-4 border-b border-gray-800/60 bg-white/5 text-gray-400 text-xs font-orbitron uppercase tracking-wider">
                            <div className="col-span-1">Code</div>
                            <div className="col-span-1">Discount</div>
                            <div className="col-span-1">Usage</div>
                            <div className="col-span-1">Expires</div>
                            <div className="col-span-1">Status</div>
                            <div className="col-span-1 text-right">Actions</div>
                        </div>
                        {coupons.map((coupon) => (
                            <div key={coupon.id} className="grid grid-cols-6 gap-4 p-4 items-center text-white border-b border-gray-800/60 last:border-0 hover:bg-white/5 transition-colors group">
                                <div className="font-mono text-white text-lg font-bold tracking-wider">{coupon.code}</div>
                                <div className="text-emerald-400 font-bold">{coupon.percent}% OFF</div>
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
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(coupon.id)} className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100">
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
                </div>
            </div>

            {isCreating && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="w-full max-w-md glass-panel border border-gray-800/60 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-gray-800/60">
                            <h2 className="text-xl font-bold text-white font-orbitron neon-text-glow">Create Coupon</h2>
                        </div>
                        <div className="p-6">
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
                                    <Button type="button" variant="ghost" onClick={() => setIsCreating(false)} className="hover:bg-white/10 hover:text-white">Cancel</Button>
                                    <Button type="submit" className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]">Create Coupon</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
                                                const res = await createCoupon(null, formData)
    if (res.success) {
        toast.success("Coupon created")
        setIsCreating(false)
    } else {
        toast.error(res.error || "Failed")
    }
}} className = "space-y-4" >
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
                                                    <Button type="button" variant="ghost" onClick={() => setIsCreating(false)} className="hover:bg-white/10 hover:text-white">Cancel</Button>
                                                    <Button type="submit" className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]">Create Coupon</Button>
                                                </div>
                                            </form >
                                        </div >
                                    </div >
                                </div >
                                )
            }
                            </div >
                            )
}
