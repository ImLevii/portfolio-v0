import { ProductForm } from "@/components/admin/product-form"
import { createProduct } from "../actions"

import { db } from "@/lib/db"

export default async function NewProductPage() {
    const categories = await db.category.findMany({
        orderBy: { order: 'asc' }
    })

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold font-orbitron text-white neon-text-glow">New Product</h1>
            <ProductForm action={createProduct} categories={categories} />
        </div>
    )
}
