"use server"

import { auth } from "@/auth"
import { db as prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

import { DEFAULT_ROLES } from "@/lib/roles"

// Re-export type behavior is problematic in "use server" files for some bundlers
// Consumers should import directly from @/lib/roles


export async function getRoles() {
    try {
        const setting = await prisma.siteSettings.findUnique({
            where: { key: "role-definitions" }
        })

        if (!setting) {
            return DEFAULT_ROLES
        }

        return JSON.parse(setting.value) as RoleDefinition[]
    } catch (error) {
        console.error("Failed to fetch roles:", error)
        return DEFAULT_ROLES
    }
}

export async function saveRoles(roles: RoleDefinition[]) {
    try {
        const session = await auth()
        // @ts-ignore
        if (session?.user?.role !== "ADMIN" && session?.user?.role !== "Admin") {
            return { success: false, error: "Unauthorized" }
        }

        await prisma.siteSettings.upsert({
            where: { key: "role-definitions" },
            update: { value: JSON.stringify(roles) },
            create: { key: "role-definitions", value: JSON.stringify(roles) }
        })

        revalidatePath("/admin/customers")
        revalidatePath("/admin/users") // Just in case
        return { success: true }
    } catch (error) {
        console.error("Failed to save roles:", error)
        return { success: false, error: "Failed to save roles" }
    }
}
