import { NextResponse, type NextRequest } from "next/server"
import { adminAuth } from "@/lib/firebase/admin"
import { SESSION_COOKIE, SESSION_MAX_AGE_MS } from "@/lib/server/session"

export const runtime = "nodejs"

// Protection CSRF : la requête doit venir de notre propre site.
function isSameOrigin(req: NextRequest) {
    const origin = req.headers.get("origin")
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host")
    if (!origin || !host) return false
    try {
        return new URL(origin).host === host
    } catch {
        return false
    }
}

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
}

/** Échange un ID token Firebase (connexion récente) contre un cookie de session httpOnly. */
export async function POST(req: NextRequest) {
    if (!isSameOrigin(req)) {
        return NextResponse.json({ error: "Origine refusée" }, { status: 403 })
    }

    let idToken: unknown
    try {
        idToken = (await req.json())?.idToken
    } catch {
        return NextResponse.json({ error: "Requête invalide" }, { status: 400 })
    }
    if (typeof idToken !== "string" || idToken.length > 4096) {
        return NextResponse.json({ error: "Requête invalide" }, { status: 400 })
    }

    try {
        const decoded = await adminAuth().verifyIdToken(idToken, true)

        // Seuls les comptes avec le rôle admin peuvent ouvrir une session.
        if (decoded.admin !== true) {
            return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
        }
        // N'accepte que des connexions de moins de 5 minutes (évite le rejeu d'un vieux token).
        if (Date.now() / 1000 - decoded.auth_time > 5 * 60) {
            return NextResponse.json({ error: "Reconnexion requise" }, { status: 401 })
        }

        const sessionCookie = await adminAuth().createSessionCookie(idToken, {
            expiresIn: SESSION_MAX_AGE_MS,
        })

        const res = NextResponse.json({ ok: true })
        res.cookies.set(SESSION_COOKIE, sessionCookie, {
            ...cookieOptions,
            maxAge: SESSION_MAX_AGE_MS / 1000,
        })
        return res
    } catch {
        return NextResponse.json({ error: "Authentification invalide" }, { status: 401 })
    }
}

/** Déconnexion : supprime le cookie et révoque les sessions Firebase de l'utilisateur. */
export async function DELETE(req: NextRequest) {
    if (!isSameOrigin(req)) {
        return NextResponse.json({ error: "Origine refusée" }, { status: 403 })
    }

    const sessionCookie = req.cookies.get(SESSION_COOKIE)?.value
    if (sessionCookie) {
        try {
            const decoded = await adminAuth().verifySessionCookie(sessionCookie)
            await adminAuth().revokeRefreshTokens(decoded.sub)
        } catch {
            // cookie déjà invalide : on se contente de le supprimer
        }
    }

    const res = NextResponse.json({ ok: true })
    res.cookies.set(SESSION_COOKIE, "", { ...cookieOptions, maxAge: 0 })
    return res
}
