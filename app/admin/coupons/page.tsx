import { TicketPercent } from "lucide-react"
import { db } from "@/lib/db"
import { CouponManager } from "@/components/admin/coupon-manager"
import { AdminPageHeader } from "@/components/admin/admin-page-header"

export default async function CouponsPage() {
    const coupons = await db.coupon.findMany({
        orderBy: { createdAt: "desc" }
    })

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Coupons"
                description="Create discount codes and track their usage."
                icon={TicketPercent}
                accent="orange"
            />
            <CouponManager coupons={coupons} />
        </div>
    )
}
