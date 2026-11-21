import { ChatSettingsForm } from "@/components/admin/chat-settings-form"
import { AnnouncementForm } from "@/components/admin/announcement-form"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { getChatSettings } from "@/actions/chat-settings"
import { MessageSquare } from "lucide-react"

export default async function ChatSettingsPage() {
    const settings = await getChatSettings()

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Live Chat Settings"
                description="Manage the appearance and behavior of the live chat widget."
                icon={MessageSquare}
                accent="cyan"
            />

            <ChatSettingsForm initialConfig={settings} />
            <AnnouncementForm />
        </div>
    )
}
