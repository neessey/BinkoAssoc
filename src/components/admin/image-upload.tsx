"use client"

import { useRef, useState } from "react"
import { ImagePlus, Loader2, Star, X } from "lucide-react"
import { adminSignImageUpload } from "@/app/actions/admin"
import { toDisplayUrl } from "@/lib/cloudinary-url"
import { cn } from "@/lib/utils"

const MAX_SIZE = 8 * 1024 * 1024 // 8 Mo
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"]

/** Envoie une photo à Cloudinary avec une signature fournie par le serveur (admin uniquement). */
async function uploadOne(file: File): Promise<string> {
    const { cloudName, apiKey, params, signature } = await adminSignImageUpload()
    const body = new FormData()
    body.append("file", file)
    body.append("api_key", apiKey)
    body.append("signature", signature)
    for (const [k, v] of Object.entries(params)) body.append(k, v)

    const res = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, {
        method: "POST",
        body,
    })
    if (!res.ok) throw new Error(`Cloudinary ${res.status}`)
    const json = (await res.json()) as { secure_url?: string }
    if (!json.secure_url) throw new Error("Réponse Cloudinary invalide")
    return toDisplayUrl(json.secure_url)
}

export function ImageUpload({
    images,
    thumbnail,
    onChange,
}: {
    images: string[]
    thumbnail: string
    onChange: (next: { images: string[]; thumbnail: string }) => void
}) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState("")

    async function handleFiles(files: FileList | null) {
        if (!files?.length) return
        setError("")
        setUploading(true)
        const uploaded: string[] = []
        try {
            for (const file of Array.from(files)) {
                if (!ALLOWED.includes(file.type)) {
                    setError(`${file.name} : format non accepté (JPG, PNG, WEBP, AVIF).`)
                    continue
                }
                if (file.size > MAX_SIZE) {
                    setError(`${file.name} : fichier trop lourd (8 Mo maximum).`)
                    continue
                }
                uploaded.push(await uploadOne(file))
            }
        } catch {
            setError("L'envoi a échoué. Vérifiez votre connexion et réessayez.")
        } finally {
            setUploading(false)
            if (inputRef.current) inputRef.current.value = ""
        }

        if (uploaded.length) {
            const nextImages = [...images, ...uploaded]
            onChange({ images: nextImages, thumbnail: thumbnail || nextImages[0] })
        }
    }

    function remove(url: string) {
        const nextImages = images.filter((u) => u !== url)
        onChange({ images: nextImages, thumbnail: thumbnail === url ? nextImages[0] ?? "" : thumbnail })
    }

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {images.map((url) => (
                    <div key={url} className={cn("relative aspect-square border bg-cover bg-center", thumbnail === url ? "border-red border-2" : "border-border")}
                        style={{ backgroundImage: `url('${url}')` }}>
                        <button type="button" onClick={() => onChange({ images, thumbnail: url })}
                            title="Image principale"
                            className="absolute bottom-1 left-1 w-6 h-6 flex items-center justify-center bg-white/90 border border-border">
                            <Star className={cn("w-3.5 h-3.5", thumbnail === url ? "fill-red text-red" : "text-muted-foreground")} />
                        </button>
                        <button type="button" onClick={() => remove(url)} title="Retirer"
                            className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center bg-white/90 border border-border hover:text-rose-500">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))}
                <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
                    className="aspect-square border border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-red hover:text-red transition-colors disabled:opacity-60">
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
                    <span className="text-[10px] uppercase tracking-wider">{uploading ? "Envoi..." : "Ajouter"}</span>
                </button>
            </div>
            <input ref={inputRef} type="file" accept={ALLOWED.join(",")} multiple hidden
                onChange={(e) => handleFiles(e.target.files)} />
            <p className="text-xs text-muted-foreground">L&apos;étoile choisit l&apos;image principale. JPG, PNG, WEBP — 8 Mo max par photo. Les photos retirées sont supprimées à l&apos;enregistrement.</p>
            {error && <p className="text-xs text-rose-500">{error}</p>}
        </div>
    )
}
