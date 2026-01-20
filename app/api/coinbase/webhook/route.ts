import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyWebhookSignature } from "@/src/lib/coinbase-webhook";
import { generateLicenseKey } from "@/lib/license";

export async function POST(req: Request) {
    const rawBody = await req.text();
    const signature = req.headers.get("x-cc-webhook-signature");

    if (!signature) {
        return new NextResponse("Missing signature", { status: 400 });
    }

    try {
        const isValid = await verifyWebhookSignature(rawBody, signature);
        if (!isValid) {
            console.error("[COINBASE_WEBHOOK] Invalid signature");
            return new NextResponse("Invalid signature", { status: 401 });
        }

        const event = JSON.parse(rawBody);
        const { type, data } = event;
        const charge = data;
        const { orderId, userId } = charge.metadata || {};

        console.log(`[COINBASE_WEBHOOK] Received event: ${type} for charge ${charge.id}`);

        if (type === "charge:confirmed" || type === "charge:resolved") {
            if (!orderId) {
                console.error("[COINBASE_WEBHOOK] Missing orderId in metadata");
                return new NextResponse("Missing orderId", { status: 200 }); // Return 200 to stop retry
            }

            const order = await db.order.findUnique({
                where: { id: orderId },
                include: { items: true },
            });

            if (!order) {
                console.error(`[COINBASE_WEBHOOK] Order ${orderId} not found`);
                return new NextResponse("Order not found", { status: 200 });
            }

            // Idempotency: skip if already completed
            if (order.status === "completed") {
                console.log(`[COINBASE_WEBHOOK] Order ${orderId} already completed`);
                return new NextResponse("Already completed", { status: 200 });
            }

            // 1. Update Order Status
            await db.order.update({
                where: { id: orderId },
                data: {
                    status: "completed",
                    coinbaseStatus: "COMPLETED", // or RESOLVED
                    paymentMethod: "coinbase",
                },
            });

            // 2. Generate License Keys & Decrement Stock 
            // (Logic replicated from stripe webhook)
            for (const item of order.items) {
                const product = await db.product.findUnique({ where: { id: item.productId } });
                const expiresAt = product?.duration ? new Date(Date.now() + product.duration * 24 * 60 * 60 * 1000) : null;

                await db.licenseKey.create({
                    data: {
                        key: generateLicenseKey(),
                        productId: item.productId,
                        userId: order.userId,
                        orderId: order.id,
                        status: "ACTIVE",
                        expiresAt: expiresAt
                    }
                });

                // Decrement Stock
                await db.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            decrement: 1
                        }
                    }
                }).catch(err => console.error(`Failed to decrement stock for product ${item.productId}:`, err));
            }


            console.log(`[COINBASE_WEBHOOK] Order ${orderId} completed successfully`);
        } else if (type === "charge:failed" || type === "charge:delayed") {
            if (orderId) {
                await db.order.update({
                    where: { id: orderId },
                    data: {
                        coinbaseStatus: type === "charge:failed" ? "FAILED" : "DELAYED",
                    }
                });
            }
        }

        return new NextResponse("OK", { status: 200 });
    } catch (error) {
        console.error("[COINBASE_WEBHOOK] Error processing webhook:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
