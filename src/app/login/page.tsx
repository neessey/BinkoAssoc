"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Lock, Mail } from "lucide-react"

export default function LoginPage() {
    const router = useRouter()
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError("")

        const fd = new FormData(e.currentTarget)
        const result = await signIn("credentials", {
            email: fd.get("email"),
            password: fd.get("password"),
            redirect: false,
        })

        setLoading(false)
        if (result?.error) {
            setError("Email ou mot de passe incorrect.")
        } else {
            router.push("/admin")
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
                            placeholder="Mot de passe"
                            className="w-full pl-10 pr-4 py-3 border border-border bg-background text-sm
                         focus:outline-none focus:border-red font-(--font-sans) tracking-wide"
                        />
                    </div>

                    {error && (
                        <p className="text-xs text-red tracking-wide text-center">{error}</p>
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