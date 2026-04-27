import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token
        const isAdmin = token?.role === "admin"

        // Si on accède à /admin sans être admin → redirect /login
        if (req.nextUrl.pathname.startsWith("/admin") && !isAdmin) {
            return NextResponse.redirect(new URL("/login", req.url))
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token, // doit être connecté
        },
    }
)

export const config = {
    matcher: ["/admin/:path*"],
}