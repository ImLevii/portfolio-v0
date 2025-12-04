import Link from "next/link"
import { CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function SuccessPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4 text-center">
            <div className="mb-8 rounded-full bg-green-500/10 p-6">
                <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h1 className="mb-4 text-3xl font-bold text-white">Payment Successful!</h1>
            <p className="mb-8 max-w-md text-gray-400">
                Thank you for your purchase. You will receive an email with your digital assets shortly.
            </p>
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
