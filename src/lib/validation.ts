// Schémas de validation (zod) — appliqués côté serveur sur TOUTES les entrées.
import { z } from "zod"

const text = (max: number) => z.string().trim().max(max)
const optionalText = (max: number) =>
    z.string().trim().max(max).optional().nullable().transform((v) => (v ? v : null))

const email = z.string().trim().toLowerCase().email("Email invalide").max(254)
const phone = z
    .string()
    .trim()
    .max(30)
    .regex(/^[+0-9 ().-]*$/, "Numéro de téléphone invalide")

/** Champ piège anti-robot : doit rester vide. */
export const honeypot = z.string().max(0).optional()

// ─── Formulaires publics ─────────────────────────────────────
export const contactSchema = z.object({
    name: text(120).min(2, "Nom requis"),
    email,
    phone: phone.optional().nullable().transform((v) => (v ? v : null)),
    subject: optionalText(200),
    message: text(5000).min(5, "Message trop court"),
    website: honeypot,
})

export const visitSchema = z.object({
    name: text(160).min(2, "Nom requis"),
    email,
    phone: phone.optional().nullable().transform((v) => (v ? v : null)),
    property_id: optionalText(64),
    preferred_date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide")
        .optional()
        .nullable()
        .transform((v) => (v ? v : null)),
    message: optionalText(3000),
    website: honeypot,
})

export const dossierSchema = z.object({
    nom: text(80).min(1, "Nom requis"),
    prenom: text(80).min(1, "Prénom requis"),
    email,
    telephone: phone.min(6, "Téléphone requis"),
    nationalite: optionalText(80),
    situation_familiale: optionalText(80),
    type_demande: z.enum(["location", "vente"]),
    property_id: optionalText(64),
    profession: optionalText(120),
    employeur: optionalText(120),
    revenu_mensuel: optionalText(60),
    anciennete: optionalText(60),
    garant_nom: optionalText(120),
    garant_telephone: phone.optional().nullable().transform((v) => (v ? v : null)),
    garant_profession: optionalText(120),
    message: optionalText(6000),
    website: honeypot,
})

// ─── Admin ───────────────────────────────────────────────────
const count = z.coerce.number().int().min(0).max(1000).catch(0)
const httpsUrl = z
    .string()
    .trim()
    .max(2048)
    .refine((v) => {
        try {
            return new URL(v).protocol === "https:"
        } catch {
            return false
        }
    }, "URL https invalide")

export const propertySchema = z.object({
    title: text(200).min(1, "Le titre est obligatoire"),
    description: optionalText(10000),
    location: text(300).min(1, "L'adresse est obligatoire"),
    quartier: optionalText(120),
    type: z.enum(["location", "vente", "meuble"]),
    price: z.coerce.number().min(0).max(1e13).catch(0),
    price_label: optionalText(120),
    beds: count,
    baths: count,
    room: count,
    kitchen: count,
    toilet: count,
    parking: count,
    balcon: count,
    area: z.coerce.number().min(0).max(1e7).optional().nullable().catch(null),
    thumbnail: httpsUrl.optional().nullable().or(z.literal("")).transform((v) => (v ? v : null)),
    images: z.array(httpsUrl).max(30).default([]),
    featured: z.boolean(),
    available: z.boolean(),
})

export type PropertyInput = z.infer<typeof propertySchema>

export const firestoreId = z.string().regex(/^[A-Za-z0-9_-]{1,128}$/, "Identifiant invalide")
