import "server-only"
import { Timestamp, type DocumentSnapshot } from "firebase-admin/firestore"
import type { Property } from "@/types/database"

/** Convertit un document Firestore en objet simple (Timestamps → ISO) transmissible au client. */
export function serializeDoc<T>(snap: DocumentSnapshot): T {
    const data = snap.data() ?? {}
    const out: Record<string, unknown> = { id: snap.id }
    for (const [k, v] of Object.entries(data)) {
        out[k] = v instanceof Timestamp ? v.toDate().toISOString() : v
    }
    return out as T
}

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : Number(v) || 0)

/** Garantit une forme stable pour un bien, même si un champ manque en base. */
export function toProperty(snap: DocumentSnapshot): Property {
    const d = serializeDoc<Record<string, unknown>>(snap)
    return {
        id: snap.id,
        created_at: (d.created_at as string) ?? "",
        updated_at: (d.updated_at as string) ?? "",
        title: (d.title as string) ?? "",
        description: (d.description as string | null) ?? null,
        location: (d.location as string) ?? "",
        quartier: (d.quartier as string | null) ?? null,
        type: (d.type as Property["type"]) ?? "location",
        price: num(d.price),
        price_label: (d.price_label as string | null) ?? null,
        beds: num(d.beds),
        baths: num(d.baths),
        room: num(d.room),
        kitchen: num(d.kitchen),
        toilet: num(d.toilet),
        parking: num(d.parking),
        balcon: num(d.balcon),
        area: d.area == null ? null : num(d.area),
        images: Array.isArray(d.images) ? (d.images as string[]) : [],
        thumbnail: (d.thumbnail as string | null) ?? null,
        featured: d.featured === true,
        available: d.available !== false,
        city: (d.city as string) ?? "Abidjan",
        country: (d.country as string) ?? "Côte d'Ivoire",
    }
}

/** Tri : vedettes d'abord, puis plus récents. */
export function sortProperties(list: Property[]): Property[] {
    return list.sort(
        (a, b) => Number(b.featured) - Number(a.featured) || b.created_at.localeCompare(a.created_at)
    )
}
