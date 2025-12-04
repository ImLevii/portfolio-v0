import { ProductForm } from "@/components/admin/product-form"
import { createProduct } from "../actions"

export default function NewProductPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold font-orbitron">New Product</h1>
            <ProductForm action={createProduct} />
        </div>
    )
}
