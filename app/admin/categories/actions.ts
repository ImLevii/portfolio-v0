'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createCategory(formData: FormData) {
    const name = formData.get("name") as string
    const image = formData.get("image") as string
    const description = formData.get("description") as string
    const order = parseInt(formData.get("order") as string || "0")

    if (!name) throw new Error("Name is required")

    // Create slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

    await db.category.create({
        data: {
            name,
            slug,
            image,
            description,
            order
        }
    })

    revalidatePath('/admin/categories')
    revalidatePath('/shop')
}

export async function updateCategory(id: string, formData: FormData) {
    const name = formData.get("name") as string
    const image = formData.get("image") as string
    const description = formData.get("description") as string
    const order = parseInt(formData.get("order") as string || "0")

    if (!name) throw new Error("Name is required")

    // Create slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

    await db.category.update({
        where: { id },
        data: {
            name,
            slug,
            image,
            description,
            order
        }
    })

    revalidatePath('/admin/categories')
    revalidatePath('/shop')
}

export async function deleteCategory(id: string) {
    await db.category.delete({
        where: { id }
    })

    revalidatePath('/admin/categories')
    revalidatePath('/shop')
}
