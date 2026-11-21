import { CategoryForm } from "@/components/admin/category-form"
import { updateCategory } from "../actions"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { Tags } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/admin-page-header"

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const category = await db.category.findUnique({
        where: { id }
    })

    if (!category) notFound()

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Edit Category"
                description={category.name}
                icon={Tags}
                accent="purple"
                backHref="/admin/categories"
            />

            <CategoryForm
                initialData={{
                    id: category.id,
                    name: category.name,
                    slug: category.slug,
                    description: category.description,
                    image: category.image,
                    order: category.order
                }}
                action={updateCategory.bind(null, category.id)}
            />
        </div>
    )
}
