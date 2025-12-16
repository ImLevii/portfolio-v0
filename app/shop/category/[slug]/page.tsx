import { db } from "@/lib/db"
import { ShopContent } from "@/components/shop/shop-content"
import { notFound } from "next/navigation"

interface CategoryPageProps {
    params: {
        slug: string
    }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const category = await db.category.findUnique({
        where: { slug: params.slug }
    })

    if (!category) {
        return notFound()
    }

    // Since products store category as a string due to legacy schema, 
    // we match by the category name. 
    // Ideally, we would migrate products to use categoryId in the future.
    const products = await db.product.findMany({
        where: {
            isListed: true,
            category: category.name
        },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <ShopContent
            products={products}
            title={category.name}
            description={category.description || `Browse our collection of ${category.name}`}
            categoryImage={category.image}
        />
    )
}
