import { db } from "@/lib/db"
import { CategoryForm } from "@/components/admin/category-form"
import { updateCategory, deleteCategory } from "../actions"
import { notFound, redirect } from "next/navigation"
import { Trash2 } from "lucide-react"

interface PageProps {
    params: {
        id: string
    }
}

export default async function EditCategoryPage({ params }: PageProps) {
    const category = await db.category.findUnique({
        where: { id: params.id }
    })

    if (!category) return notFound()

    const updateAction = updateCategory.bind(null, category.id)
    const deleteAction = async () => {
        "use server"
        await deleteCategory(category.id)
        redirect("/admin/categories")
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <form action={deleteAction}>
                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg border border-red-500/20 transition-all font-orbitron text-sm font-bold uppercase tracking-wider"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete Category
                    </button>
                </form>
            </div>
            <CategoryForm initialData={category} action={updateAction} />
        </div>
    )
}
