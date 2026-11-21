// Utilitaires d'URL Cloudinary partagés client/serveur (aucun secret ici).

export const CLOUDINARY_FOLDER = "binko/properties"

/** Optimisation automatique à l'affichage : format moderne, qualité auto, taille max 1920 px. */
export const DISPLAY_TRANSFORM = "f_auto,q_auto,c_limit,w_1920"

/** Transforme une URL d'envoi Cloudinary en URL optimisée pour l'affichage. */
export function toDisplayUrl(secureUrl: string): string {
    return secureUrl.replace("/image/upload/", `/image/upload/${DISPLAY_TRANSFORM}/`)
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

/**
 * Vérifie qu'une URL désigne bien une photo de NOTRE compte Cloudinary, dans le dossier des biens.
 * Renvoie son public_id (ex: "binko/properties/abc123") ou null.
 */
export function ourPublicId(url: string, cloudName: string | undefined): string | null {
    if (!cloudName) return null
    const re = new RegExp(
        `^https://res\\.cloudinary\\.com/${escapeRe(cloudName)}/image/upload/` +
        `(?:[a-z0-9_,.:]+/)*?` +            // transformations éventuelles
        `(?:v\\d+/)?` +                      // version éventuelle
        `(${escapeRe(CLOUDINARY_FOLDER)}/[A-Za-z0-9_-]{8,64})` +
        `\\.(?:jpg|jpeg|png|webp|avif)$`
    )
    return url.match(re)?.[1] ?? null
}
