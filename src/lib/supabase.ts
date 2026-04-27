

import { createClient } from "@supabase/supabase-js"
import type { Property, ContactMessage, VisitRequest, Location, PropertyType } from "@/types/database"

export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ─── BIENS ───────────────────────────────────────────────────
export async function getProperties(filters?: {
    type?: PropertyType | "all"
    quartier?: string
    featured?: boolean
}): Promise<Property[]> {
    let query = supabase
        .from("properties")
        .select("*")
        .eq("available", true)
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false })

    if (filters?.type && filters.type !== "all") query = query.eq("type", filters.type)
    if (filters?.quartier) query = query.eq("quartier", filters.quartier)
    if (filters?.featured !== undefined) query = query.eq("featured", filters.featured)

    const { data, error } = await query
    if (error) { console.error("getProperties:", error.message); return [] }
    return data as Property[]
}

export async function getPropertyById(id: string): Promise<Property | null> {
    const { data, error } = await supabase
        .from("properties").select("*").eq("id", id).eq("available", true).single()
    if (error) { console.error("getPropertyById:", error.message); return null }
    return data as Property
}

export async function searchProperties(params: {
    type?: PropertyType | "all"
    quartier?: string
    minPrice?: number
    maxPrice?: number
}): Promise<Property[]> {
    let query = supabase.from("properties").select("*").eq("available", true)
    if (params.type && params.type !== "all") query = query.eq("type", params.type)
    if (params.quartier && params.quartier !== "Toutes les communes") query = query.ilike("location", `%${params.quartier}%`)
    if (params.minPrice !== undefined) query = query.gte("price", params.minPrice)
    if (params.maxPrice !== undefined) query = query.lte("price", params.maxPrice)
    const { data, error } = await query.order("created_at", { ascending: false })
    if (error) { console.error("searchProperties:", error.message); return [] }
    return data as Property[]
}

// ─── QUARTIERS ───────────────────────────────────────────────
export async function getLocations(): Promise<Location[]> {
    const { data, error } = await supabase.from("locations").select("*").eq("active", true)
    if (error) { console.error("getLocations:", error.message); return [] }
    return data as Location[]
}

// ─── CONTACT ─────────────────────────────────────────────────
export async function sendContactMessage(
    message: Omit<ContactMessage, "id" | "created_at" | "status">
): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase.from("contact_messages").insert([message])
    if (error) { console.error("sendContactMessage:", error.message); return { success: false, error: error.message } }
    return { success: true }
}

// ─── VISITES ─────────────────────────────────────────────────
export async function createVisitRequest(
    request: Omit<VisitRequest, "id" | "created_at" | "status">
): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase.from("visit_requests").insert([request])
    if (error) { console.error("createVisitRequest:", error.message); return { success: false, error: error.message } }
    return { success: true }
}