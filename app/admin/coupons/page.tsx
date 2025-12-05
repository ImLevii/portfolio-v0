import { db } from "@/lib/db"
import { CouponManager } from "@/components/admin/coupon-manager"

export default async function CouponsPage() {
    const coupons = await db.coupon.findMany({
        orderBy: { createdAt: "desc" }
    })

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-white font-orbitron">Coupons</h2>
            </div>
            <CouponManager coupons={coupons} />
        </div>
    )
}
