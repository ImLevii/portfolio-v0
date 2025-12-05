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

import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

async function saveFile(file: File): Promise<string> {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create a unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
    const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), "storage", "products")
    await mkdir(uploadDir, { recursive: true })

    const filePath = join(uploadDir, filename)
    await writeFile(filePath, buffer)

    return filename // Store only the filename/relative path identifier
}

export async function createProduct(formData: FormData) {
    await checkAdmin()

    const name = formData.get("name") as string
    const description = formData.get("description") as string

    // Convert price from string float (dollars) to integer (cents)
    const rawPrice = parseFloat(formData.get("price") as string)
    const price = Math.round(rawPrice * 100)

    const image = formData.get("image") as string
    const category = formData.get("category") as string
    const features = formData.get("features") as string
    const stock = parseInt(formData.get("stock") as string) || 0
    const file = formData.get("file") as File

    let filePath: string | null = null
    if (file && file.size > 0) {
        filePath = await saveFile(file)
    }

    await db.product.create({
        data: {
            name,
            description,
            price,
            image,
            category,
            features,
            stock,
            filePath
        },
    })

    revalidatePath("/admin/products")
    revalidatePath("/shop")
}

export async function updateProduct(id: string, formData: FormData) {
    await checkAdmin()

    const name = formData.get("name") as string
    const description = formData.get("description") as string

    // Convert price from string float (dollars) to integer (cents)
    const rawPrice = parseFloat(formData.get("price") as string)
    const price = Math.round(rawPrice * 100)

    const image = formData.get("image") as string
    const category = formData.get("category") as string
    const features = formData.get("features") as string
    const stock = parseInt(formData.get("stock") as string) || 0
    const file = formData.get("file") as File

    const data: any = {
        name,
        description,
        price,
        image,
        category,
        features,
        stock,
    }

    if (file && file.size > 0) {
        data.filePath = await saveFile(file)
    }

    await db.product.update({
        where: { id },
        data,
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
