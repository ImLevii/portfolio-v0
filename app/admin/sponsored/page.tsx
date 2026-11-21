import { Suspense } from "react"
import { getSponsoredMessages } from "@/actions/sponsored"
import { SponsoredMessageList } from "@/components/admin/sponsored/sponsored-message-list"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { Loader2, Megaphone } from "lucide-react"

export const dynamic = 'force-dynamic'

export const metadata = {
    title: "Sponsored Messages | Admin Dashboard",
    description: "Manage automated sponsored messages and announcements in the live chat."
}

export default async function SponsoredMessagesPage() {
    const res = await getSponsoredMessages()
    const messages = res.success ? res.messages || [] : []

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title={<>Live Chat <span className="text-emerald-500">Inventory</span></>}
                description="Control what appears in the live chat stream."
                icon={Megaphone}
                accent="pink"
            />

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
