
import { getTicket, closeTicket, deleteTicket } from "@/actions/tickets"
import { sendMessage } from "@/actions/chat"
import { auth } from "@/auth"
import { notFound, redirect } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, CheckCircle, Clock, Send, AlertCircle, Trash2 } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
// We need a client component for the chat interaction to handle state and invalidation
import { AdminTicketChat } from "@/components/admin/admin-ticket-chat"

interface PageProps {
    params: {
        ticketId: string
    }
}

export default async function TicketDetailPage({ params }: PageProps) {
    const { ticketId } = await params
    const ticket = await getTicket(ticketId)

    if (!ticket) {
        notFound()
    }

    return (
        <div className="space-y-4 h-[calc(100vh-120px)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                    <Link href="/admin/support" className="p-1.5 hover:bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-bold font-orbitron text-white">
                                {ticket.category}
                            </h1>
                            <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                                ticket.status === 'OPEN' ? "bg-green-500/10 text-green-400 border-green-500/20"
                                    : ticket.status === 'CLOSED' ? "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                                        : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            )}>
                                {ticket.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5">
                            <span className="font-mono">#{ticket.id.slice(-8)}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(ticket.createdAt).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {ticket.status !== 'CLOSED' && (
                        <form action={async () => {
                            "use server"
                            await closeTicket(ticketId)
                        }}>
                            <Button variant="outline" size="sm" className="h-8 text-xs border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300">
                                Close Ticket
                            </Button>
                        </form>
                    )}

                    <form action={async () => {
                        "use server"
                        await deleteTicket(ticketId)
                        redirect('/admin/support')
                    }}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-colors" title="Delete Ticket">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-zinc-900/30 rounded-xl border border-white/5 overflow-hidden flex flex-col">
                <AdminTicketChat ticket={ticket} />
            </div>
        </div>
    )
}
