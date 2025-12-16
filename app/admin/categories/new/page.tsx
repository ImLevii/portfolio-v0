import { CategoryForm } from "@/components/admin/category-form"
import { createCategory } from "../actions"

export default function NewCategoryPage() {
    return <CategoryForm action={createCategory} />
}
