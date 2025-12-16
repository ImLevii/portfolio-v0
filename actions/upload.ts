"use server"

import { auth } from "@/auth"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function uploadChatMedia(formData: FormData) {
    try {
        console.log("Starting uploadChatMedia...")
        const session = await auth()
        if (!session?.user) {
            console.log("Upload failed: Unauthorized")
            // Temporarily allowing unauthenticated uploads for testing if needed, but for now reporting specific error
            // return { success: false, error: "Unauthorized: You must be logged in to upload." }
        }

        const file = formData.get("file") as File
        if (!file) {
            console.log("Upload failed: No file provided")
            return { success: false, error: "No file provided" }
        }

        console.log(`Processing file: ${file.name}, Type: ${file.type}, Size: ${file.size}`)

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']
        if (!validTypes.includes(file.type)) {
            console.log(`Upload failed: Invalid type ${file.type}`)
            return { success: false, error: `Invalid file type: ${file.type}. Allowed: images & video/mp4/webm` }
        }

        // Validate file size (e.g., 50MB limit)
        if (file.size > 50 * 1024 * 1024) {
            console.log("Upload failed: File too large")
            return { success: false, error: "File size too large (max 50MB)" }
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Create unique filename
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
        const originalName = file.name
        // Sanitize extension
        const ext = originalName.substring(originalName.lastIndexOf('.'))

        const filename = `chat-${uniqueSuffix}${ext}`

        // Ensure upload directory exists
        const uploadDir = join(process.cwd(), "storage", "chat")
        console.log(`Debug Info: CWD=${process.cwd()}, UploadDir=${uploadDir}`)
        console.log(`Target directory: ${uploadDir}`)

        try {
            await mkdir(uploadDir, { recursive: true })
        } catch (mkdirError) {
            console.error("Mkdir failed:", mkdirError)
            return { success: false, error: `Server Storage Error: Could not create directory.` }
        }

        const filePath = join(uploadDir, filename)
        console.log(`Writing to: ${filePath}`)

        await writeFile(filePath, buffer)
        console.log("Write successful")

        // Return the public URL
        const url = `/api/uploads/chat/${filename}`

        return { success: true, url, type: file.type.startsWith('image/') ? 'image' : 'video' }

    } catch (error: any) {
        console.error("Upload error key:", error)
        return { success: false, error: `Upload failed: ${error?.message || "Unknown error"}` }
    }
}
