"use client"
import { signOut } from "firebase/auth"
import { clientAuth } from "@/lib/firebase/client"

/** Déconnexion complète : cookie serveur supprimé + sessions révoquées + Firebase client. */
export async function logoutAdmin(redirectTo = "/login") {
    try {
        await fetch("/api/session", { method: "DELETE" })
    } finally {
        try {
            await signOut(await clientAuth())
        } catch {
            /* ignore */
        }
        window.location.href = redirectTo
    }
}
