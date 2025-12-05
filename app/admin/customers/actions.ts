"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function updateCustomer(formData: FormData) {
    const session = await auth()

    // @ts-ignore
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    const id = formData.get("id") as string
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const role = formData.get("role") as string

    if (!id || !email) {
        throw new Error("Missing required fields")
    }

    await db.user.update({
        where: { id },
        data: {
            name,
            email,
            role
        }
    })

    revalidatePath(`/admin/customers/${id}`)
    revalidatePath("/admin/customers")
}

export async function revokeLicense(formData: FormData) {
    const session = await auth()

    // @ts-ignore
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    const id = formData.get("id") as string
    const customerId = formData.get("customerId") as string

    if (!id) {
        throw new Error("Missing required fields")
    }

    await db.licenseKey.update({
        where: { id },
        data: {
            status: "REVOKED"
        }
    })

    revalidatePath(`/admin/customers/${customerId}`)
}

export async function assignProduct(formData: FormData) {
    const session = await auth()

    // @ts-ignore
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    const customerId = formData.get("customerId") as string
    const productId = formData.get("productId") as string

    if (!customerId || !productId) {
        throw new Error("Missing required fields")
    }

    const { generateLicenseKey } = await import("@/lib/license")

    // Create a manual order
    const order = await db.order.create({
        data: {
            userId: customerId,
            stripeSessionId: `MANUAL_${Date.now()}`,
            amount: 0,
            currency: "USD",
            status: "completed",
            paymentMethod: "manual",
            items: {
                create: {
                    productId: productId,
                    price: 0
                }
            }
        }
    })

    // Generate license key
    await db.licenseKey.create({
        data: {
            key: generateLicenseKey(),
            productId: productId,
            userId: customerId,
            orderId: order.id,
            status: "ACTIVE"
        }
    })

    revalidatePath(`/admin/customers/${customerId}`)
}

export async function updateLicense(formData: FormData) {
    const session = await auth()

    // @ts-ignore
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    const id = formData.get("id") as string
    const status = formData.get("status") as string
    const customerId = formData.get("customerId") as string

    if (!id || !status || !customerId) {
        throw new Error("Missing required fields")
    }

    await db.licenseKey.update({
        where: { id },
        data: { status }
    })

    revalidatePath(`/admin/customers/${customerId}`)
}
