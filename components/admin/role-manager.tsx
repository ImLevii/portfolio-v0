"use client"

import { useState } from "react"
import { RoleDefinition, saveRoles, AVAILABLE_PERMISSIONS } from "@/actions/roles"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Loader2, Plus, Trash2, Save, Shield } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

export function RoleManager({ initialRoles }: { initialRoles: RoleDefinition[] }) {
    const [roles, setRoles] = useState<RoleDefinition[]>(initialRoles)
    const [isLoading, setIsLoading] = useState(false)

    // Ensure we always have at least one role being edited or expanded? 
    // For now, simple list.

    const handleSave = async () => {
        setIsLoading(true)
        try {
            const res = await saveRoles(roles)
            if (res.success) {
                toast.success("Roles updated successfully")
            } else {
                toast.error(res.error || "Failed to update roles")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const updateRole = (index: number, field: keyof RoleDefinition, value: any) => {
        const newRoles = [...roles]
        newRoles[index] = { ...newRoles[index], [field]: value }
        setRoles(newRoles)
    }

    const togglePermission = (roleIndex: number, permission: string) => {
        const role = roles[roleIndex]
        const currentPermissions = role.permissions || []
        let newPermissions

        if (currentPermissions.includes("all")) {
            // If it had 'all', breaking it triggers specific permissions? 
            // Or 'all' overrides everything. Let's keep it simple.
            // If toggling something else, we might want to remove 'all' to be specific?
            // For now, let's just treat 'all' as a toggleable permission in the UI for ease, 
            // but the backend logic handles it.
            newPermissions = currentPermissions.includes(permission)
                ? currentPermissions.filter(p => p !== permission)
                : [...currentPermissions, permission]
        } else {
            newPermissions = currentPermissions.includes(permission)
                ? currentPermissions.filter(p => p !== permission)
                : [...currentPermissions, permission]
        }

        updateRole(roleIndex, "permissions", newPermissions)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-orbitron text-white">Role Configuration</h2>
                    <p className="text-sm text-gray-400">Customize role prefixes, colors, and permissions.</p>
                </div>
                <Button onClick={handleSave} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white neon-glow">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Save Roles
                </Button>
            </div>

            <div className="grid gap-6">
                {roles.map((role, index) => (
                    <Card key={role.key} className="bg-black/40 border-white/10 backdrop-blur-md">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="h-8 w-8 rounded-lg flex items-center justify-center border border-white/10"
                                        style={{ backgroundColor: `${role.color}20`, color: role.color }}
                                    >
                                        <Shield className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base font-orbitron">{role.name}</CardTitle>
                                        <CardDescription className="text-xs">Key: {role.key}</CardDescription>
                                    </div>
                                </div>
                                {role.key !== "ADMIN" && role.key !== "CUSTOMER" && (
                                    // Prevent deleting core roles for safety for now
                                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            {/* Visual Settings */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs text-gray-400">Display Name</Label>
                                    <Input
                                        value={role.name}
                                        onChange={(e) => updateRole(index, "name", e.target.value)}
                                        className="bg-black/50 border-white/10 h-8 text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-gray-400">Chat Prefix</Label>
                                    <Input
                                        value={role.prefix}
                                        onChange={(e) => updateRole(index, "prefix", e.target.value)}
                                        className="bg-black/50 border-white/10 h-8 text-sm"
                                        placeholder="e.g. [Mod]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-gray-400">Badge Color (Hex)</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={role.color}
                                            onChange={(e) => updateRole(index, "color", e.target.value)}
                                            className="bg-black/50 border-white/10 h-8 text-sm font-mono"
                                        />
                                        <div
                                            className="h-8 w-8 rounded border border-white/10 shrink-0"
                                            style={{ backgroundColor: role.color }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Permissions */}
                            <div className="space-y-2">
                                <Label className="text-xs text-gray-400">Permissions</Label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {AVAILABLE_PERMISSIONS.map((perm) => (
                                        <div key={perm.key} className="flex items-center space-x-2 bg-white/5 p-2 rounded border border-white/5">
                                            <Checkbox
                                                id={`${role.key}-${perm.key}`}
                                                checked={role.permissions.includes(perm.key) || role.permissions.includes("all")}
                                                disabled={role.permissions.includes("all") && perm.key !== "all"}
                                                onCheckedChange={() => togglePermission(index, perm.key)}
                                                className="border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                            />
                                            <label
                                                htmlFor={`${role.key}-${perm.key}`}
                                                className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-300"
                                            >
                                                {perm.label}
                                            </label>
                                        </div>
                                    ))}
                                    <div className="flex items-center space-x-2 bg-red-500/10 p-2 rounded border border-red-500/20">
                                        <Checkbox
                                            id={`${role.key}-all`}
                                            checked={role.permissions.includes("all")}
                                            onCheckedChange={() => togglePermission(index, "all")}
                                            className="border-red-500/50 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                                        />
                                        <label
                                            htmlFor={`${role.key}-all`}
                                            className="text-xs font-bold leading-none text-red-400"
                                        >
                                            Full Administrator
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Button
                variant="outline"
                className="w-full border-dashed border-white/10 hover:bg-white/5 hover:border-emerald-500/50 text-gray-400 hover:text-emerald-400"
                onClick={() => {
                    setRoles([...roles, {
                        key: `ROLE_${roles.length + 1}`,
                        name: "New Role",
                        prefix: "[New]",
                        color: "#9ca3af",
                        permissions: []
                    }])
                }}
            >
                <Plus className="mr-2 h-4 w-4" />
                Add Custom Role
            </Button>
        </div>
    )
}
