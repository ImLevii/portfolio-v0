"use client"

import { useState } from "react"
import Link from "next/link"
import { Users, Search, MoreVertical, Shield, ShoppingBag, Filter, ShieldCheck, HeadphonesIcon, Ban, CheckCircle } from "lucide-react"
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

interface User {
    id: string
    name: string | null
    email: string | null
    role: string
    _count: {
        orders: number
    }
}

export function UsersTable({ initialUsers }: { initialUsers: User[] }) {
    const [search, setSearch] = useState("")
    const [roleFilter, setRoleFilter] = useState("ALL")

    const filteredUsers = initialUsers.filter(user => {
        const matchesSearch = (user.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
            (user.email?.toLowerCase() || "").includes(search.toLowerCase())
        const matchesRole = roleFilter === "ALL" || user.role === roleFilter

        return matchesSearch && matchesRole
    })

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                        <Shield className="h-3 w-3 fill-red-500/20" />
                        ADMIN
                    </div>
                )
            case 'MODERATOR':
                return (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border bg-purple-500/10 text-purple-500 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                        <ShieldCheck className="h-3 w-3" />
                        MOD
                    </div>
                )
            case 'SUPPORT':
                return (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                        <HeadphonesIcon className="h-3 w-3" />
                        SUPPORT
                    </div>
                )
            default:
                return (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                        <Users className="h-3 w-3" />
                        USER
                    </div>
                )
        }
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search users by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-black/20 border-gray-800 focus:border-emerald-500/50 h-10"
                    />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full sm:w-[180px] bg-black/20 border-gray-800 h-10">
                        <Filter className="mr-2 h-4 w-4 text-gray-400" />
                        <SelectValue placeholder="Filter Role" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-gray-800 text-white">
                        <SelectItem value="ALL">All Roles</SelectItem>
                        <SelectItem value="ADMIN" className="text-red-500 font-bold">Admin</SelectItem>
                        <SelectItem value="MODERATOR" className="text-purple-500 font-bold">Moderator</SelectItem>
                        <SelectItem value="SUPPORT" className="text-blue-500 font-bold">Support</SelectItem>
                        <SelectItem value="CUSTOMER" className="text-emerald-500 font-bold">Customer</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-gray-800/60 overflow-hidden">
                <Table>
                    <TableHeader className="bg-black/40">
                        <TableRow className="border-gray-800 hover:bg-transparent">
                            <TableHead className="text-gray-400 font-orbitron">User</TableHead>
                            <TableHead className="text-gray-400 font-orbitron">Role</TableHead>
                            <TableHead className="text-gray-400 font-orbitron text-center">Orders</TableHead>
                            <TableHead className="text-gray-400 font-orbitron text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id} className="border-gray-800 hover:bg-white/5 transition-colors group">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-white group-hover:text-emerald-400 transition-colors">{user.name || "Anonymous"}</span>
                                            <span className="text-sm text-gray-500">{user.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getRoleBadge(user.role)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="inline-flex items-center gap-2 text-gray-300 bg-white/5 px-2 py-1 rounded-md">
                                            <ShoppingBag className="h-3.5 w-3.5 text-gray-500" />
                                            <span className="font-mono">{user._count.orders}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-black/90 border-gray-800 text-gray-300 backdrop-blur-xl">
                                                <DropdownMenuItem asChild className="hover:bg-white/10 hover:text-white cursor-pointer">
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

            <div className="text-xs text-gray-500 text-right">
                Showing {filteredUsers.length} users
            </div>
        </div>
    )
}
