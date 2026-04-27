// lib/auth.ts
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { createClient } from "@supabase/supabase-js"

declare module "next-auth" {
    interface User {
        id: string
        role: string
    }
    interface Session {
        user: User & {
            id: string
            role: string
        }
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        role: string
    }
}

// Initialisation du client Supabase (côté serveur, utilise la clé anon car on ne modifie rien)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Mot de passe", type: "password" },
            },
            async authorize(credentials) {
                console.log("🔐 Tentative login pour:", credentials?.email)
                if (!credentials?.email || !credentials?.password) return null

                // Récupère l'admin
                const { data: admin, error } = await supabase
                    .from("admins")
                    .select("id, email, password_hash, role")
                    .eq("email", credentials.email)
                    .single()

                console.log("📦 Admin trouvé ?", admin ? "OUI" : "NON", error ? error.message : "")

                if (!admin) return null

                const isValid = await bcrypt.compare(credentials.password, admin.password_hash)
                console.log("✓ Mot de passe valide ?", isValid)

                if (!isValid) return null

                return { id: admin.id, email: admin.email, role: admin.role }
            }
        }),
    ],
    session: { strategy: "jwt" },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = user.role
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                    ; (session.user as any).role = token.role
            }
            return session
        },
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
}