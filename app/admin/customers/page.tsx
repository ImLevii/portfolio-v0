import { db } from "@/lib/db"
import { UsersTable } from "@/components/admin/users-table"

export default async function UsersPage() {
    const users = await db.user.findMany({
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
                    <h1 className="text-4xl font-bold font-orbitron text-white neon-text-glow">Users & Roles</h1>
                    <p className="text-gray-400 mt-2">Manage users, assign roles, and track activity.</p>
                </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-gray-800/60">
                <UsersTable initialUsers={users} />
            </div>
        </div>
    )
}
