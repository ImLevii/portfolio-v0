"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/auth"

async function checkAdmin() {
    const session = await auth()
    // @ts-ignore
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }
}

export async function createProduct(formData: FormData) {
    await checkAdmin()

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const price = parseInt(formData.get("price") as string)
    const image = formData.get("image") as string
    const category = formData.get("category") as string
    const features = formData.get("features") as string
    const stock = parseInt(formData.get("stock") as string) || 0

    await db.product.create({
        data: {
            name,
            description,
            price,
            image,
            category,
            features,
            stock,
        },
    })

    revalidatePath("/admin/products")
    revalidatePath("/shop")
}

export async function updateProduct(id: string, formData: FormData) {
    await checkAdmin()

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const price = parseInt(formData.get("price") as string)
    const image = formData.get("image") as string
    const category = formData.get("category") as string
    const features = formData.get("features") as string
    const stock = parseInt(formData.get("stock") as string) || 0

    await db.product.update({
        where: { id },
        data: {
            name,
            description,
            price,
            image,
            category,
            features,
            stock,
        },
    })

    revalidatePath("/admin/products")
    revalidatePath("/shop")
}

export async function deleteProduct(id: string) {
    await checkAdmin()

    await db.product.delete({
        where: { id },
    })

    revalidatePath("/admin/products")
    revalidatePath("/shop")
}
