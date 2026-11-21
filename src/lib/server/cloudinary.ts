import "server-only"
import { randomUUID } from "node:crypto"
import { v2 as cloudinary } from "cloudinary"
import { CLOUDINARY_FOLDER, ourPublicId } from "@/lib/cloudinary-url"

function configured() {
    const cloud_name = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const api_key = process.env.CLOUDINARY_API_KEY
    const api_secret = process.env.CLOUDINARY_API_SECRET
    if (!cloud_name || !api_key || !api_secret) {
        throw new Error("Configuration Cloudinary manquante (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET).")
    }
    cloudinary.config({ cloud_name, api_key, api_secret, secure: true })
    return { cloud_name, api_key, api_secret }
}

export interface UploadSignature {
    cloudName: string
    apiKey: string
    params: Record<string, string>
    signature: string
}

/**
 * Prépare un envoi signé pour UNE photo. Le serveur impose l'identifiant, le dossier,
 * les formats acceptés et un redimensionnement : le navigateur ne peut rien modifier
 * sans invalider la signature (valable 1 h côté Cloudinary).
 */
export function signImageUpload(): UploadSignature {
    const { cloud_name, api_key, api_secret } = configured()
    const params: Record<string, string> = {
        timestamp: String(Math.floor(Date.now() / 1000)),
        public_id: `${CLOUDINARY_FOLDER}/${randomUUID().replace(/-/g, "")}`,
        overwrite: "false",
        allowed_formats: "jpg,jpeg,png,webp,avif",
        // Les originaux trop grands sont réduits à 2560 px dès l'envoi.
        transformation: "c_limit,w_2560,h_2560",
    }
    const signature = cloudinary.utils.api_sign_request(params, api_secret)
    return { cloudName: cloud_name, apiKey: api_key, params, signature }
}

/** Supprime des photos de notre compte (les URLs étrangères sont ignorées). */
export async function deleteImages(urls: string[]): Promise<void> {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const ids = [...new Set(urls.map((u) => ourPublicId(u, cloudName)).filter((x): x is string => !!x))]
    if (!ids.length) return
    configured()
    try {
        await cloudinary.api.delete_resources(ids, { resource_type: "image", type: "upload", invalidate: true })
    } catch (err) {
        console.error("deleteImages:", (err as Error).message)
    }
}
