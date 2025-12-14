"use client"

import { useState } from "react"
import { PaymentMethod } from "@prisma/client"
import { updatePaymentMethod } from "@/app/admin/settings/payments/actions"
import { Switch } from "@/components/ui/switch"
import { TechButton } from "@/components/ui/tech-button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"

interface PaymentMethodCardProps {
    method: PaymentMethod
}

export function PaymentMethodCard({ method }: PaymentMethodCardProps) {
    const [isEnabled, setIsEnabled] = useState(method.isEnabled)
    const [config, setConfig] = useState(method.config || "")
    const [loading, setLoading] = useState(false)

    const handleToggle = async (checked: boolean) => {
        setIsEnabled(checked)
        setLoading(true)
        try {
            const result = await updatePaymentMethod(method.id, { isEnabled: checked })
            if (result.success) {
                toast.success(`${method.displayName} ${checked ? "enabled" : "disabled"}`)
            } else {
                setIsEnabled(!checked) // Revert
                toast.error("Failed to update status")
            }
        } catch (error) {
            setIsEnabled(!checked)
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    const handleSaveConfig = async () => {
        setLoading(true)
        try {
            const result = await updatePaymentMethod(method.id, { config })
            if (result.success) {
                toast.success("Configuration saved")
            } else {
                toast.error("Failed to save configuration")
            }
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-white">{method.displayName}</h3>
                    <p className="text-sm text-gray-400">
                        {method.name === "stripe"
                            ? "Configure Stripe payments"
                            : method.name === "paypal"
                                ? "Configure PayPal settings"
                                : method.name === "crypto"
                                    ? "Configure manual crypto wallet addresses"
                                    : "Configure manual bank transfer details"}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${isEnabled ? "text-green-400" : "text-gray-500"}`}>
                        {isEnabled ? "Enabled" : "Disabled"}
                    </span>
                    <Switch
                        checked={isEnabled}
                        onCheckedChange={handleToggle}
                        disabled={loading}
                        className="data-[state=checked]:bg-green-500"
                    />
                </div>
            </div>

            {(method.name === "bank_transfer" || method.name === "paypal" || method.name === "crypto") && (
                <div className="space-y-2 pt-4 border-t border-white/10">
                    <label className="text-sm font-medium text-gray-300">
                        {method.name === "paypal"
                            ? "PayPal Credentials (JSON)"
                            : method.name === "crypto"
                                ? "Wallet Addresses (JSON or Text)"
                                : "Bank Details & Instructions (JSON)"}
                    </label>
                    <Textarea
                        value={config}
                        onChange={(e) => setConfig(e.target.value)}
                        className="font-mono text-sm bg-black/50 border-white/10 min-h-[150px]"
                        placeholder={method.name === "paypal"
                            ? '{"clientId": "...", "clientSecret": "...", "mode": "sandbox"}'
                            : method.name === "crypto"
                                ? '{"BTC": "...", "ETH": "..."}'
                                : '{"bankName": "...", "accountNumber": "..."}'}
                    />
                    <div className="flex justify-end">
                        <TechButton
                            onClick={handleSaveConfig}
                            disabled={loading}
                            size="sm"
                            glowColor="emerald"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Save Config
                        </TechButton>
                    </div>
                </div>
            )}
        </div>
    )
}
