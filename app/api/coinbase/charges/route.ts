import { auth } from "@/auth";
import { db } from "@/lib/db";
import { createCharge } from "@/src/lib/coinbase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { orderId } = body;

        if (!orderId) {
            return new NextResponse("Missing orderId", { status: 400 });
        }

        const order = await db.order.findUnique({
            where: { id: orderId, userId: session.user.id },
            include: { items: { include: { product: true } } },
        });

        if (!order) {
            return new NextResponse("Order not found", { status: 404 });
        }

        if (order.status === "completed") {
            return new NextResponse("Order already completed", { status: 400 });
        }

        // Skip if already has a valid active charge? 
        // For now, allow re-creation or check if existing charge is pending.
        // Simplifying to always create new for now since existing logic handles updates.

        const chargeData = {
            name: `Order #${order.id}`,
            description: `Payment for ${order.items.length} items`,
            pricing_type: "fixed_price" as const,
            local_price: {
                amount: (order.amount / 100).toFixed(2), // amount is in cents
                currency: order.currency.toUpperCase(),
            },
            metadata: {
                orderId: order.id,
                userId: session.user.id || "",
            },
            redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}`,
        };

        const charge = await createCharge(chargeData);

        await db.order.update({
            where: { id: order.id },
            data: {
                coinbaseChargeId: charge.id || charge.code,
                coinbaseStatus: "NEW",
                paymentMethod: "coinbase",
            } as any,
        });

        return NextResponse.json({ hosted_url: charge.hosted_url });
    } catch (error) {
        console.error("[COINBASE_CHARGE_CREATE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
