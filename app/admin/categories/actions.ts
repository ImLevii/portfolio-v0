"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

async function checkAdmin() {
    const session = await auth()
    // @ts-ignore
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }
}

export async function createCategory(formData: FormData) {
    await checkAdmin()

    const name = formData.get("name") as string
    const slug = formData.get("slug") as string
    const description = formData.get("description") as string
    const image = formData.get("image") as string // Optional URL
    const order = parseInt(formData.get("order") as string) || 0

    await db.category.create({
        data: {
            name,
            slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
            description,
            image,
            order
        },
    })

    revalidatePath("/admin/categories")
    revalidatePath("/admin/products/new")
    revalidatePath("/admin/products/[id]")
}

export async function updateCategory(id: string, formData: FormData) {
    await checkAdmin()

    const name = formData.get("name") as string
    const slug = formData.get("slug") as string
    const description = formData.get("description") as string
    const image = formData.get("image") as string
    const order = parseInt(formData.get("order") as string) || 0

    await db.category.update({
        where: { id },
        data: {
            name,
            slug,
            description,
            image,
            order
        },
    })

    revalidatePath("/admin/categories")
    revalidatePath("/admin/products/new")
    revalidatePath("/admin/products/[id]")
}

export async function deleteCategory(id: string) {
    await checkAdmin()

    await db.category.delete({
        where: { id },
    })

    revalidatePath("/admin/categories")
    revalidatePath("/admin/products/new")
    revalidatePath("/admin/products/[id]")
}

export async function updateCategoryOrder(id: string, newOrder: number) {
    await checkAdmin()

    await db.category.update({
        where: { id },
        data: { order: newOrder }
    })

    revalidatePath("/admin/categories")
}
