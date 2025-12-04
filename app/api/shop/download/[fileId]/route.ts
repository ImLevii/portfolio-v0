
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
    req: Request,
    { params }: { params: { fileId: string } }
) {
    const session = await auth()

    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    // Verify user has purchased the product
    const order = await db.order.findFirst({
        where: {
            userId: session.user.id,
            items: {
                some: {
                    productId: params.fileId
                }
            }
        }
    })

    if (!order) {
        return new NextResponse("Forbidden", { status: 403 })
    }

    // In a real app, you would serve the file from S3 or similar
    // For now, we'll just return a mock success response
    return new NextResponse(`Simulating download for product ${params.fileId}...`, {
        headers: {
            "Content-Disposition": `attachment; filename="${params.fileId}.zip"`,
        },
    })
}
