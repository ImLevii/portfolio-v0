export interface RoleDefinition {
    key: string
    name: string
    prefix: string
    color: string
    permissions: string[]
}

export const DEFAULT_ROLES: RoleDefinition[] = [
    {
        key: "ADMIN",
        name: "Administrator",
        prefix: "[Owner]",
        color: "#ef4444", // Red-500
        permissions: ["all"]
    },
    {
        key: "MODERATOR",
        name: "Moderator",
        prefix: "[Mod]",
        color: "#a855f7", // Purple-500
        permissions: ["view_admin", "manage_chat", "manage_tickets"]
    },
    {
        key: "SUPPORT",
        name: "Support Agent",
        prefix: "[Support]",
        color: "#3b82f6", // Blue-500
        permissions: ["view_admin", "manage_tickets"]
    },
    {
        key: "CUSTOMER",
        name: "Customer",
        prefix: "",
        color: "#10b981", // Emerald-500
        permissions: []
    }
]

export const AVAILABLE_PERMISSIONS = [
    { key: "view_admin", label: "Access Admin Panel" },
    { key: "manage_users", label: "Manage Users & Roles" },
    { key: "manage_products", label: "Manage Products" },
    { key: "manage_orders", label: "Manage Orders" },
    { key: "manage_chat", label: "Moderate Chat" },
    { key: "manage_tickets", label: "Handle Support Tickets" },
    { key: "manage_settings", label: "Manage Site Settings" },
]
