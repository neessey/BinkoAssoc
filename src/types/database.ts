// types/database.ts
// Types TypeScript générés depuis le schéma Supabase

export type PropertyType = "location" | "vente" | "meuble"

export interface Property {
    room: string
    kitchen: string
    toilet: string
    parking: string
    balcon: string
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
    area: number | null
    images: string[]
    thumbnail: string | null
    featured: boolean
    available: boolean
    city: string
    country: string
}

export interface ContactMessage {
    id?: string
    created_at?: string
    name: string
    email: string
    phone?: string
    subject?: string
    message: string
    status?: "nouveau" | "lu" | "traité" | "archivé"
}

export interface VisitRequest {
    id?: string
    created_at?: string
    property_id?: string
    property_name?: string
    name: string
    email: string
    phone?: string
    preferred_date?: string
    message?: string
    status?: "en_attente" | "confirmée" | "annulée"
}

export interface Location {
    id: string
    name: string
    subtitle: string | null
    image: string | null
    active: boolean
}