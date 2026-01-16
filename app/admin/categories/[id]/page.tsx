import { CategoryForm } from "@/components/admin/category-form"
import { updateCategory } from "../actions"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { LayoutGrid } from "lucide-react"

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
    const category = await db.category.findUnique({
        where: { id: params.id }
    })

    if (!category) notFound()

    return (
        <div className="space-y-8 p-4 md:p-8">
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                    <LayoutGrid className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight font-orbitron text-white">Edit Category</h1>
                    <p className="text-zinc-400">Update category details</p>
                </div>
            </div>

            <CategoryForm
                initialData={category}
                action={updateCategory.bind(null, category.id)}
            />
        </div>
    )
}
