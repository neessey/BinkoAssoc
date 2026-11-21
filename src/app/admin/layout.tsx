import { redirect } from "next/navigation"
import { getAdminSession } from "@/lib/server/session"
import AdminLayoutClient from "./AdminLayoutClient"

// Toujours rendu à la demande : la session est vérifiée à chaque requête.
export const dynamic = "force-dynamic"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await getAdminSession()
    if (!session) redirect("/login")

    return <AdminLayoutClient userEmail={session.email}>{children}</AdminLayoutClient>
}
