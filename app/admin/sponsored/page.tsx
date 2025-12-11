import { Suspense } from "react"
import { getSponsoredMessages } from "@/actions/sponsored"
import { SponsoredMessageList } from "@/components/admin/sponsored/sponsored-message-list"
import { Loader2 } from "lucide-react"

export const metadata = {
    title: "Sponsored Messages | Admin Dashboard",
    description: "Manage automated sponsored messages and announcements in the live chat."
}

export default async function SponsoredMessagesPage() {
    const res = await getSponsoredMessages()
    const messages = res.success ? res.messages || [] : []

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold font-orbitron text-white">
                    Live Chat <span className="text-emerald-500">Inventory</span>
                </h1>
                <p className="text-zinc-400">
                    Control what appears in the live chat stream.
                </p>
            </div>

            <div className="h-px bg-white/10 my-6" />

            <Suspense fallback={
                <div className="flex items-center justify-center p-20">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                </div>
            }>
                <SponsoredMessageList initialMessages={messages} />
            </Suspense>
        </div>
    )
}
