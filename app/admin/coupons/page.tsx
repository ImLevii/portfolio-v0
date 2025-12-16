import { db } from "@/lib/db"
import { CouponManager } from "@/components/admin/coupon-manager"

export default async function CouponsPage() {
    const coupons = await db.coupon.findMany({
        orderBy: { createdAt: "desc" }
    })

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-white font-orbitron neon-text-glow">Coupons</h2>
            </div>
            <CouponManager coupons={coupons} />
        </div>
    )
}
