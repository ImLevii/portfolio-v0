"use server"

import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { signIn } from "@/auth"

export async function signUp(formData: FormData) {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string

    if (!email || !password || !name) {
        throw new Error("Missing required fields")
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
        where: { email }
    })

    if (existingUser) {
        throw new Error("User already exists")
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await db.user.create({
        data: {
            email,
            name,
            password: hashedPassword,
        }
    })

    // Auto sign in after sign up
    await signIn("credentials", {
        email,
        password,
        redirectTo: "/"
    })
}
