"use client"

import { useState } from "react"
import { saveRoles } from "@/actions/roles"
import { RoleDefinition, AVAILABLE_PERMISSIONS } from "@/lib/roles"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { showTerminalToast } from "@/components/global/terminal-toast"
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
                showTerminalToast.success("Roles updated successfully")
            } else {
                showTerminalToast.error(res.error || "Failed to update roles")
            }
        } catch (error) {
            showTerminalToast.error("An error occurred")
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
            </div>

            <div className="grid gap-6">
                {roles.map((role, index) => (
                    <Card key={role.key} className="border-cyan-500/20 bg-black/40 backdrop-blur-md relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        <CardHeader className="pb-3 relative z-10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="h-10 w-10 rounded-xl flex items-center justify-center border shadow-lg transition-transform group-hover:scale-105"
                                        style={{
                                            backgroundColor: `${role.color}10`,
                                            borderColor: `${role.color}30`,
                                            color: role.color,
                                            boxShadow: `0 0 15px ${role.color}15`
                                        }}
                                    >
                                        <Shield className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-orbitron tracking-wide text-white">{role.name}</CardTitle>
                                        <CardDescription className="text-xs font-mono opacity-70">Key: {role.key}</CardDescription>
                                    </div>
                                </div>
                                {role.key !== "ADMIN" && role.key !== "CUSTOMER" && (
                                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="grid gap-6 relative z-10">
                            {/* Visual Settings */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs text-gray-400 uppercase tracking-wider">Display Name</Label>
                                    <Input
                                        value={role.name}
                                        onChange={(e) => updateRole(index, "name", e.target.value)}
                                        className="bg-black/50 border-white/10 h-9 text-sm focus:border-cyan-500/50 transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-gray-400 uppercase tracking-wider">Chat Prefix</Label>
                                    <Input
                                        value={role.prefix}
                                        onChange={(e) => updateRole(index, "prefix", e.target.value)}
                                        className="bg-black/50 border-white/10 h-9 text-sm focus:border-cyan-500/50 transition-colors"
                                        placeholder="e.g. [Mod]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-gray-400 uppercase tracking-wider">Badge Color (Hex)</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={role.color}
                                            onChange={(e) => updateRole(index, "color", e.target.value)}
                                            className="bg-black/50 border-white/10 h-9 text-sm font-mono focus:border-cyan-500/50 transition-colors"
                                        />
                                        <div
                                            className="h-9 w-9 rounded border border-white/10 shrink-0 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                                            style={{ backgroundColor: role.color, borderColor: role.color }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Permissions */}
                            <div className="space-y-3 pt-2 border-t border-white/5">
                                <Label className="text-xs text-gray-400 uppercase tracking-wider">Permissions</Label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {AVAILABLE_PERMISSIONS.map((perm) => (
                                        <div
                                            key={perm.key}
                                            className={`flex items-center space-x-2 p-2 rounded border transition-all duration-300 ${role.permissions.includes(perm.key) || role.permissions.includes("all")
                                                ? "bg-cyan-500/10 border-cyan-500/30"
                                                : "bg-white/5 border-white/5"
                                                }`}
                                        >
                                            <Checkbox
                                                id={`${role.key}-${perm.key}`}
                                                checked={role.permissions.includes(perm.key) || role.permissions.includes("all")}
                                                disabled={role.permissions.includes("all") && perm.key !== "all"}
                                                onCheckedChange={() => togglePermission(index, perm.key)}
                                                className="border-white/20 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                                            />
                                            <label
                                                htmlFor={`${role.key}-${perm.key}`}
                                                className={`text-xs font-medium leading-none cursor-pointer ${role.permissions.includes(perm.key) || role.permissions.includes("all")
                                                    ? "text-cyan-100"
                                                    : "text-gray-400"
                                                    }`}
                                            >
                                                {perm.label}
                                            </label>
                                        </div>
                                    ))}
                                    <div className={`flex items-center space-x-2 p-2 rounded border transition-all duration-300 ${role.permissions.includes("all")
                                        ? "bg-red-500/10 border-red-500/30"
                                        : "bg-red-500/5 border-red-500/10"
                                        }`}>
                                        <Checkbox
                                            id={`${role.key}-all`}
                                            checked={role.permissions.includes("all")}
                                            onCheckedChange={() => togglePermission(index, "all")}
                                            className="border-red-500/50 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                                        />
                                        <label
                                            htmlFor={`${role.key}-all`}
                                            className="text-xs font-bold leading-none text-red-400 cursor-pointer"
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

            <div className="flex gap-4 pt-4 border-t border-white/5">
                <Button
                    variant="outline"
                    className="flex-1 border-dashed border-white/10 hover:bg-white/5 hover:border-cyan-500/50 text-gray-400 hover:text-cyan-400 h-12"
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

                <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex-1 h-12 bg-[#0a0a0a] border border-white/10 hover:bg-neutral-900 text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] rounded-xl group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin text-cyan-500" />
                            <span className="font-orbitron font-bold tracking-wider text-cyan-500">SAVING...</span>
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-5 w-5 text-cyan-500 group-hover:text-cyan-400 group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-all" />
                            <span className="font-orbitron font-bold tracking-wider text-cyan-500 group-hover:text-cyan-400 group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.6)] transition-all">
                                SAVE CONFIGURATION
                            </span>
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
