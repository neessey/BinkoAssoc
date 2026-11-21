"use server"
// Actions serveur accessibles aux visiteurs du site.
// Chaque entrée est validée (zod), limitée en fréquence par IP et filtrée
// par un champ piège anti-robot. Les erreurs internes ne sont jamais renvoyées.

import { FieldValue } from "firebase-admin/firestore"
import { adminDb } from "@/lib/firebase/admin"
import { rateLimit } from "@/lib/server/rate-limit"
import { sortProperties, toProperty } from "@/lib/server/serialize"
import { contactSchema, dossierSchema, firestoreId, visitSchema } from "@/lib/validation"
import type { Property, PropertySummary } from "@/types/database"

type Result = { success: true } | { success: false; error: string }

const GENERIC_ERROR = "Une erreur est survenue. Veuillez réessayer ou nous appeler directement."
const TOO_MANY = "Trop de demandes envoyées. Merci de réessayer dans quelques minutes."

// ─── Lecture des biens (uniquement les biens disponibles) ────
export async function listPublicProperties(): Promise<Property[]> {
    try {
        const snap = await adminDb().collection("properties").where("available", "==", true).get()
        return sortProperties(snap.docs.map(toProperty))
    } catch (err) {
        console.error("listPublicProperties:", (err as Error).message)
        return []
    }
}

export async function listPropertySummaries(): Promise<PropertySummary[]> {
    const list = await listPublicProperties()
    return list
        .map(({ id, title, location, type, price_label, price, thumbnail }) => ({
            id, title, location, type, price_label, price, thumbnail,
        }))
        .sort((a, b) => a.title.localeCompare(b.title, "fr"))
}

async function findAvailableProperty(id: string | null) {
    if (!id || !firestoreId.safeParse(id).success) return null
    const snap = await adminDb().collection("properties").doc(id).get()
    if (!snap.exists) return null
    const p = toProperty(snap)
    return p.available ? p : null
}

// ─── Formulaire de contact ───────────────────────────────────
export async function submitContactMessage(input: unknown): Promise<Result> {
    const parsed = contactSchema.safeParse(input)
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide" }
    const { website, ...data } = parsed.data
    if (website) return { success: true } // robot : on fait semblant

    if (!(await rateLimit("contact", 5, 600))) return { success: false, error: TOO_MANY }

    try {
        await adminDb().collection("contact_messages").add({
            ...data,
            status: "nouveau",
            created_at: FieldValue.serverTimestamp(),
        })
        return { success: true }
    } catch (err) {
        console.error("submitContactMessage:", (err as Error).message)
        return { success: false, error: GENERIC_ERROR }
    }
}

// ─── Demande de visite ───────────────────────────────────────
export async function submitVisitRequest(input: unknown): Promise<Result> {
    const parsed = visitSchema.safeParse(input)
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide" }
    const { website, ...data } = parsed.data
    if (website) return { success: true }

    if (!(await rateLimit("visit", 5, 600))) return { success: false, error: TOO_MANY }

    try {
        // Le nom du bien est recalculé côté serveur (on ne fait pas confiance au client).
        const property = await findAvailableProperty(data.property_id)
        await adminDb().collection("visit_requests").add({
            ...data,
            property_id: property?.id ?? null,
            property_name: property ? `${property.title} - ${property.location}` : null,
            status: "en_attente",
            created_at: FieldValue.serverTimestamp(),
        })
        return { success: true }
    } catch (err) {
        console.error("submitVisitRequest:", (err as Error).message)
        return { success: false, error: GENERIC_ERROR }
    }
}

// ─── Dossier de candidature ──────────────────────────────────
export async function submitDossier(input: unknown): Promise<Result> {
    const parsed = dossierSchema.safeParse(input)
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide" }
    const { website, ...data } = parsed.data
    if (website) return { success: true }

    if (!(await rateLimit("dossier", 3, 600))) return { success: false, error: TOO_MANY }

    try {
        const property = await findAvailableProperty(data.property_id)
        await adminDb().collection("dossiers").add({
            ...data,
            property_id: property?.id ?? null,
            property_name: property ? `${property.title} — ${property.location}` : null,
            status: "en_attente",
            note_admin: null,
            validated_at: null,
            created_at: FieldValue.serverTimestamp(),
        })
        return { success: true }
    } catch (err) {
        console.error("submitDossier:", (err as Error).message)
        return { success: false, error: GENERIC_ERROR }
    }
}
