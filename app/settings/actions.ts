"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

export async function updateProfile(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const image = formData.get("image") as string

    await db.user.update({
        where: { id: session.user.id },
        data: {
            name,
            email,
            image,
        },
    })

    revalidatePath("/settings")
    return { success: "Profile updated successfully!" }
}

export async function updatePassword(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    const currentPassword = formData.get("currentPassword") as string
    const newPassword = formData.get("newPassword") as string

    if (!currentPassword || !newPassword) {
        throw new Error("Missing fields")
    }

    const user = await db.user.findUnique({
        where: { id: session.user.id },
    })

    if (!user || !user.password) {
        throw new Error("User not found or uses OAuth")
    }

    const passwordsMatch = await bcrypt.compare(currentPassword, user.password)

    if (!passwordsMatch) {
        throw new Error("Incorrect current password")
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await db.user.update({
        where: { id: session.user.id },
        data: {
            password: hashedPassword,
        },
    })

    return { success: "Password updated successfully!" }
}
