// types/database.ts
// Types des documents Firestore (collections : properties, contact_messages,
// visit_requests, dossiers). Les dates sont renvoyées au client en ISO string.

export type PropertyType = "location" | "vente" | "meuble"

export interface Property {
    id: string
    created_at: string
    updated_at: string
    title: string
    description: string | null
    location: string
    quartier: string | null
    type: PropertyType
    price: number
    price_label: string | null
    beds: number
    baths: number
    room: number
    kitchen: number
    toilet: number
    parking: number
    balcon: number
    area: number | null
    images: string[]
    thumbnail: string | null
    featured: boolean
    available: boolean
    city: string
    country: string
}

/** Version allégée renvoyée aux pages publiques de formulaire. */
export type PropertySummary = Pick<
    Property,
    "id" | "title" | "location" | "type" | "price_label" | "price" | "thumbnail"
>

export type MessageStatus = "nouveau" | "lu" | "traité" | "archivé"

export interface ContactMessage {
    id?: string
    created_at?: string
    name: string
    email: string
    phone?: string | null
    subject?: string | null
    message: string
    status?: MessageStatus
}

export type VisitStatus = "en_attente" | "confirmée" | "annulée"

export interface VisitRequest {
    id?: string
    created_at?: string
    property_id?: string | null
    property_name?: string | null
    name: string
    email: string
    phone?: string | null
    preferred_date?: string | null
    message?: string | null
    status?: VisitStatus
}

export type DossierStatus = "en_attente" | "en_cours" | "validé" | "refusé"

export interface Dossier {
    id: string
    created_at: string
    nom: string
    prenom: string
    email: string
    telephone: string
    nationalite: string | null
    situation_familiale: string | null
    type_demande: "location" | "vente"
    property_id: string | null
    property_name: string | null
    profession: string | null
    employeur: string | null
    revenu_mensuel: string | null
    anciennete: string | null
    garant_nom: string | null
    garant_telephone: string | null
    garant_profession: string | null
    message: string | null
    status: DossierStatus
    note_admin: string | null
    validated_at: string | null
}

export interface Location {
    id: string
    name: string
    subtitle: string | null
    image: string | null
    active: boolean
}
