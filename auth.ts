import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"
import authConfig from "./auth.config"

import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

export const { auth, handlers, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(db),
    session: { strategy: "jwt" },
    ...authConfig,
    callbacks: {
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub

                try {
                    // Fetch fresh data from DB to ensure updates are reflected immediately
                    const user = await db.user.findUnique({
                        where: { id: token.sub }
                    })

                    if (user) {
                        session.user.name = user.name
                        session.user.image = user.image
                        // @ts-ignore
                        session.user.role = user.role
                    }
                } catch (error: any) {
                    // Fail silently on DB errors (like plan limit) to preserve basic session
                    const isPlanLimit = error?.code === 'P6003' || error?.code === 'P5000' || error?.message?.includes('planLimitReached')
                    if (!isPlanLimit) {
                        console.error("Auth session DB fetch failed:", error)
                    }
                }
            }
            return session
        },
        async jwt({ token, user }) {
            if (user) {
                // @ts-ignore - Role is added in the database but not in default types yet
                token.role = user.role
            }
            return token
        }
    },
    providers: [
        ...authConfig.providers,
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                try {
                    const user = await db.user.findUnique({
                        where: { email: credentials.email as string }
                    })

                    if (!user || !user.password) return null

                    const passwordsMatch = await bcrypt.compare(
                        credentials.password as string,
                        user.password
                    )

                    if (passwordsMatch) return user
                    return null
                } catch (error: any) {
                    const isPlanLimit = error?.code === 'P6003' || error?.code === 'P5000' || error?.message?.includes('planLimitReached')
                    if (!isPlanLimit) {
                        console.error("Auth authorize failed:", error)
                    }
                    return null
                }
            }
        })
    ],
})
