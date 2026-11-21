"use server"
// Actions serveur du panel admin. CHAQUE fonction commence par requireAdmin() :
// sans cookie de session valide + rôle admin, rien n'est lu ni modifié.

import { FieldValue } from "firebase-admin/firestore"
import { z } from "zod"
import { adminDb } from "@/lib/firebase/admin"
import { requireAdmin } from "@/lib/server/session"
import { deleteImages, signImageUpload, type UploadSignature } from "@/lib/server/cloudinary"
import { ourPublicId } from "@/lib/cloudinary-url"
import { serializeDoc, toProperty } from "@/lib/server/serialize"
import { firestoreId, propertySchema } from "@/lib/validation"
import type {
    ContactMessage, Dossier, DossierStatus, MessageStatus, Property, VisitRequest, VisitStatus,
} from "@/types/database"

type Result = { success: true } | { success: false; error: string }

function fail(scope: string, err: unknown): Result {
    console.error(`${scope}:`, (err as Error).message)
    return { success: false, error: "Opération impossible. Réessayez." }
}

function id(value: unknown): string {
    return firestoreId.parse(value)
}

async function listCollection<T>(name: string): Promise<T[]> {
    await requireAdmin()
    const snap = await adminDb().collection(name).orderBy("created_at", "desc").limit(1000).get()
    return snap.docs.map((d) => serializeDoc<T>(d))
}

// ─── Compteurs (badges du menu) ──────────────────────────────
export async function adminCounts(): Promise<{ messages: number; visits: number }> {
    await requireAdmin()
    const db = adminDb()
    const [m, v] = await Promise.all([
        db.collection("contact_messages").where("status", "==", "nouveau").count().get(),
        db.collection("visit_requests").where("status", "==", "en_attente").count().get(),
    ])
    return { messages: m.data().count, visits: v.data().count }
}

// ─── Biens ───────────────────────────────────────────────────
export async function adminListProperties(): Promise<Property[]> {
    await requireAdmin()
    const snap = await adminDb().collection("properties").orderBy("created_at", "desc").get()
    return snap.docs.map(toProperty)
}

/** Signature d'envoi Cloudinary pour une photo (admin uniquement). */
export async function adminSignImageUpload(): Promise<UploadSignature> {
    await requireAdmin()
    return signImageUpload()
}

export async function adminSaveProperty(propertyId: string | null, input: unknown): Promise<Result> {
    await requireAdmin()
    const parsed = propertySchema.safeParse(input)
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide" }

    // Seules les photos de notre compte Cloudinary sont acceptées.
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const images = parsed.data.images
    if (images.some((u) => !ourPublicId(u, cloudName))) {
        return { success: false, error: "Une des photos n'a pas été envoyée via le panel." }
    }
    const thumbnail = parsed.data.thumbnail && images.includes(parsed.data.thumbnail)
        ? parsed.data.thumbnail
        : images[0] ?? null
    const data = { ...parsed.data, images, thumbnail }

    try {
        const col = adminDb().collection("properties")
        if (propertyId) {
            const ref = col.doc(id(propertyId))
            const before = await ref.get()
            if (!before.exists) return { success: false, error: "Bien introuvable." }
            await ref.update({ ...data, updated_at: FieldValue.serverTimestamp() })
            // Supprime chez Cloudinary les photos retirées du bien.
            const old = toProperty(before)
            await deleteImages([...old.images, old.thumbnail ?? ""].filter((u) => u && !images.includes(u)))
        } else {
            await col.add({
                ...data,
                city: "Abidjan",
                country: "Côte d'Ivoire",
                created_at: FieldValue.serverTimestamp(),
                updated_at: FieldValue.serverTimestamp(),
            })
        }
        return { success: true }
    } catch (err) {
        return fail("adminSaveProperty", err)
    }
}

export async function adminSetPropertyFlags(
    propertyId: string,
    flags: { available?: boolean; featured?: boolean }
): Promise<Result> {
    await requireAdmin()
    const parsed = z.object({ available: z.boolean().optional(), featured: z.boolean().optional() }).strict().safeParse(flags)
    if (!parsed.success) return { success: false, error: "Valeur invalide" }
    try {
        await adminDb().collection("properties").doc(id(propertyId)).update({
            ...parsed.data,
            updated_at: FieldValue.serverTimestamp(),
        })
        return { success: true }
    } catch (err) {
        return fail("adminSetPropertyFlags", err)
    }
}

export async function adminDeleteProperty(propertyId: string): Promise<Result> {
    await requireAdmin()
    try {
        const ref = adminDb().collection("properties").doc(id(propertyId))
        const snap = await ref.get()
        await ref.delete()
        if (snap.exists) {
            const p = toProperty(snap)
            await deleteImages([p.thumbnail ?? "", ...p.images].filter(Boolean))
        }
        return { success: true }
    } catch (err) {
        return fail("adminDeleteProperty", err)
    }
}

// ─── Messages ────────────────────────────────────────────────
const messageStatus = z.enum(["nouveau", "lu", "traité", "archivé"])

export async function adminListMessages(): Promise<ContactMessage[]> {
    return listCollection<ContactMessage>("contact_messages")
}

export async function adminUpdateMessageStatus(messageId: string, status: MessageStatus): Promise<Result> {
    await requireAdmin()
    try {
        await adminDb().collection("contact_messages").doc(id(messageId)).update({ status: messageStatus.parse(status) })
        return { success: true }
    } catch (err) {
        return fail("adminUpdateMessageStatus", err)
    }
}

export async function adminDeleteMessage(messageId: string): Promise<Result> {
    await requireAdmin()
    try {
        await adminDb().collection("contact_messages").doc(id(messageId)).delete()
        return { success: true }
    } catch (err) {
        return fail("adminDeleteMessage", err)
    }
}

// ─── Visites ─────────────────────────────────────────────────
const visitStatus = z.enum(["en_attente", "confirmée", "annulée"])

export async function adminListVisits(): Promise<VisitRequest[]> {
    return listCollection<VisitRequest>("visit_requests")
}

export async function adminUpdateVisitStatus(visitId: string, status: VisitStatus): Promise<Result> {
    await requireAdmin()
    try {
        await adminDb().collection("visit_requests").doc(id(visitId)).update({ status: visitStatus.parse(status) })
        return { success: true }
    } catch (err) {
        return fail("adminUpdateVisitStatus", err)
    }
}

export async function adminDeleteVisit(visitId: string): Promise<Result> {
    await requireAdmin()
    try {
        await adminDb().collection("visit_requests").doc(id(visitId)).delete()
        return { success: true }
    } catch (err) {
        return fail("adminDeleteVisit", err)
    }
}

// ─── Dossiers ────────────────────────────────────────────────
const dossierUpdate = z
    .object({
        status: z.enum(["en_attente", "en_cours", "validé", "refusé"]).optional(),
        note_admin: z.string().trim().max(5000).nullable().optional(),
    })
    .strict()

export async function adminListDossiers(): Promise<Dossier[]> {
    return listCollection<Dossier>("dossiers")
}

export async function adminUpdateDossier(
    dossierId: string,
    update: { status?: DossierStatus; note_admin?: string | null }
): Promise<Result> {
    await requireAdmin()
    const parsed = dossierUpdate.safeParse(update)
    if (!parsed.success) return { success: false, error: "Valeur invalide" }
    const data: Record<string, unknown> = { ...parsed.data }
    if (data.note_admin === "") data.note_admin = null
    if (parsed.data.status) {
        data.validated_at = parsed.data.status === "validé" ? FieldValue.serverTimestamp() : null
    }
    try {
        await adminDb().collection("dossiers").doc(id(dossierId)).update(data)
        return { success: true }
    } catch (err) {
        return fail("adminUpdateDossier", err)
    }
}

export async function adminDeleteDossier(dossierId: string): Promise<Result> {
    await requireAdmin()
    try {
        await adminDb().collection("dossiers").doc(id(dossierId)).delete()
        return { success: true }
    } catch (err) {
        return fail("adminDeleteDossier", err)
    }
}
