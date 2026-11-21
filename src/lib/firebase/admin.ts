// Firebase Admin SDK — UNIQUEMENT côté serveur.
// Toutes les lectures/écritures Firestore passent par ici : les règles Firestore
// interdisent tout accès direct depuis le navigateur.
import "server-only"
import { cert, getApps, initializeApp, type App } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore, type Firestore } from "firebase-admin/firestore"

let app: App | undefined
let db: Firestore | undefined

function getAdminApp(): App {
    if (app) return app
    const existing = getApps()[0]
    if (existing) {
        app = existing
        return app
    }

    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    // Vercel stocke les retours à la ligne de la clé sous forme "\n"
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
            "Configuration Firebase Admin manquante : FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL et FIREBASE_PRIVATE_KEY sont requis."
        )
    }

    app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
    return app
}

export function adminAuth() {
    return getAuth(getAdminApp())
}

// Next.js peut charger ce module dans plusieurs bundles serveur qui partagent la même
// instance Firestore : on ne la configure qu'une fois, en le mémorisant globalement.
const g = globalThis as typeof globalThis & { __binkoFirestoreConfigured?: boolean }

export function adminDb(): Firestore {
    if (!db) {
        db = getFirestore(getAdminApp())
        if (!g.__binkoFirestoreConfigured) {
            try {
                db.settings({ ignoreUndefinedProperties: true })
            } catch {
                // déjà configurée par un autre bundle : sans conséquence
            }
            g.__binkoFirestoreConfigured = true
        }
    }
    return db
}
