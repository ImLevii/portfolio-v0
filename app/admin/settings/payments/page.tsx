import { getPaymentMethods, updatePaymentMethod } from "./actions"
import { PaymentMethodCard } from "@/components/admin/payment-method-card"

export default async function PaymentSettingsPage() {
    const methods = await getPaymentMethods()

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-4xl font-bold font-orbitron text-white">Payment Settings</h1>
            </div>

            <div className="grid gap-6">
                {methods.map((method) => (
                    <PaymentMethodCard key={method.id} method={method} />
                ))}
            </div>
        </div>
    )
}
