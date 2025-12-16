import { ProductForm } from "@/components/admin/product-form"
import { updateProduct } from "../actions"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"

interface EditProductPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
    const { id } = await params
    const product = await db.product.findUnique({
        where: { id }
    })

    if (!product) {
        notFound()
    }

    const updateAction = updateProduct.bind(null, id)

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold font-orbitron text-white neon-text-glow">Edit Product</h1>
            <ProductForm initialData={product} action={updateAction} />
        </div>
    )
}
