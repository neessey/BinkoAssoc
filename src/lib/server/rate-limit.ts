import "server-only"
import { createHash } from "node:crypto"
import { headers } from "next/headers"
import { FieldValue, Timestamp } from "firebase-admin/firestore"
import { adminDb } from "@/lib/firebase/admin"

/** IP du visiteur (fournie par Vercel). Jamais stockée en clair. */
export async function clientIp(): Promise<string> {
    const h = await headers()
    return (
        h.get("x-real-ip") ||
        h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        "unknown"
    )
}

/**
 * Limite le nombre d'envois par IP et par formulaire (fenêtre glissante simple).
 * Stocké dans Firestore pour fonctionner sur plusieurs instances serverless.
 * Retourne true si la requête est autorisée.
 */
export async function rateLimit(bucket: string, limit: number, windowSeconds: number): Promise<boolean> {
    const ip = await clientIp()
    const salt = process.env.RATE_LIMIT_SALT ?? ""
    const key = createHash("sha256").update(`${salt}:${bucket}:${ip}`).digest("hex")
    const ref = adminDb().collection("_rate_limits").doc(key)
    const now = Date.now()

    try {
        return await adminDb().runTransaction(async (tx) => {
            const snap = await tx.get(ref)
            const data = snap.data() as { count: number; resetAt: Timestamp } | undefined

            if (!data || data.resetAt.toMillis() <= now) {
                tx.set(ref, {
                    count: 1,
                    resetAt: Timestamp.fromMillis(now + windowSeconds * 1000),
                    // champ utilisable par une règle TTL Firestore pour le nettoyage auto
                    expireAt: Timestamp.fromMillis(now + windowSeconds * 1000 + 86_400_000),
                })
                return true
            }
            if (data.count >= limit) return false
            tx.update(ref, { count: FieldValue.increment(1) })
            return true
        })
    } catch (err) {
        // En cas d'incident Firestore, on ne bloque pas les vrais clients.
        console.error("rateLimit:", (err as Error).message)
        return true
    }
}
