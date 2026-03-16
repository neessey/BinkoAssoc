/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useEffect, useState, useCallback } from "react"
import {
    CalendarCheck, Loader2, Phone, Mail, User,
    CheckCircle, XCircle, Clock, Building2, Trash2, Search, X, AlertCircle
} from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import type { VisitRequest } from "@/types/database"
import { cn } from "@/lib/utils"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type VisitStatus = "en_attente" | "confirmée" | "annulée"

const statusConfig: Record<VisitStatus, { label: string; cls: string }> = {
    en_attente: { label: "En attente", cls: "bg-amber-500/10 text-amber-600 border border-amber-500/20" },
    confirmée: { label: "Confirmée", cls: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" },
    annulée: { label: "Annulée", cls: "bg-rose-500/10 text-rose-500 border border-rose-500/20" },
}

// ─── Toast ────────────────────────────────────────────────────
type ToastType = "success" | "error"
function Toast({ msg, type, onClose }: { msg: string; type: ToastType; onClose: () => void }) {
    useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
    return (
        <div className={cn(
            "fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 shadow-2xl border max-w-sm",
            type === "success" ? "bg-white border-emerald-500/30 text-emerald-600" : "bg-white border-red/30 text-red"
        )}>
            {type === "success" ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <p className="text-sm flex-1">{msg}</p>
            <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
    )
}

// ─── Info block ───────────────────────────────────────────────
function InfoBlock({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
    return (
        <div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wider mb-1">
                <Icon className="w-3.5 h-3.5 text-red" />{label}
            </div>
            <p className="text-sm text-foreground">{value}</p>
        </div>
    )
}

export default function AdminVisites() {
    const [visits, setVisits] = useState<VisitRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [filter, setFilter] = useState<VisitStatus | "all">("all")
    const [selected, setSelected] = useState<VisitRequest | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [updating, setUpdating] = useState(false)
    const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(null)

    const showToast = (msg: string, type: ToastType) => setToast({ msg, type })

    const load = useCallback(async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from("visit_requests")
            .select("*")
            .order("created_at", { ascending: false })

        if (error) {
            showToast("Erreur de chargement : " + error.message, "error")
        } else {
            setVisits((data as VisitRequest[]) || [])
        }
        setLoading(false)
    }, [])

    useEffect(() => { load() }, [load])

    const filtered = visits.filter((v) => {
        const matchFilter = filter === "all" || v.status === filter
        const matchSearch = !search ||
            v.name.toLowerCase().includes(search.toLowerCase()) ||
            (v.property_name || "").toLowerCase().includes(search.toLowerCase())
        return matchFilter && matchSearch
    })

    async function updateStatus(id: string, status: VisitStatus) {
        setUpdating(true)
        const { error } = await supabase
            .from("visit_requests")
            .update({ status })
            .eq("id", id)
        setUpdating(false)

        if (error) {
            showToast("Erreur : " + error.message, "error")
            return
        }

        setVisits(prev => prev.map(v => v.id === id ? { ...v, status } : v))
        if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null)

        const labels: Record<VisitStatus, string> = {
            confirmée: "✅ Visite confirmée !",
            annulée: "Visite annulée.",
            en_attente: "Remis en attente.",
        }
        showToast(labels[status], "success")
    }

    async function handleDelete(id: string) {
        setDeleting(true)
        const { error } = await supabase.from("visit_requests").delete().eq("id", id)
        setDeleting(false)
        setDeleteId(null)

        if (error) {
            showToast("Erreur suppression : " + error.message, "error")
            return
        }

        setVisits(prev => prev.filter(v => v.id !== id))
        if (selected?.id === id) setSelected(null)
        showToast("Demande supprimée.", "success")
    }

    const counts = {
        all: visits.length,
        en_attente: visits.filter(v => v.status === "en_attente").length,
        confirmée: visits.filter(v => v.status === "confirmée").length,
        annulée: visits.filter(v => v.status === "annulée").length,
    }

    return (
        <div className="p-6 md:p-8 space-y-6">
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-px w-8 bg-red" />
                    <span className="text-red text-xs tracking-[0.3em] uppercase">Planning</span>
                </div>
                <h1 className="text-3xl font-serif font-light text-foreground">Demandes de visite</h1>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { k: "all", label: "Total" },
                    { k: "en_attente", label: "En attente" },
                    { k: "confirmée", label: "Confirmées" },
                    { k: "annulée", label: "Annulées" },
                ].map(({ k, label }) => (
                    <button key={k} onClick={() => setFilter(k as VisitStatus | "all")}
                        className={cn(
                            "p-4 border text-left transition-colors",
                            filter === k ? "border-red bg-red/5" : "border-border bg-white hover:border-red/50"
                        )}>
                        <div className="text-2xl font-serif text-foreground">{counts[k as keyof typeof counts]}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">{label}</div>
                    </button>
                ))}
            </div>

            {/* Recherche */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Rechercher par nom ou bien..."
                    className="w-full bg-white border border-border pl-10 pr-4 py-3 text-sm focus:border-red focus:outline-none" />
            </div>

            <div className="flex flex-col lg:flex-row gap-6">

                {/* ─── Liste ─── */}
                <div className="lg:w-2/5">
                    <div className="bg-white border border-border divide-y divide-border">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-5 h-5 text-red animate-spin" />
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-12">
                                <CalendarCheck className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">Aucune demande</p>
                            </div>
                        ) : filtered.map((v) => {
                            const s = statusConfig[v.status as VisitStatus] || statusConfig.en_attente
                            return (
                                <button key={v.id} onClick={() => setSelected(v)}
                                    className={cn(
                                        "w-full text-left px-4 py-4 hover:bg-background transition-colors",
                                        selected?.id === v.id && "bg-background border-l-2 border-l-red"
                                    )}>
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <span className="font-medium text-sm text-foreground">{v.name}</span>
                                        <span className={cn("px-1.5 py-0.5 text-[9px] uppercase tracking-wider shrink-0", s.cls)}>
                                            {s.label}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate mb-1 flex items-center gap-1">
                                        <Building2 className="w-3 h-3 shrink-0" />
                                        {v.property_name || "Bien non précisé"}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Clock className="w-3 h-3" />
                                        {v.preferred_date
                                            ? `Visite le ${new Date(v.preferred_date).toLocaleDateString("fr-FR")}`
                                            : "Date non précisée"}
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* ─── Détail ─── */}
                <div className="lg:flex-1">
                    {!selected ? (
                        <div className="bg-white border border-border min-h-64 flex items-center justify-center">
                            <div className="text-center">
                                <CalendarCheck className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                                <p className="text-muted-foreground text-sm">Sélectionnez une demande</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white border border-border">
                            {/* Header */}
                            <div className="px-6 py-5 border-b border-border">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-xl font-serif text-foreground">{selected.name}</h3>
                                    <span className={cn("px-2 py-1 text-[10px] uppercase tracking-wider",
                                        statusConfig[selected.status as VisitStatus]?.cls)}>
                                        {statusConfig[selected.status as VisitStatus]?.label}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    <a href={`mailto:${selected.email}`}
                                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-red transition-colors">
                                        <Mail className="w-4 h-4 text-red" />{selected.email}
                                    </a>
                                    {selected.phone && (
                                        <a href={`tel:${selected.phone}`}
                                            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-red transition-colors">
                                            <Phone className="w-4 h-4 text-red" />{selected.phone}
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Infos */}
                            <div className="px-6 py-5 grid sm:grid-cols-2 gap-5 border-b border-border">
                                <InfoBlock icon={Building2} label="Bien demandé"
                                    value={selected.property_name || "Non précisé"} />
                                <InfoBlock icon={Clock} label="Date souhaitée"
                                    value={selected.preferred_date
                                        ? new Date(selected.preferred_date).toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
                                        : "Non précisée"} />
                                <InfoBlock icon={User} label="Demande reçue le"
                                    value={selected.created_at ? new Date(selected.created_at).toLocaleDateString("fr-FR") : "—"} />
                            </div>

                            {/* Message */}
                            {selected.message && (
                                <div className="px-6 py-5 border-b border-border">
                                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Message</p>
                                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                                </div>
                            )}

                            {/* Actions statut */}
                            <div className="px-6 py-5 border-b border-border">
                                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Mettre à jour le statut</p>
                                <div className="flex flex-wrap gap-3">
                                    <button onClick={() => updateStatus(selected.id!, "confirmée")}
                                        disabled={selected.status === "confirmée" || updating}
                                        className={cn(
                                            "flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-wider border transition-colors disabled:opacity-60",
                                            selected.status === "confirmée"
                                                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                                                : "border-border text-muted-foreground hover:border-emerald-500 hover:text-emerald-600"
                                        )}>
                                        {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                        Confirmer
                                    </button>
                                    <button onClick={() => updateStatus(selected.id!, "annulée")}
                                        disabled={selected.status === "annulée" || updating}
                                        className={cn(
                                            "flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-wider border transition-colors disabled:opacity-60",
                                            selected.status === "annulée"
                                                ? "border-rose-500 bg-rose-500/10 text-rose-500"
                                                : "border-border text-muted-foreground hover:border-rose-500 hover:text-rose-500"
                                        )}>
                                        <XCircle className="w-4 h-4" /> Annuler
                                    </button>
                                    <button onClick={() => updateStatus(selected.id!, "en_attente")}
                                        disabled={selected.status === "en_attente" || updating}
                                        className={cn(
                                            "flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-wider border transition-colors disabled:opacity-60",
                                            selected.status === "en_attente"
                                                ? "border-amber-500 bg-amber-500/10 text-amber-600"
                                                : "border-border text-muted-foreground hover:border-amber-500 hover:text-amber-600"
                                        )}>
                                        <Clock className="w-4 h-4" /> En attente
                                    </button>
                                </div>
                            </div>

                            {/* Reply + delete */}
                            <div className="px-6 py-5 flex gap-3">
                                <a href={`mailto:${selected.email}?subject=Votre demande de visite - ${selected.property_name || "Binko"}`}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 border border-red text-red text-xs uppercase tracking-widest hover:bg-red hover:text-white transition-colors">
                                    <Mail className="w-4 h-4" /> Répondre par email
                                </a>
                                <button onClick={() => setDeleteId(selected.id!)}
                                    className="flex items-center gap-2 px-4 py-3 border border-border text-muted-foreground text-xs hover:border-rose-500 hover:text-rose-500 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirm delete */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={() => !deleting && setDeleteId(null)} />
                    <div className="relative bg-white border border-border p-8 max-w-sm w-full z-10 text-center">
                        <Trash2 className="w-10 h-10 text-rose-500 mx-auto mb-4" />
                        <h3 className="text-xl font-serif text-foreground mb-2">Supprimer cette demande ?</h3>
                        <p className="text-muted-foreground text-sm mb-6">Cette action est irréversible.</p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => setDeleteId(null)} disabled={deleting}
                                className="px-6 py-2.5 border border-border text-sm text-muted-foreground disabled:opacity-50">
                                Annuler
                            </button>
                            <button onClick={() => handleDelete(deleteId)} disabled={deleting}
                                className="flex items-center gap-2 px-6 py-2.5 bg-rose-500 text-white text-sm hover:bg-rose-600 disabled:opacity-60 min-w-28 justify-center">
                                {deleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Suppression...</> : "Supprimer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}