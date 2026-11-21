import { CategoryForm } from "@/components/admin/category-form"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { createCategory } from "../actions"
import { Tags } from "lucide-react"

export default function NewCategoryPage() {
    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="New Category"
                description="Create a new product category"
                icon={Tags}
                accent="purple"
                backHref="/admin/categories"
            />

            <CategoryForm action={createCategory} />
        </div>
    )
}
