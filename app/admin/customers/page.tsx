import { db } from "@/lib/db"
import { UsersTable } from "@/components/admin/users-table"
import { RoleManager } from "@/components/admin/role-manager"
import { getRoles } from "@/actions/roles"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function UsersPage() {
    // Parallel fetching
    const [users, roles] = await Promise.all([
        db.user.findMany({
            include: {
                _count: {
                    select: { orders: true }
                }
            },
            orderBy: {
                orders: {
                    _count: 'desc'
                }
            },
            take: 100 // Safety limit
        }),
        getRoles()
    ])

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold font-orbitron text-white neon-text-glow">Users & Roles</h1>
                    <p className="text-gray-400 mt-2">Manage users, assign roles, and configure permissions.</p>
                </div>
            </div>

            <Tabs defaultValue="users" className="space-y-6">
                <TabsList className="bg-black/40 border border-white/10 p-1 rounded-xl">
                    <TabsTrigger value="users" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 font-orbitron">
                        User Management
                    </TabsTrigger>
                    <TabsTrigger value="roles" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 font-orbitron">
                        Role Configuration
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="glass-panel p-6 rounded-2xl border border-gray-800/60 transition-all duration-300">
                    <UsersTable initialUsers={users} />
                </TabsContent>

                <TabsContent value="roles" className="glass-panel p-6 rounded-2xl border border-gray-800/60 transition-all duration-300">
                    <RoleManager initialRoles={roles} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
