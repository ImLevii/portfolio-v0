import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function GET(
    req: Request,
    { params }: { params: { filename: string } }
) {
    try {
        const { filename } = params

        // Security check: prevent directory traversal
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            return new NextResponse("Invalid filename", { status: 400 })
        }

        const filePath = join(process.cwd(), "storage", "chat", filename)

        if (!existsSync(filePath)) {
            return new NextResponse("File not found", { status: 404 })
        }

        const fileBuffer = await readFile(filePath)

        // Determine content type
        let contentType = "application/octet-stream"
        const ext = filename.split('.').pop()?.toLowerCase()

        if (ext === 'jpg' || ext === 'jpeg') contentType = "image/jpeg"
        else if (ext === 'png') contentType = "image/png"
        else if (ext === 'gif') contentType = "image/gif"
        else if (ext === 'webp') contentType = "image/webp"
        else if (ext === 'mp4') contentType = "video/mp4"
        else if (ext === 'webm') contentType = "video/webm"

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable"
            }
        })

    } catch (error) {
        console.error("Error serving file:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
