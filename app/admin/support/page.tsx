import { getAllTickets } from "@/actions/tickets"
import { getSupportCategories } from "@/actions/categories"
import Link from "next/link"
import { HeadphonesIcon, Clock, CheckCircle, AlertCircle, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { SupportCategoryManager } from "@/components/admin/support-category-manager"

export const dynamic = 'force-dynamic'

export default async function SupportDashboard() {
    const tickets = await getAllTickets()
    const categories = await getSupportCategories()

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 border-b border-gray-800/60 pb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                    <HeadphonesIcon className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-orbitron text-white neon-text-glow">Support Hub</h1>
                    <p className="text-zinc-400">Manage support tickets and user inquiries.</p>
                </div>
            </div>

            {/* Category Management */}
            <SupportCategoryManager initialCategories={categories} />

            <div className="flex items-center gap-2 mt-8 mb-4">
                <h2 className="text-xl font-bold text-white">Recent Tickets</h2>
            </div>

            <div className="grid gap-4">
                {tickets.length === 0 ? (
                    <div className="text-center py-20 glass-panel rounded-2xl border border-gray-800/60 bg-black/40">
                        <HeadphonesIcon className="h-12 w-12 mx-auto text-zinc-600 mb-4" />
                        <h3 className="text-lg font-bold text-white mb-1 font-orbitron">No Active Tickets</h3>
                        <p className="text-zinc-500">All caught up! There are no open support requests.</p>
                    </div>
                ) : (
                    tickets.map((ticket) => (
                        <div key={ticket.id} className="group relative overflow-hidden rounded-xl border border-gray-800/60 bg-black/40 hover:bg-zinc-900/60 hover:border-emerald-500/30 transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] p-5">
                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-all"></div>
                            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between pl-2">
                                <div className="flex items-start gap-4">
                                    <div className={cn("p-3 rounded-full mt-1",
                                        ticket.category === 'Deposits' ? "bg-emerald-500/10 text-emerald-500" :
                                            (ticket.category === 'Game Issues' || ticket.category === 'License Issues') ? "bg-red-500/10 text-red-500" :
                                                "bg-blue-500/10 text-blue-500"
                                    )}>
                                        <AlertCircle className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-white text-lg">{ticket.category}</span>
                                            <span className={cn("px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                                                ticket.status === 'OPEN' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]" : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                                            )}>
                                                {ticket.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-zinc-400 font-mono mb-2">ID: {ticket.id.slice(-8)}</p>

                                        <div className="flex items-center gap-4 text-xs text-zinc-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {new Date(ticket.updatedAt).toLocaleString()}
                                            </span>
                                            {ticket.guestId && (
                                                <span className="flex items-center gap-1 bg-zinc-800 px-2 py-0.5 rounded-full">
                                                    Guest
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <div className="flex-1 md:flex-none">
                                        <p className="text-xs text-zinc-400 mb-1">Last Message</p>
                                        <div className="bg-black/40 rounded px-3 py-2 text-sm text-zinc-300 max-w-[300px] truncate border border-white/5">
                                            {ticket.messages[0]?.text || "No messages yet"}
                                        </div>
                                    </div>
                                    {/* Link to Detail Page */}
                                    <Link href={`/admin/support/${ticket.id}`} className="h-10 w-10 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors">
                                        <MessageSquare className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
