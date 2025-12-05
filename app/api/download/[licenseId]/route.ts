
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { readFile } from "fs/promises"
import { join } from "path"
import { NextResponse } from "next/server"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ licenseId: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { licenseId } = await params

        const license = await db.licenseKey.findUnique({
            where: { id: licenseId },
            include: {
                product: true,
                user: true
            }
        })

        if (!license) {
            return new NextResponse("License not found", { status: 404 })
        }

        // Verify ownership
        if (license.user.email !== session.user.email) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        if (license.status !== "ACTIVE") {
            // Optional: Allow downloading even if revoked? Probably not.
            return new NextResponse("License is not active", { status: 403 })
        }

        if (!license.product.filePath) {
            return new NextResponse("No file associated with this product", { status: 404 })
        }

        const filePath = join(process.cwd(), "storage", "products", license.product.filePath)

        try {
            const fileBuffer = await readFile(filePath)
            // Extract original filename from stored format "timestamp-random-filename.ext"
            // The format is: timestamp-random-filename
            // actually we did: `${uniqueSuffix}-${file.name...}`
            // which is `${Date.now()}-${random}-${file.name...}`
            // So splitting by '-' might be tricky if filename has hyphens.
            // But we can just use the substring after the first two hyphens.

            const parts = license.product.filePath.split('-')
            const originalName = parts.slice(2).join('-')

            return new NextResponse(fileBuffer, {
                headers: {
                    "Content-Disposition": `attachment; filename="${originalName}"`,
                    "Content-Type": "application/octet-stream",
                },
            })
        } catch (error) {
            console.error("File not found on disk:", error)
            return new NextResponse("File not found on server", { status: 404 })
        }

    } catch (error) {
        console.error("Download error:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
