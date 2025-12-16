import NextAuth from "next-auth"
import authConfig from "@/auth.config"

const { auth } = NextAuth(authConfig)

import { NextResponse } from "next/server"

// ... imports

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
            console.log("Middleware: Admin route accessed, not logged in. Redirecting to signin.")
            return NextResponse.redirect(new URL("/auth/signin", req.nextUrl))
        }

        // @ts-ignore
        const userRole = req.auth?.user?.role || "CUSTOMER"
        console.log(`Middleware: Admin route accessed. User Role: ${userRole}`)

        if (userRole !== "ADMIN" && userRole !== "Admin") {
            console.log("Middleware: User is not ADMIN. Redirecting to /.")
            return NextResponse.redirect(new URL("/", req.nextUrl))
        }
    }
})

// Optionally, don't invoke Middleware on some paths
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
