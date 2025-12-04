
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function OrdersPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/api/auth/signin")
    }

    const orders = await db.order.findMany({
        where: {
            userId: session.user.id,
        },
        include: {
            items: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    })

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 text-white pt-24 pb-12">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold font-orbitron mb-8 text-green-400">My Orders</h1>

                {orders.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <p>You haven't purchased any items yet.</p>
                        <Button asChild className="mt-4 bg-green-600 hover:bg-green-700">
                            <Link href="/shop">Browse Shop</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <Card key={order.id} className="border-gray-800 bg-gray-900/40 backdrop-blur-sm">
                                <CardHeader className="border-b border-gray-800 pb-4">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-lg font-orbitron text-white">
                                            Order #{order.id.slice(-6)}
                                        </CardTitle>
                                        <span className="text-sm text-gray-400">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium text-white">Product ID: {item.productId}</p>
                                                <p className="text-sm text-gray-400">${(item.price / 100).toFixed(2)}</p>
                                            </div>
                                            <Button size="sm" variant="outline" className="gap-2 border-green-500/30 text-green-400 hover:bg-green-500/20">
                                                <Download className="h-4 w-4" />
                                                Download
                                            </Button>
                                        </div>
                                    ))}
                                    <div className="pt-4 border-t border-gray-800 flex justify-end">
                                        <p className="text-lg font-bold text-green-500">
                                            Total: ${(order.amount / 100).toFixed(2)}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
