"use client"

import { useState } from "react"
import { PaymentMethod } from "@prisma/client"
import { updatePaymentMethod } from "@/app/admin/settings/payments/actions"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"

interface PaymentMethodCardProps {
    method: PaymentMethod
}

const safeParseConfig = (jsonString: string) => {
    try {
        return JSON.parse(jsonString || "{}");
    } catch {
        return {};
    }
};

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
        <div className="p-6 rounded-2xl glass-panel border border-gray-800/60 bg-black/40 space-y-6 hover:border-gray-700/60 transition-colors">
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
                        className="data-[state=checked]:bg-emerald-500"
                    />
                </div>
            </div>

            {(method.name === "bank_transfer" || method.name === "paypal" || method.name === "crypto") && (
                <div className="space-y-4 pt-4 border-t border-white/10">
                    {method.name === "paypal" ? (
                        <>
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Environment Mode</label>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => {
                                                const currentConfig = safeParseConfig(config)
                                                const newConfig = { ...currentConfig, mode: "sandbox" }
                                                setConfig(JSON.stringify(newConfig, null, 2))
                                            }}
                                            className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all border ${safeParseConfig(config).mode === "sandbox"
                                                ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.2)]"
                                                : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                                }`}
                                        >
                                            SANDBOX
                                        </button>
                                        <button
                                            onClick={() => {
                                                const currentConfig = safeParseConfig(config)
                                                const newConfig = { ...currentConfig, mode: "live" }
                                                setConfig(JSON.stringify(newConfig, null, 2))
                                            }}
                                            className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all border ${safeParseConfig(config).mode !== "sandbox" // Default to live if undefined/other
                                                ? "bg-green-500/20 border-green-500/50 text-green-300 shadow-[0_0_10px_rgba(34,197,94,0.2)]"
                                                : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                                }`}
                                        >
                                            LIVE
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Client ID</label>
                                    <input
                                        type="text"
                                        value={safeParseConfig(config).clientId || ""}
                                        onChange={(e) => {
                                            const currentConfig = safeParseConfig(config)
                                            const newConfig = { ...currentConfig, clientId: e.target.value }
                                            setConfig(JSON.stringify(newConfig, null, 2))
                                        }}
                                        className="w-full bg-black/50 border border-gray-700/50 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-mono shadow-inner"
                                        placeholder="Enter PayPal Client ID"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Client Secret</label>
                                    <input
                                        type="password"
                                        value={safeParseConfig(config).clientSecret || ""}
                                        onChange={(e) => {
                                            const currentConfig = safeParseConfig(config)
                                            const newConfig = { ...currentConfig, clientSecret: e.target.value }
                                            setConfig(JSON.stringify(newConfig, null, 2))
                                        }}
                                        className="w-full bg-black/50 border border-gray-700/50 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-mono shadow-inner"
                                        placeholder="Enter PayPal Client Secret"
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <label className="text-sm font-medium text-gray-300">
                                {method.name === "crypto"
                                    ? "Wallet Addresses (JSON or Text)"
                                    : "Bank Details & Instructions (JSON)"}
                            </label>
                            <Textarea
                                value={config}
                                onChange={(e) => setConfig(e.target.value)}
                                className="font-mono text-sm bg-black/50 border-white/10 min-h-[150px]"
                                placeholder={method.name === "crypto"
                                    ? '{"BTC": "...", "ETH": "..."}'
                                    : '{"bankName": "...", "accountNumber": "..."}'}
                            />
                        </>
                    )}

                    <div className="flex justify-end pt-2">
                        <Button
                            onClick={handleSaveConfig}
                            disabled={loading}
                            size="sm"
                            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] border-0"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Config
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
