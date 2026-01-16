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

    // Fetch ALL products so client-side filtering works for other categories too
    const products = await db.product.findMany({
        where: {
            isListed: true
        },
        orderBy: { createdAt: 'desc' }
    })

    // Fetch ALL categories for the toolbar
    const categories = await db.category.findMany({
        orderBy: { order: 'asc' }
    })

    return (
        <ShopContent
            products={products}
            categories={categories}
            title={category.name}
            description={category.description || `Browse our collection of ${category.name}`}
            categoryImage={category.image}
            initialCategory={category.name}
        />
    )
}
