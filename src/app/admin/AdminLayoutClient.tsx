// app/admin/AdminLayoutClient.tsx
/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
    LayoutDashboard, Building2, MessageSquare, CalendarCheck,
    MapPin, Settings, LogOut, Menu, X, ChevronRight, Bell,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Initiales à partir de l'email (ex: "admin@binko.ci" → "A")
function getInitial(email: string) {
    return email.charAt(0).toUpperCase()
}

export default function AdminLayoutClient({
    children,
    userEmail,
}: {
    children: React.ReactNode
    userEmail: string
}) {
    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [newMessages, setNewMessages] = useState(0)
    const [newVisites, setNewVisites] = useState(0)
    const pathname = usePathname()

    // ── Charger les compteurs ──────────────────────────────────
    async function loadCounts() {
        const [{ count: msgCount }, { count: visitCount }] = await Promise.all([
            supabase
                .from("contact_messages")
                .select("*", { count: "exact", head: true })
                .eq("status", "nouveau"),
            supabase
                .from("visit_requests")
                .select("*", { count: "exact", head: true })
                .eq("status", "en_attente"),
        ])
        setNewMessages(msgCount || 0)
        setNewVisites(visitCount || 0)
    }

    useEffect(() => {
        loadCounts()
        const interval = setInterval(loadCounts, 30_000)

        const msgSub = supabase
            .channel("messages-changes")
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "contact_messages" }, loadCounts)
            .on("postgres_changes", { event: "UPDATE", schema: "public", table: "contact_messages" }, loadCounts)
            .subscribe()

        const visitSub = supabase
            .channel("visits-changes")
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "visit_requests" }, loadCounts)
            .on("postgres_changes", { event: "UPDATE", schema: "public", table: "visit_requests" }, loadCounts)
            .subscribe()

        return () => {
            clearInterval(interval)
            supabase.removeChannel(msgSub)
            supabase.removeChannel(visitSub)
        }
    }, [])

    const totalNew = newMessages + newVisites

    const navItems = [
        { href: "/admin", icon: LayoutDashboard, label: "Vue d'ensemble", badge: 0 },
        { href: "/admin/biens", icon: Building2, label: "Biens", badge: 0 },
        { href: "/admin/messages", icon: MessageSquare, label: "Messages", badge: newMessages },
        { href: "/admin/visites", icon: CalendarCheck, label: "Visites", badge: newVisites },
        { href: "/admin/quartiers", icon: MapPin, label: "Quartiers", badge: 0 },
        { href: "/admin/dossiers", icon: MapPin, label: "Dossiers", badge: 0 },
        { href: "/admin/settings", icon: Settings, label: "Paramètres", badge: 0 },
    ]

    const NavLink = ({
        item,
        onClick,
    }: {
        item: (typeof navItems)[0]
        onClick?: () => void
    }) => {
        const active = pathname === item.href
        return (
            <Link
                href={item.href}
                onClick={onClick}
                className={cn(
                    "flex items-center gap-3 px-3 py-3 transition-all duration-200 group relative",
                    active
                        ? "bg-red text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-background"
                )}
            >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && (
                    <>
                        <span className="text-xs tracking-wider uppercase font-medium flex-1">
                            {item.label}
                        </span>
                        {item.badge > 0 && (
                            <span
                                className={cn(
                                    "min-w-5 h-5 px-1 flex items-center justify-center text-[10px] font-medium rounded-full",
                                    active ? "bg-white text-red" : "bg-red text-white"
                                )}
                            >
                                {item.badge > 99 ? "99+" : item.badge}
                            </span>
                        )}
                        {active && item.badge === 0 && (
                            <ChevronRight className="w-3 h-3 ml-auto" />
                        )}
                    </>
                )}
                {collapsed && item.badge > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red" />
                )}
            </Link>
        )
    }

    // ── Bloc utilisateur réutilisé dans desktop + mobile ──────
    const UserBlock = () => (
        <div className="p-3 border-t border-border">
            <div
                className={cn(
                    "flex items-center gap-3 px-3 py-3",
                    collapsed ? "justify-center" : ""
                )}
            >
                <div className="w-8 h-8 bg-red flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-serif font-semibold">
                        {getInitial(userEmail)}
                    </span>
                </div>
                {!collapsed && (
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground font-medium truncate">
                            Administrateur
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                    </div>
                )}
            </div>

            {/* ✅ signOut() au lieu d'un simple lien vers "/" */}
            <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-red transition-colors mt-1",
                    collapsed ? "justify-center" : ""
                )}
            >
                <LogOut className="w-4 h-4 shrink-0" />
                {!collapsed && (
                    <span className="text-xs uppercase tracking-wider">Déconnexion</span>
                )}
            </button>
        </div>
    )

    return (
        <div className="min-h-screen bg-background flex">

            {/* ─── Sidebar Desktop ─── */}
            <aside
                className={cn(
                    "hidden lg:flex flex-col border-r border-border transition-all duration-300 bg-white",
                    collapsed ? "w-20" : "w-64"
                )}
            >
                <div className="h-18 flex items-center justify-between px-6 border-b border-border shrink-0">
                    {!collapsed && (
                        <div className="flex flex-col leading-tight">
                            <span className="text-xl font-serif font-semibold text-foreground tracking-wide">
                                BINKO
                            </span>
                            <span className="text-red text-[9px] tracking-[0.3em] uppercase font-sans">
                                Admin Panel
                            </span>
                        </div>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-red transition-colors ml-auto"
                    >
                        <Menu className="w-4 h-4" />
                    </button>
                </div>

                <nav className="flex-1 py-6 space-y-1 px-3 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink key={item.href} item={item} />
                    ))}
                </nav>

                <UserBlock />
            </aside>

            {/* ─── Mobile Sidebar ─── */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="relative w-64 bg-white flex flex-col border-r border-border z-10">
                        <div className="h-18 flex items-center justify-between px-6 border-b border-border">
                            <div className="flex flex-col leading-tight">
                                <span className="text-xl font-serif font-semibold text-foreground">
                                    BINKO
                                </span>
                                <span className="text-red text-[9px] tracking-[0.3em] uppercase">
                                    Admin Panel
                                </span>
                            </div>
                            <button onClick={() => setMobileOpen(false)}>
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>
                        <nav className="flex-1 py-6 space-y-1 px-3">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.href}
                                    item={item}
                                    onClick={() => setMobileOpen(false)}
                                />
                            ))}
                        </nav>
                        {/* Email visible sur mobile aussi */}
                        <div className="p-3 border-t border-border">
                            <div className="flex items-center gap-3 px-3 py-3">
                                <div className="w-8 h-8 bg-red flex items-center justify-center shrink-0">
                                    <span className="text-white text-xs font-serif font-semibold">
                                        {getInitial(userEmail)}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-foreground font-medium truncate">
                                        Administrateur
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="w-full flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-red transition-colors mt-1"
                            >
                                <LogOut className="w-4 h-4 shrink-0" />
                                <span className="text-xs uppercase tracking-wider">Déconnexion</span>
                            </button>
                        </div>
                    </aside>
                </div>
            )}

            {/* ─── Main Content ─── */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-18 bg-white border-b border-border flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-4">
                        <button className="lg:hidden" onClick={() => setMobileOpen(true)}>
                            <Menu className="w-5 h-5 text-muted-foreground" />
                        </button>
                        <div className="hidden sm:flex items-center gap-2 text-muted-foreground text-xs">
                            <span className="text-red uppercase tracking-wider">Admin</span>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-foreground capitalize tracking-wider">
                                {pathname.split("/admin/")[1] || "Vue d'ensemble"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-2">
                        <button className="relative w-9 h-9 flex items-center justify-center border border-border text-muted-foreground hover:text-red hover:border-red transition-colors">
                            <Bell className="w-4 h-4" />
                            {totalNew > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-0.5 bg-red text-white text-[9px] font-medium rounded-full flex items-center justify-center">
                                    {totalNew > 99 ? "99+" : totalNew}
                                </span>
                            )}
                        </button>

                        <Link
                            href="/"
                            target="_blank"
                            className="hidden sm:flex items-center gap-2 px-4 py-2 border border-border text-xs uppercase tracking-wider text-muted-foreground hover:border-red hover:text-red transition-colors"
                        >
                            Voir le site
                        </Link>
                    </div>
                </header>

                <main className="flex-1 overflow-auto">{children}</main>
            </div>
        </div>
    )
}