import "server-only"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { adminAuth } from "@/lib/firebase/admin"

export const SESSION_COOKIE = "__session"
export const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 8 // 8 h

export interface AdminSession {
    uid: string
    email: string
}

/**
 * Vérifie le cookie de session auprès de Firebase (signature, expiration,
 * révocation) ET la présence du rôle admin (custom claim `admin: true`).
 */
export async function getAdminSession(): Promise<AdminSession | null> {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value
    if (!sessionCookie) return null

    try {
        const decoded = await adminAuth().verifySessionCookie(sessionCookie, true)
        if (decoded.admin !== true) return null
        return { uid: decoded.uid, email: decoded.email ?? "" }
    } catch {
        return null
    }
}

/**
 * À appeler en première ligne de CHAQUE action serveur admin.
 * Sans session valide, l'exécution s'arrête et le navigateur est renvoyé vers /login.
 */
export async function requireAdmin(): Promise<AdminSession> {
    const session = await getAdminSession()
    if (!session) redirect("/login")
    return session
}
