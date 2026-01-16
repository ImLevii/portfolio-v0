"use client"

import { ShoppingCart, Trash2, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

import useCart from "@/hooks/use-cart"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { showTerminalToast } from "@/components/global/terminal-toast"

import { getEnabledPaymentMethods, validateCoupon } from "@/app/shop/actions"
import { PaymentMethod } from "@prisma/client"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export function CartPopover({ user }: { user?: any }) {
    const cart = useCart()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
    const [paypalError, setPaypalError] = useState<string | null>(null)

    const [isOpen, setIsOpen] = useState(false)

    // Coupon State
    const [couponCode, setCouponCode] = useState("")
    const [couponError, setCouponError] = useState<string | null>(null)
    const [validatingCoupon, setValidatingCoupon] = useState(false)
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string, percent: number | null, amount: number | null } | null>(null)

    const totalAmount = cart.items.reduce((acc, item) => acc + item.price, 0)


    // Calculate Discount
    let discountAmount = 0
    if (appliedCoupon && appliedCoupon.percent) {
        discountAmount = (totalAmount * appliedCoupon.percent) / 100
    }
    // TODO: Handle fixed amount coupons if implemented

    const finalTotal = Math.max(0, totalAmount - discountAmount)
    const formattedTotal = (finalTotal / 100).toFixed(2)
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

    const onApplyCoupon = async () => {
        if (!couponCode) return
        setValidatingCoupon(true)
        setCouponError(null)

        try {
            const result = await validateCoupon(couponCode)
            if (result.error) {
                setCouponError(result.error)
                setAppliedCoupon(null)
            } else if (result.coupon) {
                setAppliedCoupon(result.coupon)
                showTerminalToast.success("Coupon Applied", "Discount has been applied to your cart.")
            }
        } catch (error) {
            setCouponError("Failed to apply coupon")
        } finally {
            setValidatingCoupon(false)
        }
    }

    const onCheckout = async () => {
        if (!user) {
            showTerminalToast.error("Sign In Required", "Please sign in to checkout.")
            router.push("/auth/signin")
            setIsOpen(false)
            return
        }

        if (!selectedMethod) {
            showTerminalToast.error("Payment Method", "No payment methods are available right now.")
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
                    couponCode: appliedCoupon?.code
                }),
            })

            const data = await response.json()

            if (data.url) {
                window.location.href = data.url
            } else {
                console.error("Checkout failed:", data)
                const errorMessage = data.details
                    ? `${data.error}: ${data.details}`
                    : data.error || "Something went wrong."
                showTerminalToast.error("Checkout Failed", errorMessage)
            }
        } catch (error) {
            showTerminalToast.error("System Error", "Something went wrong during checkout.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <button className="flex items-center justify-center gap-0 sm:gap-3 px-2 sm:px-3 py-1.5 rounded-md bg-gradient-to-r from-gray-800/60 to-gray-900/60 border border-gray-700/40 backdrop-blur-sm hover:bg-gray-800/80 transition-all duration-300 cursor-pointer group font-bold text-base text-white relative shadow-lg min-w-[32px] sm:min-w-0"
                    style={{
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.3)'
                    }}
                >
                    <ShoppingCart className="h-5 w-5 text-green-500" />
                    <span
                        className="hidden sm:inline relative z-10 uppercase font-bold tracking-wider text-xs font-orbitron"
                        style={{
                            color: '#22c55e',
                            textShadow: '0 0 8px rgba(34,197,94,0.8)',
                            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                        }}
                    >
                        Cart
                    </span>
                    {cart.items.length > 0 && (
                        <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white shadow-lg shadow-green-900/50 animate-pulse">
                            {cart.items.length}
                        </span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 sm:w-96 p-0 border-gray-800 bg-black/95 backdrop-blur-xl shadow-2xl" align="end">
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <h3 className="font-bold font-orbitron text-white flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-green-500" />
                        Your Cart ({cart.items.length})
                    </h3>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-500 hover:text-white" onClick={() => setIsOpen(false)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <ScrollArea className="h-[300px] p-4">
                    {cart.items.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center space-y-4 py-10 opacity-50">
                            <ShoppingCart className="h-12 w-12 text-gray-400" />
                            <p className="text-sm font-medium text-gray-400 font-orbitron">Your cart is empty</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cart.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-3 group">
                                    <div className="relative h-12 w-12 overflow-hidden rounded-md border border-gray-700 bg-gray-800 flex-shrink-0">
                                        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
                                        <div className="flex h-full w-full items-center justify-center relative z-10">
                                            <span className="text-lg font-bold font-orbitron text-gray-600 group-hover:text-green-500/50 transition-colors">
                                                {item.name.charAt(0)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold font-orbitron text-white truncate group-hover:text-green-400 transition-colors">{item.name}</p>
                                        <p className="text-xs font-medium text-green-500">
                                            ${(item.price / 100).toFixed(2)}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                        onClick={() => cart.removeItem(item.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {cart.items.length > 0 && (
                    <div className="p-4 bg-gradient-to-t from-black via-black to-transparent border-t border-gray-800">
                        {paymentMethods.length > 0 && (
                            <div className="mb-4">
                                <Label className="text-xs text-gray-400 mb-2 block">Payment Method</Label>
                                <RadioGroup value={selectedMethod ?? ""} onValueChange={setSelectedMethod} className="grid grid-cols-2 gap-2">
                                    {paymentMethods.map((method) => (
                                        <div key={method.id} className="flex items-center space-x-2 rounded border border-gray-800 bg-gray-900/50 p-2 hover:border-green-500/30 transition-colors">
                                            <RadioGroupItem value={method.name} id={`popover-${method.name}`} className="border-gray-600 text-green-500 h-3 w-3" />
                                            <Label htmlFor={`popover-${method.name}`} className="cursor-pointer text-white text-xs font-medium truncate">
                                                {method.displayName}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                        )}

                        <div className="mb-4 space-y-2">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Coupon Code"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    className="flex-1 bg-gray-900 border border-gray-700 rounded-md px-3 py-1 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onApplyCoupon}
                                    disabled={validatingCoupon || !couponCode || appliedCoupon !== null}
                                    className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
                                >
                                    {validatingCoupon ? "..." : appliedCoupon ? "Applied" : "Apply"}
                                </Button>
                            </div>
                            {couponError && (
                                <p className="text-xs text-red-400">{couponError}</p>
                            )}
                            {appliedCoupon && (
                                <div className="flex justify-between text-xs text-green-400">
                                    <span>Discount ({appliedCoupon.percent}% off)</span>
                                    <span>-${(discountAmount / 100).toFixed(2)}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-gray-400">Total</span>
                            <span className="text-xl font-bold font-orbitron text-white">${formattedTotal}</span>
                        </div>

                        {isPayPalSelected ? (
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 blur-lg rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                {paypalError && (
                                    <div className="mb-2 rounded-md border border-red-500/40 bg-red-500/10 px-2 py-1 text-xs text-red-300">
                                        {paypalError}
                                    </div>
                                )}
                                <button
                                    onClick={onCheckout}
                                    disabled={loading}
                                    className="relative w-full h-auto overflow-hidden rounded-md transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed bg-transparent"
                                >
                                    <img
                                        src="/paypal-button.png"
                                        alt="Pay with PayPal"
                                        className="w-full h-auto object-contain"
                                    />
                                </button>
                            </div>
                        ) : (
                            <Button
                                onClick={onCheckout}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-gray-800/60 to-gray-900/60 border border-gray-700/40 backdrop-blur-sm hover:bg-gray-800/80 transition-all duration-300 shadow-lg group h-10"
                                style={{
                                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.3)'
                                }}
                            >
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600 font-orbitron tracking-wider text-sm font-bold group-hover:from-green-300 group-hover:to-emerald-500">
                                    {loading ? "PROCESSING..." : "CHECKOUT"}
                                </span>
                            </Button>
                        )}
                    </div>
                )}
            </PopoverContent>
        </Popover>
    )
}
