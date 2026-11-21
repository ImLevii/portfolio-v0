import { ShoppingBag } from "lucide-react"
import { ProductForm } from "@/components/admin/product-form"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { createProduct } from "../actions"

import { db } from "@/lib/db"

export default async function NewProductPage() {
    const categories = await db.category.findMany({
        orderBy: { order: 'asc' }
    })

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="New Product"
                description="Add a product to the shop."
                icon={ShoppingBag}
                accent="orange"
                backHref="/admin/products"
            />
            <ProductForm action={createProduct} categories={categories} />
        </div>
    )
}
