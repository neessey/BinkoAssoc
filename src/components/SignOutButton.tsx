"use client"
import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"

export function SignOutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 text-xs text-muted-foreground
                 hover:text-red transition-colors font-(--font-sans) tracking-wider uppercase"
        >
            <LogOut className="w-3.5 h-3.5" />
            Déconnexion
        </button>
    )
}