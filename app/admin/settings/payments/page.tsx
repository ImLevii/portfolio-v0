import { CreditCard } from "lucide-react"
import { getPaymentMethods } from "./actions"
import { PaymentMethodCard } from "@/components/admin/payment-method-card"
import { AdminPageHeader } from "@/components/admin/admin-page-header"

export default async function PaymentSettingsPage() {
    const methods = await getPaymentMethods()

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Payment Settings"
                description="Enable payment methods and configure how customers pay."
                icon={CreditCard}
            />

            <div className="grid gap-6">
                {methods.map((method) => (
                    <PaymentMethodCard key={method.id} method={method} />
                ))}
            </div>
        </div>
    )
}
