"use client"

import { PayPalScriptProvider } from "@paypal/react-paypal-js"
import type { ReactNode } from "react"

interface PaypalProviderProps {
    children: ReactNode
}

export function PaypalProvider({ children }: PaypalProviderProps) {
    return (
        <PayPalScriptProvider
            options={{
                clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
                currency: "USD",
                intent: "capture",
            }}
        >
            {children}
        </PayPalScriptProvider>
    )
}

