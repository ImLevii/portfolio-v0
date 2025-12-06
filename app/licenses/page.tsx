import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Key } from "lucide-react"
import { cn } from "@/lib/utils"

export default async function LicensesPage() {
    const session = await auth()

    if (!session?.user?.email) {
        redirect("/auth/signin")
    }

    const user = await db.user.findUnique({
        where: { email: session.user.email },
        include: {
            licenseKeys: {
                include: {
                    product: true
                },
                orderBy: { createdAt: 'desc' }
            }
        }
    })

    if (!user) {
        redirect("/auth/signin")
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 text-white overflow-hidden font-bold relative pt-20 md:pt-24">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-900/10 via-transparent to-transparent pointer-events-none" />

            <div className="container relative z-10 mx-auto px-4 py-6 md:py-8">
                <h1 className="text-4xl font-bold text-white mb-8 font-orbitron text-center md:text-left flex items-center gap-3 justify-center md:justify-start">
                    <Key className="h-8 w-8 text-emerald-500" />
                    My Licenses
                </h1>

                <div className="max-w-4xl mx-auto">
                    <div className="glass-panel p-6 rounded-2xl border border-gray-800/60 backdrop-blur-xl bg-black/40">
                        {user.licenseKeys.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <p>You haven't purchased any products with licenses yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {user.licenseKeys.map((license) => (
                                    <div key={license.id} className="p-4 rounded-xl bg-black/40 border border-gray-800 hover:border-emerald-500/30 transition-colors group">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <h3 className="font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">{license.product.name}</h3>
                                                <p className="text-sm text-gray-400">Purchased on {new Date(license.createdAt).toLocaleDateString()}</p>
                                                {license.product.filePath && (
                                                    <a
                                                        href={`/api/download/${license.id}`}
                                                        className="inline-flex items-center gap-2 mt-2 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg transition-colors border border-emerald-500/20"
                                                    >
                                                        <Key className="h-3 w-3" />
                                                        Download Assets
                                                    </a>
                                                )}
                                                {license.expiresAt && (
                                                    <p className={cn("text-xs mt-1",
                                                        new Date() > new Date(license.expiresAt) ? "text-red-400" : "text-gray-500"
                                                    )}>
                                                        {new Date() > new Date(license.expiresAt) ? "Expired on " : "Expires on "}
                                                        {new Date(license.expiresAt).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <code className="bg-black/80 px-3 py-1.5 rounded border border-gray-700 text-emerald-400 font-mono tracking-wider shadow-[0_0_10px_-3px_rgba(16,185,129,0.3)]">
                                                    {license.key}
                                                </code>
                                                <span className={`text-xs uppercase tracking-widest font-bold ${license.status === 'ACTIVE' ? 'text-emerald-500/80' :
                                                    license.status === 'REVOKED' ? 'text-red-500/80' :
                                                        (license.expiresAt && new Date() > new Date(license.expiresAt)) ? 'text-red-500/80' :
                                                            'text-gray-500/80'
                                                    }`}>
                                                    {(license.expiresAt && new Date() > new Date(license.expiresAt)) ? 'EXPIRED' : license.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
