"use client"

import { useState } from "react"
import Link from "next/link"
import { Users, Search, MoreVertical, Shield, ShoppingBag, Filter, ShoppingCart, User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { DeleteCustomerButton } from "@/components/admin/delete-customer-button"
import { RoleDefinition } from "@/lib/roles"

interface User {
    id: string
    name: string | null
    email: string | null
    role: string
    _count: {
        orders: number
    }
}

export function UsersTable({ initialUsers, availableRoles }: { initialUsers: User[], availableRoles: RoleDefinition[] }) {
    const [search, setSearch] = useState("")
    const [roleFilter, setRoleFilter] = useState("ALL")

    const filteredUsers = initialUsers.filter(user => {
        const matchesSearch = (user.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
            (user.email?.toLowerCase() || "").includes(search.toLowerCase())
        // Match against role key or role name if needed, but role stored in DB is likely the KEY (e.g. "ADMIN")
        const matchesRole = roleFilter === "ALL" || user.role === roleFilter

        return matchesSearch && matchesRole
    })

    const getRoleBadge = (userRoleKey: string) => {
        // Find the custom definition for this role
        const roleDef = availableRoles.find(r => r.key === userRoleKey) ||
            availableRoles.find(r => r.key === "CUSTOMER") // Fallback

        if (!roleDef) return null

        return (
            <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border shadow-[0_0_10px_rgba(0,0,0,0.2)] transition-all hover:scale-105 cursor-default"
                style={{
                    backgroundColor: `${roleDef.color}15`,
                    borderColor: `${roleDef.color}30`,
                    color: roleDef.color,
                    boxShadow: `0 0 10px ${roleDef.color}10`
                }}
            >
                <Shield className="h-3 w-3" style={{ fill: `${roleDef.color}20` }} />
                <span>{roleDef.name.toUpperCase()}</span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-black/40 p-4 rounded-xl border border-cyan-500/10 backdrop-blur-md">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-500/50 group-hover:text-cyan-400 transition-colors" />
                    <Input
                        placeholder="Search users by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-black/40 border-white/10 focus:border-cyan-500/50 h-10 transition-all font-sans"
                    />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full sm:w-[200px] bg-black/40 border-white/10 h-10 focus:border-cyan-500/50">
                        <Filter className="mr-2 h-4 w-4 text-cyan-500/50" />
                        <SelectValue placeholder="Filter Role" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-cyan-500/20 text-white backdrop-blur-xl">
                        <SelectItem value="ALL" className="focus:bg-cyan-500/20 focus:text-cyan-400">All Roles</SelectItem>
                        {availableRoles.map(role => (
                            <SelectItem
                                key={role.key}
                                value={role.key}
                                className="focus:bg-white/10"
                                style={{ color: role.color }}
                            >
                                <span className="font-bold">{role.name}</span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-cyan-500/10 overflow-hidden bg-black/40 backdrop-blur-md shadow-[0_0_30px_rgba(6,182,212,0.02)]">
                <Table>
                    <TableHeader className="bg-cyan-500/5">
                        <TableRow className="border-cyan-500/10 hover:bg-transparent">
                            <TableHead className="text-cyan-400/70 font-orbitron tracking-wider py-4">User</TableHead>
                            <TableHead className="text-cyan-400/70 font-orbitron tracking-wider py-4">Role</TableHead>
                            <TableHead className="text-cyan-400/70 font-orbitron tracking-wider py-4 text-center">Orders</TableHead>
                            <TableHead className="text-cyan-400/70 font-orbitron tracking-wider py-4 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <Users className="h-8 w-8 opacity-20" />
                                        <p>No users found matching your criteria.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id} className="border-cyan-500/5 hover:bg-cyan-500/5 transition-colors group">
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center group-hover:border-cyan-500/30 transition-colors">
                                                <UserIcon className="h-5 w-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-white group-hover:text-cyan-200 transition-colors font-orbitron tracking-wide text-sm">{user.name || "Anonymous"}</span>
                                                <span className="text-xs text-gray-500 font-mono">{user.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getRoleBadge(user.role)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="inline-flex items-center gap-2 text-gray-400 bg-white/5 px-3 py-1.5 rounded-md border border-white/5 group-hover:border-cyan-500/20 group-hover:bg-cyan-500/5 transition-all">
                                            <ShoppingCart className="h-3.5 w-3.5" />
                                            <span className="font-mono font-bold">{user._count.orders}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-cyan-400 hover:bg-cyan-500/10">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-black/90 border-cyan-500/20 text-gray-300 backdrop-blur-xl shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                                                <DropdownMenuItem asChild className="hover:bg-cyan-500/10 hover:text-cyan-400 cursor-pointer focus:bg-cyan-500/10 focus:text-cyan-400">
                                                    <Link href={`/admin/customers/${user.id}`}>
                                                        View Details
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DeleteCustomerButton
                                                    customerId={user.id}
                                                    customerName={user.name || user.email || "Unknown"}
                                                    variant="icon"
                                                />
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end gap-2 text-xs text-cyan-500/50 font-mono">
                <span>TOTAL USERS:</span>
                <span className="text-cyan-400 font-bold">{filteredUsers.length}</span>
            </div>
        </div>
    )
}
