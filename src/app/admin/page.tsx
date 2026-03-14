"use client"

import { useEffect, useState } from "react"
import {
    Building2, MessageSquare, CalendarCheck, TrendingUp,
    ArrowUpRight, ArrowDownRight, Home, Key, FileText,
    Clock, CheckCircle, AlertCircle, ChevronRight, Loader2,
    MapPin
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import type { Property, ContactMessage, VisitRequest } from "@/types/database"

// ─── Types ────────────────────────────────────────────────────
interface Stats {
    totalProperties: number
    availableProperties: number
    totalMessages: number
    newMessages: number
    totalVisits: number
    pendingVisits: number
    propertiesByType: { location: number; vente: number; meuble: number }
}

// minimal dossier type used in this component
interface Dossier {
    id: string | number
    name: string
    email: string
    status?: string
}

// ─── Composants ───────────────────────────────────────────────

function StatCard({
    label, value, sub, icon: Icon, trend
}: {
    label: string; value: string | number; sub?: string;
    icon: React.ElementType; trend?: { value: number; up: boolean }; color?: string
}) {
    return (
        <div className="bg-card border border-border p-6 hover:border-red transition-colors duration-300 group">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 flex items-center justify-center bg-red/10 group-hover:bg-red/20 transition-colors`}>
                    <Icon className="w-5 h-5 text-red" />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${trend.up ? "text-emerald-500" : "text-rose-500"}`}>
                        {trend.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {trend.value}%
                    </div>
                )}
            </div>
            <div className="text-3xl font-serif text-foreground mb-1">{value}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
            {sub && <div className="text-xs text-red mt-1">{sub}</div>}
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; cls: string }> = {
        nouveau: { label: "Nouveau", cls: "bg-red/15 text-red border border-red/20" },
        lu: { label: "Lu", cls: "bg-amber-500/10 text-amber-600 border border-amber-500/20" },
        traité: { label: "Traité", cls: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" },
        archivé: { label: "Archivé", cls: "bg-muted text-muted-foreground border border-border" },
        en_attente: { label: "En attente", cls: "bg-amber-500/10 text-amber-600 border border-amber-500/20" },
        confirmée: { label: "Confirmée", cls: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" },
        annulée: { label: "Annulée", cls: "bg-rose-500/10 text-rose-500 border border-rose-500/20" },
    }
    const s = map[status] || { label: status, cls: "bg-muted text-muted-foreground" }
    return <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider ${s.cls}`}>{s.label}</span>
}

const typeLabels: Record<string, { label: string; icon: React.ElementType }> = {
    location: { label: "Location", icon: Home },
    vente: { label: "Vente", icon: Key },
    meuble: { label: "Meublé", icon: FileText },
}

// ─── Page principale ──────────────────────────────────────────
export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [recentProperties, setRecentProperties] = useState<Property[]>([])
    const [recentMessages, setRecentMessages] = useState<ContactMessage[]>([])
    const [recentVisits, setRecentVisits] = useState<VisitRequest[]>([])
    const [recentDossiers, setRecentDossiers] = useState<Dossier[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadAll() {
            setLoading(true)
            const [
                { data: allProps },
                { data: msgs },
                { data: visits },
                { data: dossiers },
            ] = await Promise.all([
                supabase.from("properties").select("*").order("created_at", { ascending: false }),
                supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
                supabase.from("visit_requests").select("*").order("created_at", { ascending: false }),
                supabase.from("dossiers").select("*").order("created_at", { ascending: false }),
            ])

            const props = allProps as Property[] || []
            const messages = msgs as ContactMessage[] || []
            const visitList = visits as VisitRequest[] || []
            const dossierList = dossiers as Dossier[] || []

            setStats({
                totalProperties: props.length,
                availableProperties: props.filter(p => p.available).length,
                totalMessages: messages.length,
                newMessages: messages.filter(m => m.status === "nouveau").length,
                totalVisits: visitList.length,
                pendingVisits: visitList.filter(v => v.status === "en_attente").length,
                propertiesByType: {
                    location: props.filter(p => p.type === "location").length,
                    vente: props.filter(p => p.type === "vente").length,
                    meuble: props.filter(p => p.type === "meuble").length,
                },
            })

            setRecentProperties(props.slice(0, 5))
            setRecentMessages(messages.slice(0, 5))
            setRecentVisits(visitList.slice(0, 5))
            setRecentDossiers(dossierList.slice(0, 5))
            setLoading(false)
        }
        loadAll()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-96">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-red animate-spin" />
                    <p className="text-muted-foreground text-sm uppercase tracking-widest">Chargement...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 md:p-8 space-y-8">

            {/* ── En-tête ── */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-px w-8 bg-red" />
                        <span className="text-red text-xs tracking-[0.3em] uppercase">Tableau de bord</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-serif font-light text-foreground">
                        Vue d&apos;ensemble
                    </h1>
                </div>
                <p className="text-muted-foreground text-xs uppercase tracking-wider">
                    {new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Biens au total"
                    value={stats?.totalProperties ?? 0}
                    sub={`${stats?.availableProperties} disponibles`}
                    icon={Building2}
                    trend={{ value: 12, up: true }}
                />
                <StatCard
                    label="Messages"
                    value={stats?.totalMessages ?? 0}
                    sub={`${stats?.newMessages} non lus`}
                    icon={MessageSquare}
                    trend={{ value: 8, up: true }}
                />
                <StatCard
                    label="Demandes de visite"
                    value={stats?.totalVisits ?? 0}
                    sub={`${stats?.pendingVisits} en attente`}
                    icon={CalendarCheck}
                    trend={{ value: 5, up: true }}
                />
                <StatCard
                    label="Taux d'occupation"
                    value="94%"
                    sub="Objectif : 95%"
                    icon={TrendingUp}
                    trend={{ value: 2, up: false }}
                />
            </div>

            {/* ── Répartition des biens ── */}
            {stats && (
                <div className="bg-card border border-border p-6">
                    <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-5">
                        Répartition des biens par type
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { key: "location", label: "Location", value: stats.propertiesByType.location, icon: Home },
                            { key: "vente", label: "Vente", value: stats.propertiesByType.vente, icon: Key },
                            { key: "meuble", label: "Meublé", value: stats.propertiesByType.meuble, icon: FileText },
                        ].map((item) => {
                            const total = stats.totalProperties || 1
                            const pct = Math.round((item.value / total) * 100)
                            return (
                                <div key={item.key} className="text-center">
                                    <item.icon className="w-5 h-5 text-red mx-auto mb-2" />
                                    <div className="text-2xl font-serif text-foreground">{item.value}</div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">{item.label}</div>
                                    <div className="h-1.5 bg-background rounded-none overflow-hidden">
                                        <div
                                            className="h-full bg-red transition-all duration-700"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">{pct}%</div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* ── Tables ── */}
            <div className="grid lg:grid-cols-2 gap-6">

                {/* Biens récents */}
                <div className="bg-card border border-border">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                        <h3 className="text-sm uppercase tracking-widest text-foreground">Biens récents</h3>
                        <Link href="/admin/biens" className="text-xs text-red hover:underline flex items-center gap-1">
                            Voir tout <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="divide-y divide-border">
                        {recentProperties.length === 0 ? (
                            <p className="text-center py-8 text-muted-foreground text-sm">Aucun bien</p>
                        ) : recentProperties.map((p) => {
                            const TypeIcon = typeLabels[p.type]?.icon || Building2
                            return (
                                <div key={p.id} className="flex items-center gap-4 px-6 py-4 hover:bg-background transition-colors">
                                    <div
                                        className="w-12 h-12 bg-cover bg-center shrink-0"
                                        style={{ backgroundImage: `url('${p.thumbnail || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=100"}')` }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                            <MapPin className="w-3 h-3 text-red" />
                                            <span className="truncate">{p.location}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                        <span className="text-xs text-red font-medium">{p.price_label || `${p.price.toLocaleString("fr-FR")} FCFA`}</span>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <TypeIcon className="w-3 h-3" />
                                            <span>{typeLabels[p.type]?.label}</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Messages récents */}
                <div className="bg-card border border-border">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                        <h3 className="text-sm uppercase tracking-widest text-foreground">Messages récents</h3>
                        <Link href="/admin/messages" className="text-xs text-red hover:underline flex items-center gap-1">
                            Voir tout <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="divide-y divide-border">
                        {recentMessages.length === 0 ? (
                            <p className="text-center py-8 text-muted-foreground text-sm">Aucun message</p>
                        ) : recentMessages.map((m) => (
                            <div key={m.id} className="flex items-start gap-4 px-6 py-4 hover:bg-background transition-colors">
                                <div className="w-9 h-9 bg-red/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-red text-xs font-serif font-semibold uppercase">
                                        {m.name.charAt(0)}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-0.5">
                                        <p className="text-sm font-medium text-foreground truncate">{m.name}</p>
                                        <StatusBadge status={m.status || "nouveau"} />
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">{m.message}</p>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                        <Clock className="w-3 h-3" />
                                        {m.created_at
                                            ? new Date(m.created_at).toLocaleDateString("fr-FR")
                                            : "—"}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Demandes de visite ── */}
            <div className="bg-card border border-border">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h3 className="text-sm uppercase tracking-widest text-foreground">Demandes de visite récentes</h3>
                    <Link href="/admin/visites" className="text-xs text-red hover:underline flex items-center gap-1">
                        Voir tout <ChevronRight className="w-3 h-3" />
                    </Link>
                </div>
                {recentVisits.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground text-sm">Aucune demande de visite</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    {["Demandeur", "Bien", "Date souhaitée", "Statut", "Actions"].map((h) => (
                                        <th key={h} className="text-left px-6 py-3 text-xs uppercase tracking-widest text-muted-foreground">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {recentVisits.map((v) => (
                                    <tr key={v.id} className="hover:bg-background transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-foreground">{v.name}</p>
                                            <p className="text-xs text-muted-foreground">{v.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-foreground truncate max-w-48">{v.property_name || "—"}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-foreground">
                                                {v.preferred_date
                                                    ? new Date(v.preferred_date).toLocaleDateString("fr-FR")
                                                    : "Non précisé"}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={v.status || "en_attente"} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button className="w-7 h-7 flex items-center justify-center border border-border text-muted-foreground hover:border-emerald-500 hover:text-emerald-500 transition-colors">
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                </button>
                                                <button className="w-7 h-7 flex items-center justify-center border border-border text-muted-foreground hover:border-rose-500 hover:text-rose-500 transition-colors">
                                                    <AlertCircle className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="bg-card border border-border">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h3 className="text-sm uppercase tracking-widest text-foreground">Validation de dossier</h3>
                    <Link href="/admin/dossiers" className="text-xs text-red hover:underline flex items-center gap-1">
                        Voir tout <ChevronRight className="w-3 h-3" />
                    </Link>
                </div>
                <div className="divide-y divide-border">
                    {recentDossiers.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground text-sm">Aucune validation en attente</p>
                    ) : (
                        recentDossiers.map((d) => (
                            <div key={d.id} className="flex items-center justify-between px-6 py-4 hover:bg-background transition-colors">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground">{d.name}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{d.email}</p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <StatusBadge status={d.status || "en_attente"} />
                                    <div className="flex items-center gap-2">
                                        <button className="w-7 h-7 flex items-center justify-center border border-border text-muted-foreground hover:border-emerald-500 hover:text-emerald-500 transition-colors">
                                            <CheckCircle className="w-3.5 h-3.5" />
                                        </button>
                                        <button className="w-7 h-7 flex items-center justify-center border border-border text-muted-foreground hover:border-rose-500 hover:text-rose-500 transition-colors">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>

    )
}