"use client"

import { useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateProfile, updatePassword } from "@/app/settings/actions"
import { User } from "next-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SettingsButton } from "@/components/settings/settings-button"
import { Save, Key } from "lucide-react"

interface SettingsFormProps {
    user: User
}

export function SettingsForm({ user }: SettingsFormProps) {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
    const passwordFormRef = useRef<HTMLFormElement>(null)

    async function handleProfileUpdate(formData: FormData) {
        setLoading(true)
        setMessage(null)
        try {
            const result = await updateProfile(formData)
            setMessage({ type: "success", text: result.success })
        } catch (err: any) {
            setMessage({ type: "error", text: err.message })
        } finally {
            setLoading(false)
        }
    }

    async function handlePasswordUpdate(formData: FormData) {
        setLoading(true)
        setMessage(null)
        try {
            const result = await updatePassword(formData)
            setMessage({ type: "success", text: result.success })
                // Optional: Reset form
                (document.getElementById("password-form") as HTMLFormElement).reset()
        } catch (err: any) {
            setMessage({ type: "error", text: err.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8">
            {/* Profile Settings */}
            <div className="p-6 bg-gray-900/50 backdrop-blur-md rounded-xl border border-gray-800">
                <h2 className="text-xl font-bold text-white mb-4 font-orbitron">Profile Settings</h2>

                <form action={handleProfileUpdate} className="space-y-4">
                    <div className="flex items-center gap-4 mb-6">
                        <Avatar className="h-20 w-20 border border-gray-700">
                            <AvatarImage src={user.image || ""} />
                            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <Label htmlFor="image">Avatar URL</Label>
                            <Input
                                id="image"
                                name="image"
                                defaultValue={user.image || ""}
                                placeholder="https://example.com/avatar.jpg"
                                className="bg-black/50 border-gray-700 mt-1"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={user.name || ""}
                                required
                                className="bg-black/50 border-gray-700"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                defaultValue={user.email || ""}
                                required
                                className="bg-black/50 border-gray-700"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <SettingsButton
                            type="submit"
                            label="Save Profile"
                            icon={Save}
                            loading={loading}
                        />
                    </div>
                </form>
            </div>

            {/* Password Settings - Only show if user has a password (not OAuth only) */}
            {/* Note: We can't easily check if they have a password on client without passing a flag. 
          For now, we'll show it, but it will fail gracefully if they are OAuth only. 
          Ideally, pass a `hasPassword` prop. */}
            <div className="p-6 bg-gray-900/50 backdrop-blur-md rounded-xl border border-gray-800">
                <h2 className="text-xl font-bold text-white mb-4 font-orbitron">Change Password</h2>

                <form ref={passwordFormRef} action={handlePasswordUpdate} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            required
                            className="bg-black/50 border-gray-700"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            required
                            className="bg-black/50 border-gray-700"
                        />
                    </div>

                    <div className="flex justify-end">
                        <SettingsButton
                            type="submit"
                            label="Update Password"
                            icon={Key}
                            loading={loading}
                        />
                    </div>
                </form>
            </div>

            {message && (
                <div className={`p-4 rounded-lg ${message.type === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                    {message.text}
                </div>
            )}
        </div>
    )
}
