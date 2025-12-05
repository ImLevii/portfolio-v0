import { db } from "@/lib/db"
import Link from "next/link"
import { Users, Search, MoreVertical, Shield, ShoppingBag } from "lucide-react"
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

export default async function CustomersPage() {
    const customers = await db.user.findMany({
        include: {
            _count: {
                select: { orders: true }
            }
        },
        orderBy: {
            orders: {
                _count: 'desc'
            }
        }
    })

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold font-orbitron text-white">Customers</h1>
                    <p className="text-gray-400 mt-2">Manage your customer base</p>
                </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-gray-800/60">
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search customers..."
                            className="pl-10 bg-black/20 border-gray-800 focus:border-emerald-500/50"
                        />
                    </div>
                </div>

                <div className="rounded-xl border border-gray-800/60 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-black/40">
                            <TableRow className="border-gray-800 hover:bg-transparent">
                                <TableHead className="text-gray-400 font-orbitron">Customer</TableHead>
                                <TableHead className="text-gray-400 font-orbitron">Role</TableHead>
                                <TableHead className="text-gray-400 font-orbitron">Orders</TableHead>
                                <TableHead className="text-gray-400 font-orbitron text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customers.map((customer) => (
                                <TableRow key={customer.id} className="border-gray-800 hover:bg-white/5 transition-colors">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-white">{customer.name || "N/A"}</span>
                                            <span className="text-sm text-gray-500">{customer.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${customer.role === 'ADMIN'
                                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                            }`}>
                                            {customer.role === 'ADMIN' && <Shield className="h-3 w-3" />}
                                            {customer.role}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <ShoppingBag className="h-4 w-4 text-gray-500" />
                                            {customer._count.orders}
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
                                                    <Link href={`/admin/customers/${customer.id}`}>
                                                        View Details
                                                    </Link>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
