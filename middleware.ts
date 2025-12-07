import NextAuth from "next-auth"
import authConfig from "@/auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isAuthRoute = req.nextUrl.pathname.startsWith("/auth")
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin")

    // Allow auth routes always
    if (isAuthRoute) {
        return
    }

    // Protect admin routes
    if (isAdminRoute) {
        if (!isLoggedIn) {
            return Response.redirect(new URL("/api/auth/signin", req.nextUrl))
        }

        // @ts-ignore
        const userRole = req.auth?.user?.role || "CUSTOMER"

        if (userRole !== "ADMIN") {
            return Response.redirect(new URL("/", req.nextUrl))
        }
    }
})

// Optionally, don't invoke Middleware on some paths
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
