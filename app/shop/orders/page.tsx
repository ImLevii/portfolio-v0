
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
            items: {
                include: {
                    product: true,
                },
            },
            licenseKeys: {
                include: {
                    product: true,
                }
            }
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
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm text-gray-400">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className={`text-xs ${order.status === 'completed' ? 'text-green-500' : 'text-yellow-500'}`}>
                                                {order.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                    {order.items.map((item) => {
                                        // Find corresponding license key for this product in this order
                                        const license = order.licenseKeys.find(lk => lk.productId === item.product.id)
                                        const hasFile = item.product.filePath

                                        return (
                                            <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-lg bg-black/20 border border-gray-800/50 gap-4">
                                                <div className="flex items-center gap-4">
                                                    {item.product.image && (
                                                        <div className="h-12 w-12 rounded-lg overflow-hidden flex-shrink-0">
                                                            <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-white font-orbitron tracking-wide">{item.product.name}</p>
                                                        <p className="text-sm text-gray-400">${(item.price / 100).toFixed(2)}</p>
                                                    </div>
                                                </div>

                                                {hasFile && license ? (
                                                    <a
                                                        href={`/api/download/${license.id}`}
                                                        className="w-full sm:w-auto"
                                                    >
                                                        <Button size="sm" variant="outline" className="w-full sm:w-auto gap-2 border-green-500/30 text-green-400 hover:bg-green-500/20 hover:text-green-300">
                                                            <Download className="h-4 w-4" />
                                                            Download Assets
                                                        </Button>
                                                    </a>
                                                ) : hasFile ? (
                                                    <Button size="sm" variant="outline" disabled className="w-full sm:w-auto gap-2 border-gray-700 text-gray-500 cursor-not-allowed">
                                                        <Download className="h-4 w-4" />
                                                        Processing License...
                                                    </Button>
                                                ) : null}
                                            </div>
                                        )
                                    })}
                                    <div className="pt-4 border-t border-gray-800 flex justify-end">
                                        <p className="text-lg font-bold text-green-500 font-orbitron">
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
