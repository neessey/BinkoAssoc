/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useState, useEffect, useCallback } from "react"
import {
    FileText, Search, Eye, CheckCircle, XCircle, Clock,
    ChevronRight, Loader2, AlertCircle, Trash2,
    User, Briefcase, Home, Phone, Mail, MessageSquare, Check
} from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import { cn } from "@/lib/utils"

// ─── Parse le champ message composite ─────────────────────────
function parseMessage(raw: string | null): {
    messageClient: string
    profil: string
    documents: string[]
} {
    if (!raw) return { messageClient: "", profil: "", documents: [] }

    const messageClient = raw.match(/Message\s*:\s*([\s\S]+?)(?=\n\nProfil|$)/)?.[1]?.trim() || ""
    const profil = raw.match(/Profil\s*:\s*([\s\S]+?)(?=\n\n|$)/)?.[1]?.trim() || ""
    const docsRaw = raw.match(/Documents\s+coch[eé]s?\s*:\s*([\s\S]+?)$/)?.[1]?.trim() || ""
    const documents = docsRaw ? docsRaw.split("|").map(d => d.trim()).filter(Boolean) : []

    return { messageClient, profil, documents }
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Dossier {
    id: string
    created_at: string
    nom: string
    prenom: string
    email: string
    telephone: string
    nationalite: string | null
    situation_familiale: string | null
    type_demande: "location" | "vente"
    property_id: string | null
    property_name: string | null
    profession: string | null
    employeur: string | null
    revenu_mensuel: string | null
    anciennete: string | null
    garant_nom: string | null
    garant_telephone: string | null
    garant_profession: string | null
    message: string | null
    status: "en_attente" | "en_cours" | "validé" | "refusé"
    note_admin: string | null
    validated_at: string | null
}

type Toast = { id: number; message: string; type: "success" | "error" }

const STATUS_CONFIG = {
    en_attente: { label: "En attente", color: "text-yellow-500 border-yellow-500/30 bg-yellow-500/5" },
    en_cours: { label: "En cours", color: "text-blue-400  border-blue-400/30  bg-blue-400/5" },
    validé: { label: "Validé", color: "text-emerald-500 border-emerald-500/30 bg-emerald-500/5" },
    refusé: { label: "Refusé", color: "text-red-500   border-red-500/30   bg-red-500/5" },
}

export default function AdminDossiersPage() {
    const [dossiers, setDossiers] = useState<Dossier[]>([])
    const [selected, setSelected] = useState<Dossier | null>(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [filterStatus, setFilterStatus] = useState<string>("tous")
    const [filterType, setFilterType] = useState<string>("tous")
    const [noteAdmin, setNoteAdmin] = useState("")
    const [saving, setSaving] = useState(false)
    const [deleteModal, setDeleteModal] = useState<string | null>(null)
    const [toasts, setToasts] = useState<Toast[]>([])

    const showToast = (message: string, type: "success" | "error") => {
        const id = Date.now()
        setToasts(t => [...t, { id, message, type }])
        setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
    }

    const loadDossiers = useCallback(async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from("dossiers")
            .select("*")
            .order("created_at", { ascending: false })
        if (!error) setDossiers((data as Dossier[]) || [])
        setLoading(false)
    }, [])

    useEffect(() => { loadDossiers() }, [loadDossiers])

    const openDossier = (d: Dossier) => {
        setSelected(d)
        setNoteAdmin(d.note_admin || "")
    }

    // ── Changer le statut ──────────────────────────────────────
    const updateStatus = async (id: string, status: Dossier["status"]) => {
        setSaving(true)
        const { error } = await supabase
            .from("dossiers")
            .update({
                status,
                note_admin: noteAdmin || null,
                validated_at: status === "validé" ? new Date().toISOString() : null,
            })
            .eq("id", id)

        if (error) {
            showToast("Erreur lors de la mise à jour", "error")
        } else {
            setDossiers(prev => prev.map(d => d.id === id
                ? { ...d, status, note_admin: noteAdmin || null } : d))
            setSelected(prev => prev?.id === id
                ? { ...prev, status, note_admin: noteAdmin || null } : prev)
            showToast(
                status === "validé" ? "✓ Dossier validé — le client peut procéder" :
                    status === "refusé" ? "Dossier refusé" :
                        status === "en_cours" ? "Dossier passé en cours d'étude" :
                            "Statut mis à jour", "success"
            )
        }
        setSaving(false)
    }

    // ── Sauvegarder la note seulement ─────────────────────────
    const saveNote = async () => {
        if (!selected) return
        setSaving(true)
        const { error } = await supabase
            .from("dossiers")
            .update({ note_admin: noteAdmin || null })
            .eq("id", selected.id)
        if (!error) {
            setDossiers(prev => prev.map(d => d.id === selected.id ? { ...d, note_admin: noteAdmin } : d))
            setSelected(prev => prev ? { ...prev, note_admin: noteAdmin } : prev)
            showToast("Note sauvegardée", "success")
        }
        setSaving(false)
    }

    // ── Supprimer ─────────────────────────────────────────────
    const deleteDossier = async (id: string) => {
        const { error } = await supabase.from("dossiers").delete().eq("id", id)
        if (!error) {
            setDossiers(prev => prev.filter(d => d.id !== id))
            if (selected?.id === id) setSelected(null)
            showToast("Dossier supprimé", "success")
        } else {
            showToast("Erreur lors de la suppression", "error")
        }
        setDeleteModal(null)
    }

    // ── Filtres ───────────────────────────────────────────────
    const filtered = dossiers.filter(d => {
        const q = search.toLowerCase()
        const matchSearch = !q ||
            d.nom.toLowerCase().includes(q) ||
            d.prenom.toLowerCase().includes(q) ||
            d.email.toLowerCase().includes(q) ||
            (d.property_name || "").toLowerCase().includes(q)
        const matchStatus = filterStatus === "tous" || d.status === filterStatus
        const matchType = filterType === "tous" || d.type_demande === filterType
        return matchSearch && matchStatus && matchType
    })

    // ── KPI counts ────────────────────────────────────────────
    const counts = {
        tous: dossiers.length,
        en_attente: dossiers.filter(d => d.status === "en_attente").length,
        en_cours: dossiers.filter(d => d.status === "en_cours").length,
        validé: dossiers.filter(d => d.status === "validé").length,
        refusé: dossiers.filter(d => d.status === "refusé").length,
    }

    const fmt = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", {
        day: "2-digit", month: "short", year: "numeric"
    })

    return (
        <div className="p-6 md:p-8 min-h-full">

            {/* Toasts */}
            <div className="fixed bottom-6 right-6 z-50 space-y-2 pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id} className={cn(
                        "flex items-center gap-3 px-5 py-3 shadow-lg max-w-xs",
                        t.type === "success" ? "bg-card border border-emerald-500/40 text-foreground"
                            : "bg-card border border-red/40 text-foreground"
                    )}>
                        {t.type === "success"
                            ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                            : <AlertCircle className="w-4 h-4 text-red shrink-0" />}
                        <p className="text-xs">{t.message}</p>
                    </div>
                ))}
            </div>

            {/* Delete modal */}
            {deleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="bg-card border border-border p-8 max-w-sm w-full mx-4">
                        <Trash2 className="w-10 h-10 text-red mx-auto mb-4" />
                        <h3 className="text-foreground font-serif text-xl text-center mb-2">Supprimer le dossier ?</h3>
                        <p className="text-muted-foreground text-sm text-center mb-8">Cette action est irréversible.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteModal(null)}
                                className="flex-1 py-3 border border-border text-muted-foreground text-xs uppercase tracking-wider hover:border-red hover:text-red transition-colors">
                                Annuler
                            </button>
                            <button onClick={() => deleteDossier(deleteModal)}
                                className="flex-1 py-3 bg-red text-white text-xs uppercase tracking-wider hover:bg-red/90 transition-colors">
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                    <span className="text-red uppercase tracking-wider">Admin</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-foreground uppercase tracking-wider">Dossiers</span>
                </div>
                <h1 className="text-3xl font-serif font-light text-foreground">Dossiers de candidature</h1>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
                {([
                    { key: "tous", label: "Total", icon: FileText, color: "text-foreground" },
                    { key: "en_attente", label: "En attente", icon: Clock, color: "text-yellow-500" },
                    { key: "en_cours", label: "En cours", icon: Eye, color: "text-blue-400" },
                    { key: "validé", label: "Validés", icon: CheckCircle, color: "text-emerald-500" },
                    { key: "refusé", label: "Refusés", icon: XCircle, color: "text-red-500" },
                ] as const).map(({ key, label, icon: Icon, color }) => (
                    <button key={key}
                        onClick={() => setFilterStatus(key === "tous" ? "tous" : key)}
                        className={cn(
                            "bg-card border p-4 text-left transition-all",
                            filterStatus === key || (key === "tous" && filterStatus === "tous")
                                ? "border-red" : "border-border hover:border-red/40"
                        )}>
                        <div className="flex items-center justify-between mb-2">
                            <Icon className={cn("w-4 h-4", color)} />
                            <span className={cn("text-2xl font-serif", color)}>{counts[key]}</span>
                        </div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
                    </button>
                ))}
            </div>

            {/* Filtres + recherche */}
            <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="text" placeholder="Nom, email, bien..." value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-card border border-border text-foreground text-sm focus:border-red focus:outline-none transition-colors" />
                </div>
                <select value={filterType} onChange={e => setFilterType(e.target.value)}
                    className="px-4 py-2.5 bg-card border border-border text-foreground text-sm focus:border-red focus:outline-none appearance-none cursor-pointer">
                    <option value="tous">Tous types</option>
                    <option value="location">Location</option>
                    <option value="vente">Achat</option>
                </select>
            </div>

            {/* Split view */}
            <div className="grid lg:grid-cols-5 gap-6">

                {/* ── Liste ── */}
                <div className="lg:col-span-2 space-y-2">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-6 h-6 text-red animate-spin" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20 text-muted-foreground">
                            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Aucun dossier trouvé</p>
                        </div>
                    ) : filtered.map(d => (
                        <button key={d.id} onClick={() => openDossier(d)}
                            className={cn(
                                "w-full text-left p-4 bg-card border transition-all",
                                selected?.id === d.id ? "border-red" : "border-border hover:border-red/40"
                            )}>
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div>
                                    <p className="text-foreground font-medium text-sm">{d.prenom} {d.nom}</p>
                                    <p className="text-muted-foreground text-xs">{d.email}</p>
                                </div>
                                <span className={cn(
                                    "text-[10px] uppercase tracking-wider px-2 py-1 border shrink-0",
                                    STATUS_CONFIG[d.status].color
                                )}>
                                    {STATUS_CONFIG[d.status].label}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-muted-foreground text-xs truncate max-w-[60%]">
                                    {d.property_name || "Bien non précisé"}
                                </p>
                                <span className={cn(
                                    "text-[10px] uppercase tracking-wider px-2 py-0.5 border",
                                    d.type_demande === "vente"
                                        ? "border-blue-400/40 text-blue-400"
                                        : "border-emerald-500/40 text-emerald-500"
                                )}>
                                    {d.type_demande === "vente" ? "Achat" : "Location"}
                                </span>
                            </div>
                            <p className="text-muted-foreground text-[10px] mt-2">{fmt(d.created_at)}</p>
                        </button>
                    ))}
                </div>

                {/* ── Détail ── */}
                <div className="lg:col-span-3">
                    {!selected ? (
                        <div className="flex items-center justify-center h-full min-h-80 border border-border text-muted-foreground">
                            <div className="text-center">
                                <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                <p className="text-sm">Sélectionnez un dossier</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-card border border-border">

                            {/* Header dossier */}
                            <div className="flex items-center justify-between p-5 border-b border-border">
                                <div>
                                    <h2 className="text-foreground font-serif text-xl">{selected.prenom} {selected.nom}</h2>
                                    <p className="text-muted-foreground text-xs mt-0.5">Déposé le {fmt(selected.created_at)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "text-xs uppercase tracking-wider px-3 py-1 border",
                                        STATUS_CONFIG[selected.status].color
                                    )}>
                                        {STATUS_CONFIG[selected.status].label}
                                    </span>
                                    <button onClick={() => setDeleteModal(selected.id)}
                                        className="w-8 h-8 flex items-center justify-center border border-border text-muted-foreground hover:border-red hover:text-red transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-5 space-y-6">

                                {/* Infos */}
                                <div className="grid md:grid-cols-3 gap-4">
                                    {[
                                        { icon: User, label: "Contact", value: `${selected.prenom} ${selected.nom}` },
                                        { icon: Mail, label: "Email", value: selected.email },
                                        { icon: Phone, label: "Téléphone", value: selected.telephone },
                                        { icon: Briefcase, label: "Profession", value: selected.profession || "—" },
                                        { icon: Briefcase, label: "Employeur", value: selected.employeur || "—" },
                                        { icon: Briefcase, label: "Revenus", value: selected.revenu_mensuel ? selected.revenu_mensuel + "/mois" : "—" },
                                    ].map(({ icon: Icon, label, value }) => (
                                        <div key={label} className="space-y-0.5">
                                            <div className="flex items-center gap-1.5">
                                                <Icon className="w-3.5 h-3.5 text-red" />
                                                <p className="text-muted-foreground text-[10px] uppercase tracking-wider">{label}</p>
                                            </div>
                                            <p className="text-foreground text-sm">{value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Bien visé */}
                                <div className="p-4 bg-background border border-border">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Home className="w-4 h-4 text-red" />
                                        <p className="text-xs text-red uppercase tracking-widest">Bien visé</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-foreground text-sm">{selected.property_name || "Non précisé"}</p>
                                        <span className={cn(
                                            "text-xs uppercase tracking-wider px-2 py-1 border",
                                            selected.type_demande === "vente"
                                                ? "border-blue-400/40 text-blue-400"
                                                : "border-emerald-500/40 text-emerald-500"
                                        )}>
                                            {selected.type_demande === "vente" ? "Achat" : "Location"}
                                        </span>
                                    </div>
                                </div>

                                {/* Garant */}
                                {selected.garant_nom && (
                                    <div className="p-4 bg-background border border-border">
                                        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Garant</p>
                                        <p className="text-foreground text-sm">{selected.garant_nom}</p>
                                        <p className="text-muted-foreground text-xs">{selected.garant_profession} • {selected.garant_telephone}</p>
                                    </div>
                                )}

                                {/* ── Documents + Message parsés ── */}
                                {(() => {
                                    const { messageClient, profil, documents } = parseMessage(selected.message)
                                    return (
                                        <>
                                            {/* Profil */}
                                            {profil && (
                                                <div className="flex items-center gap-3 px-4 py-3 bg-red/5 border border-red/20">
                                                    <User className="w-4 h-4 text-red shrink-0" />
                                                    <div>
                                                        <p className="text-[10px] text-red uppercase tracking-widest mb-0.5">Profil du candidat</p>
                                                        <p className="text-foreground text-sm font-medium">{profil}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Documents cochés */}
                                            {documents.length > 0 && (
                                                <div className="border border-border bg-background">
                                                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                                                        <div className="flex items-center gap-2">
                                                            <FileText className="w-4 h-4 text-red" />
                                                            <p className="text-xs text-red uppercase tracking-widest">Documents à fournir</p>
                                                        </div>
                                                        <span className="text-xs text-emerald-500 border border-emerald-500/30 bg-emerald-500/5 px-2 py-0.5">
                                                            {documents.length} document{documents.length > 1 ? "s" : ""} cochés
                                                        </span>
                                                    </div>
                                                    <div className="divide-y divide-border">
                                                        {documents.map((doc, i) => (
                                                            <div key={i} className="flex items-start gap-3 px-4 py-3">
                                                                <div className="w-5 h-5 bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                                                                    <Check className="w-3 h-3 text-white" />
                                                                </div>
                                                                <p className="text-foreground text-sm leading-snug">{doc}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Message libre du client */}
                                            {messageClient && (
                                                <div className="border border-border bg-background">
                                                    <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                                                        <MessageSquare className="w-4 h-4 text-red" />
                                                        <p className="text-xs text-red uppercase tracking-widest">Message du client</p>
                                                    </div>
                                                    <div className="px-4 py-4">
                                                        <div className="relative pl-4 border-l-2 border-red/30">
                                                            <p className="text-foreground text-sm leading-relaxed">{messageClient}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )
                                })()}

                                {/* Note admin */}
                                <div>
                                    <label className="text-xs uppercase tracking-widest text-muted-foreground block mb-2">
                                        Note interne (visible uniquement par l&apos;admin)
                                    </label>
                                    <textarea
                                        value={noteAdmin}
                                        onChange={e => setNoteAdmin(e.target.value)}
                                        rows={3}
                                        placeholder="Ajouter une note sur ce dossier..."
                                        className="w-full px-4 py-3 bg-background border border-border text-foreground text-sm focus:border-red focus:outline-none resize-none transition-colors"
                                    />
                                    <div className="flex justify-end mt-2">
                                        <button onClick={saveNote} disabled={saving}
                                            className="px-4 py-2 border border-border text-muted-foreground text-xs uppercase tracking-wider hover:border-red hover:text-red transition-colors disabled:opacity-50">
                                            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Sauvegarder la note"}
                                        </button>
                                    </div>
                                </div>

                                {/* ── Actions de validation ── */}
                                <div className="pt-4 border-t border-border">
                                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
                                        Décision sur le dossier
                                    </p>

                                    {/* Message selon statut */}
                                    {selected.status === "validé" && (
                                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/30 mb-4 flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-emerald-500 text-sm font-medium">Dossier validé</p>
                                                <p className="text-muted-foreground text-xs mt-1">
                                                    Le client peut maintenant procéder aux démarches d&apos;achat ou de location.
                                                    Contactez-le pour la suite : <strong>{selected.email}</strong> / <strong>{selected.telephone}</strong>
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {selected.status === "refusé" && (
                                        <div className="p-4 bg-red/5 border border-red/30 mb-4 flex items-start gap-3">
                                            <XCircle className="w-5 h-5 text-red shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-red text-sm font-medium">Dossier refusé</p>
                                                <p className="text-muted-foreground text-xs mt-1">
                                                    Pensez à informer le client par email de la décision et des raisons éventuelles.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            onClick={() => updateStatus(selected.id, "en_cours")}
                                            disabled={saving || selected.status === "en_cours"}
                                            className={cn(
                                                "flex items-center gap-2 px-5 py-3 border text-xs uppercase tracking-wider transition-all disabled:opacity-40",
                                                selected.status === "en_cours"
                                                    ? "border-blue-400 text-blue-400"
                                                    : "border-border text-muted-foreground hover:border-blue-400 hover:text-blue-400"
                                            )}>
                                            <Eye className="w-4 h-4" />
                                            En cours d&apos;étude
                                        </button>

                                        <button
                                            onClick={() => updateStatus(selected.id, "validé")}
                                            disabled={saving || selected.status === "validé"}
                                            className={cn(
                                                "flex items-center gap-2 px-5 py-3 border text-xs uppercase tracking-wider transition-all disabled:opacity-40",
                                                selected.status === "validé"
                                                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
                                                    : "border-border text-muted-foreground hover:border-emerald-500 hover:text-emerald-500"
                                            )}>
                                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                            Valider le dossier
                                        </button>

                                        <button
                                            onClick={() => updateStatus(selected.id, "refusé")}
                                            disabled={saving || selected.status === "refusé"}
                                            className={cn(
                                                "flex items-center gap-2 px-5 py-3 border text-xs uppercase tracking-wider transition-all disabled:opacity-40",
                                                selected.status === "refusé"
                                                    ? "border-red bg-red/10 text-red"
                                                    : "border-border text-muted-foreground hover:border-red hover:text-red"
                                            )}>
                                            <XCircle className="w-4 h-4" />
                                            Refuser
                                        </button>
                                    </div>
                                </div>

                                {/* Lien mailto */}
                                <a href={`mailto:${selected.email}?subject=Votre dossier immobilier - Binko & Associés&body=Bonjour ${selected.prenom},%0A%0A`}
                                    className="flex items-center gap-2 text-muted-foreground hover:text-red text-xs uppercase tracking-wider transition-colors">
                                    <Mail className="w-4 h-4" />
                                    Répondre par email à {selected.email}
                                </a>

                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}