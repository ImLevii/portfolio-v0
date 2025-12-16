import { getCarouselItems } from "./actions"
import { CarouselManager } from "@/components/admin/carousel-manager"

export default async function CarouselAdminPage() {
    const items = await getCarouselItems()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold font-orbitron text-white neon-text-glow">Carousel Management</h1>
            </div>
            <CarouselManager initialItems={items} />
        </div>
    )
}
