import { db } from "@/lib/db"
import { ShopContent } from "@/components/shop/shop-content"

export default async function ShopPage() {
    const products = await db.product.findMany({
        where: {
            isListed: true
        },
        orderBy: { createdAt: 'desc' }
    })

    return <ShopContent products={products} />
}
