import { NextResponse, type NextRequest } from "next/server"

// Filtre rapide : sans cookie de session, on redirige vers /login.
// La vérification complète (signature, révocation, rôle admin) est faite
// côté serveur dans app/admin/layout.tsx et dans CHAQUE action admin.
export function middleware(req: NextRequest) {
    if (!req.cookies.get("__session")?.value) {
        const url = new URL("/login", req.url)
        return NextResponse.redirect(url)
    }
    return NextResponse.next()
}

export const config = {
    matcher: ["/admin/:path*"],
}
