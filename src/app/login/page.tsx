"use client"
import { useState } from "react"
import { signInWithEmailAndPassword, signOut } from "firebase/auth"
import { Lock, Mail } from "lucide-react"
import { clientAuth } from "@/lib/firebase/client"

export default function LoginPage() {
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError("")

        const fd = new FormData(e.currentTarget)
        const email = String(fd.get("email") ?? "").trim()
        const password = String(fd.get("password") ?? "")

        try {
            const auth = await clientAuth()
            const cred = await signInWithEmailAndPassword(auth, email, password)
            const idToken = await cred.user.getIdToken(true)

            const res = await fetch("/api/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken }),
            })

            if (!res.ok) {
                await signOut(auth)
                setError(res.status === 403 ? "Ce compte n'a pas accès à l'administration." : "Connexion refusée.")
                setLoading(false)
                return
            }

            // Rechargement complet pour que le serveur lise le nouveau cookie.
            window.location.href = "/admin"
        } catch (err) {
            const code = (err as { code?: string }).code ?? ""
            setError(
                code === "auth/too-many-requests"
                    ? "Trop de tentatives. Réessayez dans quelques minutes."
                    : "Email ou mot de passe incorrect."
            )
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-background">
            <div className="w-full max-w-sm border border-border p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-xl font-(--font-serif) tracking-widest uppercase">
                        Espace Admin
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1 tracking-wider">
                        Binko & Associés
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            name="email"
                            type="email"
                            required
                            autoComplete="username"
                            placeholder="Email"
                            className="w-full pl-10 pr-4 py-3 border border-border bg-background text-sm
                         focus:outline-none focus:border-red font-(--font-sans) tracking-wide"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            name="password"
                            type="password"
                            required
                            autoComplete="current-password"
                            placeholder="Mot de passe"
                            className="w-full pl-10 pr-4 py-3 border border-border bg-background text-sm
                         focus:outline-none focus:border-red font-(--font-sans) tracking-wide"
                        />
                    </div>

                    {error && (
                        <p role="alert" className="text-xs text-red tracking-wide text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-red text-primary-foreground font-(--font-sans)
                       text-xs tracking-widest uppercase hover:bg-red/90 transition-all
                       disabled:opacity-60"
                    >
                        {loading ? "Connexion..." : "Se connecter"}
                    </button>
                </form>
            </div>
        </main>
    )
}
