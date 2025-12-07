import type { NextAuthConfig } from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"

export default {
    providers: [GitHub, Google],
    callbacks: {
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub
            }
            return session
        },
        async jwt({ token, user }) {
            if (user) {
                console.log("Auth Config: User logged in, setting role in token:", (user as any).role)
                // @ts-ignore - Role is added in the database but not in default types yet
                token.role = user.role
            }
            return token
        }
    },
} satisfies NextAuthConfig
