"use client"

import { ShoppingCart, Trash2, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

import useCart from "@/hooks/use-cart"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

import { getEnabledPaymentMethods } from "@/app/shop/actions"
import { PaymentMethod } from "@prisma/client"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"

export function CartSheet() {
    const cart = useCart()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
    const [paypalError, setPaypalError] = useState<string | null>(null)

    const totalAmount = cart.items.reduce((acc, item) => acc + item.price, 0)
    const formattedTotal = (totalAmount / 100).toFixed(2)
    const isPayPalSelected = selectedMethod === "paypal"
    const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? ""

    useEffect(() => {
        getEnabledPaymentMethods().then((methods) => {
            setPaymentMethods(methods)
            if (methods.length === 0) {
                setSelectedMethod(null)
                return
            }

            setSelectedMethod((prev) => {
                if (prev && methods.some((method) => method.name === prev)) {
                    return prev
                }
                return methods[0].name
            })
        })
    }, [])

    useEffect(() => {
        if (!isPayPalSelected) {
            setPaypalError(null)
        }
    }, [isPayPalSelected])

    const onCheckout = async () => {
        if (!selectedMethod) {
            toast.error("No payment methods are available right now.")
            return
        }

        if (isPayPalSelected) {
            return
        }

        try {
            setLoading(true)
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    productIds: cart.items.map((item) => item.id),
                    paymentMethodId: selectedMethod,
                }),
            })

            const data = await response.json()

            if (data.url) {
                window.location.href = data.url
            } else {
                toast.error("Something went wrong.")
            }
        } catch (error) {
            toast.error("Something went wrong.")
        } finally {
            setLoading(false)
        }
    }

    const createPayPalOrder = (_data: any, actions: any) => {
        setPaypalError(null)
        return actions.order.create({
            purchase_units: [
                {
                    amount: {
                        value: formattedTotal,
                        currency_code: "USD",
                    },
                    description: `Order of ${cart.items.length} item(s)`,
                },
            ],
        })
    }

    const onPayPalApprove = async (data: any, actions: any) => {
        setLoading(true)
        setPaypalError(null)
        try {
            const order = await actions.order?.get()
            const payerName = order?.payer?.name?.given_name || order?.payer?.name?.surname || ""
            const payerEmail = order?.payer?.email_address || ""

            const response = await fetch("/api/payment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: payerName,
                    email: payerEmail,
                    amount: formattedTotal,
                    orderID: data.orderID,
                }),
            })

            if (!response.ok) {
                throw new Error(await response.text())
            }

            toast.success("PayPal payment completed.")
            cart.removeAll()
            router.push("/shop/success?method=paypal")
        } catch (error) {
            console.error("PayPal payment failed:", error)
            setPaypalError("PayPal payment failed. Please try again.")
            toast.error("PayPal payment failed.")
        } finally {
            setLoading(false)
        }
    }

    const onPayPalError = (err: any) => {
        console.error("PayPal error:", err)
        setPaypalError("An error occurred with PayPal. Please try again.")
        toast.error("An error occurred with PayPal.")
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative border-gray-700 bg-gray-900/50 text-white hover:bg-green-500/20 hover:border-green-500/50 hover:text-green-400 transition-all duration-300">
                    <ShoppingCart className="h-5 w-5" />
                    {cart.items.length > 0 && (
                        <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white shadow-lg shadow-green-900/50 animate-pulse">
                            {cart.items.length}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="flex w-full flex-col border-l border-gray-800 bg-black/95 backdrop-blur-xl pr-0 sm:max-w-lg">
                <SheetHeader className="px-1 border-b border-gray-800 pb-4">
                    <SheetTitle className="text-2xl font-bold font-orbitron text-white flex items-center gap-2">
                        <ShoppingCart className="h-6 w-6 text-green-500" />
                        Your Cart ({cart.items.length})
                    </SheetTitle>
                </SheetHeader>
                <ScrollArea className="flex-1 pr-6">
                    {cart.items.length === 0 && (
                        <div className="flex h-full flex-col items-center justify-center space-y-4 py-20 opacity-50">
                            <div className="relative">
                                <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full" />
                                <ShoppingCart className="h-16 w-16 text-gray-400 relative z-10" />
                            </div>
                            <p className="text-xl font-medium text-gray-400 font-orbitron">Your cart is empty</p>
                            <Button variant="link" className="text-green-400 hover:text-green-300" onClick={() => document.querySelector('[data-radix-collection-item]')?.dispatchEvent(new Event('click'))}>
                                Start Shopping
                            </Button>
                        </div>
                    )}
                    <div className="space-y-6 pt-6">
                        {cart.items.map((item) => (
                            <div key={item.id} className="group flex items-center space-x-4 rounded-xl border border-gray-800 bg-gray-900/30 p-3 transition-all hover:border-green-500/30 hover:bg-gray-900/50">
                                <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-700 bg-gray-800">
                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
                                    <div className="flex h-full w-full items-center justify-center relative z-10">
                                        <span className="text-2xl font-bold font-orbitron text-gray-600 group-hover:text-green-500/50 transition-colors">
                                            {item.name.charAt(0)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-1 flex-col space-y-1">
                                    <span className="font-bold font-orbitron text-white group-hover:text-green-400 transition-colors">{item.name}</span>
                                    <span className="text-sm font-medium text-green-500">
                                        ${(item.price / 100).toFixed(2)}
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-gray-500 hover:text-green-500 hover:bg-green-500/10 transition-colors"
                                    onClick={() => cart.removeItem(item.id)}
                                >
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                {cart.items.length > 0 && (
                    <div className="space-y-6 pr-6 pt-6 pb-6 bg-gradient-to-t from-black via-black to-transparent">
                        <Separator className="bg-gray-800" />

                        {paymentMethods.length > 0 && (
                            <div className="space-y-3">
                                <Label className="text-gray-400">Payment Method</Label>
                                <RadioGroup value={selectedMethod ?? ""} onValueChange={setSelectedMethod} className="grid gap-2">
                                    {paymentMethods.map((method) => (
                                        <div key={method.id} className="flex items-center space-x-2 rounded-lg border border-gray-800 bg-gray-900/50 p-3 hover:border-green-500/30 transition-colors">
                                            <RadioGroupItem value={method.name} id={method.name} className="border-gray-600 text-green-500" />
                                            <Label htmlFor={method.name} className="flex-1 cursor-pointer text-white font-medium">
                                                {method.displayName}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <span className="text-lg font-medium text-gray-400">Total</span>
                            <span className="text-2xl font-bold font-orbitron text-white">${formattedTotal}</span>
                        </div>
                        {isPayPalSelected ? (
                            paypalClientId ? (
                                <div className="space-y-3">
                                    {paypalError && (
                                        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                                            {paypalError}
                                        </div>
                                    )}
                                    <PayPalScriptProvider
                                        options={{
                                            clientId: paypalClientId,
                                            currency: "USD",
                                            intent: "capture",
                                            components: "buttons",
                                        }}
                                    >
                                        <PayPalButtons
                                            createOrder={createPayPalOrder}
                                            onApprove={onPayPalApprove}
                                            onError={onPayPalError}
                                            style={{ layout: "vertical" }}
                                            disabled={loading}
                                        />
                                    </PayPalScriptProvider>
                                </div>
                            ) : (
                                <div className="rounded-md border border-yellow-500/40 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-200">
                                    PayPal client ID is not configured.
                                </div>
                            )
                        ) : (
                            <Button
                                onClick={onCheckout}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-gray-800/60 to-gray-900/60 border border-gray-700/40 backdrop-blur-sm hover:bg-gray-800/80 transition-all duration-300 shadow-lg group py-6"
                                style={{
                                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.3)'
                                }}
                            >
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600 font-orbitron tracking-wider text-lg group-hover:from-green-300 group-hover:to-emerald-500">
                                    {loading ? "Processing..." : "CHECKOUT"}
                                </span>
                            </Button>
                        )}
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}
