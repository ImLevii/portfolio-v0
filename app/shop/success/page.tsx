"use client"

import Link from "next/link"
import { CheckCircle, Loader2, XCircle } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import useCart from "@/hooks/use-cart"
import { toast } from "sonner"

function SuccessContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const removeAll = useCart((state) => state.removeAll)
    const items = useCart((state) => state.items)
    const [status, setStatus] = useState<"loading" | "success" | "error">("success")
    const [message, setMessage] = useState("Thank you for your purchase. You will receive an email with your digital assets shortly.")

    const method = searchParams.get("method")
    const token = searchParams.get("token") // PayPal Order ID

    useEffect(() => {
        if (method === "paypal" && token) {
            const captureOrder = async () => {
                setStatus("loading")
                try {
                    const response = await fetch("/api/payment", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            orderID: token,
                        }),
                    })

                    if (!response.ok) {
                        throw new Error("Payment capture failed")
                    }

                    setStatus("success")
                    removeAll()
                    toast.success("Payment successful!")
                } catch (error) {
                    console.error("Capture error:", error)
                    setStatus("error")
                    setMessage("There was an issue capturing your payment. Please contact support.")
                }
            }

            captureOrder()
        } else if (searchParams.get("session_id") || searchParams.get("free")) {
            // Stripe success or Free order
            if (items.length > 0) {
                removeAll()
            }
        } else if (searchParams.get("manual")) {
            // Manual order (Crypto/Bank)
            if (items.length > 0) {
                removeAll()
            }
            setMessage("Your order has been placed successfully! Please ensure you have completed the payment transfer. Your digital assets will be delivered once the payment is confirmed by an administrator.")
        }
    }, [method, token, searchParams, removeAll, items.length])

    if (status === "loading") {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4 text-center">
                <Loader2 className="h-16 w-16 animate-spin text-green-500 mb-4" />
                <h1 className="text-2xl font-bold text-white">Processing Payment...</h1>
            </div>
        )
    }

    if (status === "error") {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4 text-center">
                <div className="mb-8 rounded-full bg-red-500/10 p-6">
                    <XCircle className="h-16 w-16 text-red-500" />
                </div>
                <h1 className="mb-4 text-3xl font-bold text-white">Payment Failed</h1>
                <p className="mb-8 max-w-md text-gray-400">{message}</p>
                <div className="flex gap-4">
                    <Button variant="outline" asChild>
                        <Link href="/shop">Try Again</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4 text-center">
            <div className="mb-8 rounded-full bg-green-500/10 p-6">
                <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h1 className="mb-4 text-3xl font-bold text-white">Payment Successful!</h1>
            <p className="mb-8 max-w-md text-gray-400">{message}</p>
            <div className="flex gap-4">
                <Button asChild>
                    <Link href="/shop">Continue Shopping</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/">Back to Home</Link>
                </Button>
            </div>
        </div>
    )
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-black text-white">Loading...</div>}>
            <SuccessContent />
        </Suspense>
    )
}
