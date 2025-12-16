import { db } from "@/lib/db"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Mail, Calendar, Shield, Key, ShoppingBag, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CustomerEditForm } from "@/components/admin/customer-edit-form"
import { DeleteCustomerButton } from "@/components/admin/delete-customer-button"
import { AssignProductForm } from "@/components/admin/assign-product-form"
import { EditLicenseForm } from "@/components/admin/edit-license-form"
import { StatsCard } from "@/components/admin/stats-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign } from "lucide-react"

interface CustomerDetailsPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function CustomerDetailsPage({ params }: CustomerDetailsPageProps) {
    const { id } = await params
    const customer = await db.user.findUnique({
        where: { id },
        include: {
            orders: {
                include: {
                    items: {
                        include: {
                            product: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            },
            licenseKeys: {
                include: {
                    product: true
                },
                orderBy: { createdAt: 'desc' }
            }
        }
    })

    const products = await db.product.findMany({
        select: { id: true, name: true }
    })

    if (!customer) {
        notFound()
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-white/10">
                    <Link href="/admin/customers">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold font-orbitron text-white">{customer.name || "Customer Details"}</h1>
                        <CustomerEditForm customer={customer} />
                        <DeleteCustomerButton
                            customerId={customer.id}
                            customerName={customer.name || customer.email || "Unknown"}
                            redirectAfter
                        />
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 mt-1">
                        <Mail className="h-4 w-4" />
                        <span>{customer.email}</span>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-black/40 border border-gray-800/60 backdrop-blur-xl p-1 rounded-xl">
                    <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">Overview</TabsTrigger>
                    <TabsTrigger value="licenses" className="rounded-lg data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">Licenses</TabsTrigger>
                    <TabsTrigger value="orders" className="rounded-lg data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">Orders</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatsCard
                            title="Total Orders"
                            value={customer.orders.length}
                            icon={ShoppingBag}
                            color="blue"
                        />
                        <StatsCard
                            title="Active Licenses"
                            value={customer.licenseKeys.filter(k => k.status === 'ACTIVE').length}
                            icon={Key}
                            color="emerald"
                        />
                        <StatsCard
                            title="Total Spent"
                            value={`$${(customer.orders.reduce((acc, order) => acc + order.amount, 0) / 100).toFixed(2)}`}
                            icon={DollarSign}
                            color="purple"
                        />
                    </div>

                    <Card className="bg-black/40 border-gray-800/60 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="font-orbitron text-white">Profile Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                                    <span className="text-gray-400 text-sm">Role</span>
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-emerald-500" />
                                        <span className="text-white font-medium">{customer.role}</span>
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                                    <span className="text-gray-400 text-sm">Joined Date</span>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-emerald-500" />
                                        <span className="text-white font-medium">
                                            {customer.emailVerified ? new Date(customer.emailVerified).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="licenses">
                    <Card className="bg-black/40 border-gray-800/60 backdrop-blur-xl">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="font-orbitron text-white flex items-center gap-2">
                                    <Key className="h-5 w-5 text-emerald-500" />
                                    License Keys
                                </CardTitle>
                                <AssignProductForm customerId={customer.id} products={products} />
                            </div>
                            <CardDescription>Manage product licenses for this customer</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-gray-800 hover:bg-transparent">
                                        <TableHead className="text-gray-400">Product</TableHead>
                                        <TableHead className="text-gray-400">License Key</TableHead>
                                        <TableHead className="text-gray-400">Status</TableHead>
                                        <TableHead className="text-gray-400 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {customer.licenseKeys.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                                                No license keys found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        customer.licenseKeys.map((license) => (
                                            <TableRow key={license.id} className="border-gray-800 hover:bg-white/5">
                                                <TableCell className="font-medium text-white">
                                                    {license.product.name}
                                                </TableCell>
                                                <TableCell>
                                                    <code className="bg-black/50 px-2 py-1 rounded border border-gray-800 text-emerald-400 font-mono text-sm">
                                                        {license.key}
                                                    </code>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={
                                                        license.status === 'ACTIVE'
                                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                            : license.status === 'REVOKED'
                                                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                                                : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                                                    }>
                                                        {license.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right text-gray-500 text-sm">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <span className="text-xs">{new Date(license.createdAt).toLocaleDateString()}</span>
                                                        <EditLicenseForm
                                                            id={license.id}
                                                            currentStatus={license.status}
                                                            customerId={customer.id}
                                                        />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="orders">
                    <Card className="bg-black/40 border-gray-800/60 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="font-orbitron text-white flex items-center gap-2">
                                <ShoppingBag className="h-5 w-5 text-blue-500" />
                                Order History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-gray-800 hover:bg-transparent">
                                        <TableHead className="text-gray-400">Order ID</TableHead>
                                        <TableHead className="text-gray-400">Amount</TableHead>
                                        <TableHead className="text-gray-400">Status</TableHead>
                                        <TableHead className="text-gray-400 text-right">Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {customer.orders.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                                                No orders found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        customer.orders.map((order) => (
                                            <TableRow key={order.id} className="border-gray-800 hover:bg-white/5">
                                                <TableCell className="font-mono text-sm text-gray-400">
                                                    {order.id.slice(-8)}
                                                </TableCell>
                                                <TableCell className="text-white">
                                                    ${(order.amount / 100).toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 capitalize">
                                                        {order.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right text-gray-500 text-sm">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
