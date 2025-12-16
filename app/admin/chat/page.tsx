import { ChatSettingsForm } from "@/components/admin/chat-settings-form"
import { AnnouncementForm } from "@/components/admin/announcement-form"
import { getChatSettings } from "@/actions/chat-settings"
import { MessageSquare } from "lucide-react"

export default async function ChatSettingsPage() {
    const settings = await getChatSettings()

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                    <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight font-orbitron text-white">Live Chat Settings</h1>
                    <p className="text-zinc-400">Manage the appearance and behavior of the live chat widget.</p>
                </div>
            </div>

            <ChatSettingsForm initialConfig={settings} />
            <AnnouncementForm />
        </div>
    )
}
