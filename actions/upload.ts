"use server"

import { auth } from "@/auth"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function uploadChatMedia(formData: FormData) {
    try {
        const session = await auth()
        if (!session?.user) {
            return { success: false, error: "Unauthorized" }
        }

        const file = formData.get("file") as File
        if (!file) {
            return { success: false, error: "No file provided" }
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']
        if (!validTypes.includes(file.type)) {
            return { success: false, error: "Invalid file type. Only images and videos are allowed." }
        }

        // Validate file size (e.g., 50MB limit)
        if (file.size > 50 * 1024 * 1024) {
            return { success: false, error: "File size too large (max 50MB)" }
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Create unique filename
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
        // Get extension from original name or mime type
        const originalName = file.name
        const ext = originalName.substring(originalName.lastIndexOf('.'))

        const filename = `chat-${uniqueSuffix}${ext}`

        // Ensure upload directory exists
        const uploadDir = join(process.cwd(), "storage", "chat")
        await mkdir(uploadDir, { recursive: true })

        const filePath = join(uploadDir, filename)
        await writeFile(filePath, buffer)

        // Return the public URL
        // We'll create an API route to serve these: /api/uploads/chat/[filename]
        const url = `/api/uploads/chat/${filename}`

        return { success: true, url, type: file.type.startsWith('image/') ? 'image' : 'video' }

    } catch (error) {
        console.error("Upload error:", error)
        return { success: false, error: "Failed to upload file" }
    }
}
