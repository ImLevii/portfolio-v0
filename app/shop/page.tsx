import { db } from "@/lib/db"
import { ShopContent } from "@/components/shop/shop-content"
import { CategoryGrid } from "@/components/shop/category-grid"

export default async function ShopPage() {
    const products = await db.product.findMany({
        where: {
            isListed: true
        },
        orderBy: { createdAt: 'desc' }
    })

    const categories = await db.category.findMany({
        orderBy: { order: 'asc' }
    })

    return (
        <ShopContent
            products={products}
            headerContent={<CategoryGrid categories={categories} />}
        />
    )
}
