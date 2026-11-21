import { GalleryHorizontalEnd } from "lucide-react"
import { getCarouselItems } from "./actions"
import { CarouselManager } from "@/components/admin/carousel-manager"
import { AdminPageHeader } from "@/components/admin/admin-page-header"

export default async function CarouselAdminPage() {
    const items = await getCarouselItems()

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Carousel"
                description="Manage the slides shown in the shop carousel."
                icon={GalleryHorizontalEnd}
                accent="cyan"
            />
            <CarouselManager initialItems={items} />
        </div>
    )
}
