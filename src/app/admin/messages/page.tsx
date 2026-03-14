/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useEffect, useState, useCallback } from "react"
import {
    MessageSquare, Loader2, Mail, Phone, Clock,
    Trash2, Search, X, CheckCircle, AlertCircle
} from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import type { ContactMessage } from "@/types/database"
import { cn } from "@/lib/utils"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type MessageStatus = "nouveau" | "lu" | "traité" | "archivé"

const statusConfig: Record<MessageStatus, { label: string; cls: string }> = {
    nouveau: { label: "Nouveau", cls: "bg-red/10 text-red border border-red/20" },
    lu: { label: "Lu", cls: "bg-amber-500/10 text-amber-600 border border-amber-500/20" },
    traité: { label: "Traité", cls: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" },
    archivé: { label: "Archivé", cls: "bg-muted text-muted-foreground border border-border" },
}

// ─── Toast ────────────────────────────────────────────────────
type ToastType = "success" | "error"
function Toast({ msg, type, onClose }: { msg: string; type: ToastType; onClose: () => void }) {
    useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
    return (
        <div className={cn(
            "fixed bottom-6 right-6 z-100 flex items-center gap-3 px-5 py-4 shadow-2xl border max-w-sm",
            type === "success" ? "bg-white border-emerald-500/30 text-emerald-600" : "bg-white border-red/30 text-red"
        )}>
            {type === "success" ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <p className="text-sm flex-1">{msg}</p>
            <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
    )
}

export default function AdminMessages() {
    const [messages, setMessages] = useState<ContactMessage[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [filter, setFilter] = useState<MessageStatus | "all">("all")
    const [selected, setSelected] = useState<ContactMessage | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [updating, setUpdating] = useState(false)
    const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(null)

    const showToast = (msg: string, type: ToastType) => setToast({ msg, type })

    const load = useCallback(async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from("contact_messages")
            .select("*")
            .order("created_at", { ascending: false })

        if (error) {
            showToast("Erreur de chargement : " + error.message, "error")
        } else {
            setMessages((data as ContactMessage[]) || [])
        }
        setLoading(false)
    }, [])

    useEffect(() => { load() }, [load])

    const filtered = messages.filter((m) => {
        const matchFilter = filter === "all" || m.status === filter
        const matchSearch = !search ||
            m.name.toLowerCase().includes(search.toLowerCase()) ||
            m.email.toLowerCase().includes(search.toLowerCase()) ||
            m.message.toLowerCase().includes(search.toLowerCase())
        return matchFilter && matchSearch
    })

    async function updateStatus(id: string, status: MessageStatus) {
        setUpdating(true)
        const { error } = await supabase
            .from("contact_messages")
            .update({ status })
            .eq("id", id)
        setUpdating(false)

        if (error) {
            showToast("Erreur : " + error.message, "error")
            return
        }

        // Mettre à jour l'état local immédiatement sans recharger
        setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m))
        if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null)
        showToast(`Statut mis à jour : ${statusConfig[status].label}`, "success")
    }

    async function openMessage(msg: ContactMessage) {
        setSelected(msg)
        // Marquer automatiquement comme lu si nouveau
        if (msg.status === "nouveau") {
            await updateStatus(msg.id!, "lu")
        }
    }

    async function handleDelete(id: string) {
        setDeleting(true)
        const { error } = await supabase.from("contact_messages").delete().eq("id", id)
        setDeleting(false)
        setDeleteId(null)

        if (error) {
            showToast("Erreur suppression : " + error.message, "error")
            return
        }

        setMessages(prev => prev.filter(m => m.id !== id))
        if (selected?.id === id) setSelected(null)
        showToast("Message supprimé.", "success")
    }

    const counts = {
        all: messages.length,
        nouveau: messages.filter(m => m.status === "nouveau").length,
        lu: messages.filter(m => m.status === "lu").length,
        traité: messages.filter(m => m.status === "traité").length,
        archivé: messages.filter(m => m.status === "archivé").length,
    }

    return (
        <div className="p-6 md:p-8 space-y-6">
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-px w-8 bg-red" />
                    <span className="text-red text-xs tracking-[0.3em] uppercase">Boîte de réception</span>
                </div>
                <h1 className="text-3xl font-serif font-light text-foreground">Messages de contact</h1>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(["all", "nouveau", "lu", "traité"] as const).map((k) => (
                    <button key={k} onClick={() => setFilter(k)}
                        className={cn(
                            "p-4 border text-left transition-colors",
                            filter === k ? "border-red bg-red/5" : "border-border bg-white hover:border-red/50"
                        )}>
                        <div className="text-2xl font-serif text-foreground">{counts[k]}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">
                            {k === "all" ? "Total" : statusConfig[k as MessageStatus].label}
                        </div>
                    </button>
                ))}
            </div>

            <div className="flex flex-col lg:flex-row gap-6">

                {/* ─── Liste ─── */}
                <div className="lg:w-2/5 space-y-3">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                            <input value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Rechercher..." type="text"
                                className="w-full bg-white border border-border pl-9 pr-3 py-2.5 text-sm focus:border-red focus:outline-none" />
                        </div>
                        <select value={filter} onChange={e => setFilter(e.target.value as MessageStatus | "all")}
                            className="bg-white border border-border px-3 text-xs uppercase tracking-wider text-foreground focus:border-red focus:outline-none appearance-none cursor-pointer pr-6">
                            <option value="all">Tous</option>
                            <option value="nouveau">Nouveaux</option>
                            <option value="lu">Lus</option>
                            <option value="traité">Traités</option>
                            <option value="archivé">Archivés</option>
                        </select>
                    </div>

                    <div className="bg-white border border-border divide-y divide-border">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-5 h-5 text-red animate-spin" />
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-12">
                                <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">Aucun message</p>
                            </div>
                        ) : filtered.map((msg) => (
                            <button key={msg.id} onClick={() => openMessage(msg)}
                                className={cn(
                                    "w-full text-left px-4 py-4 hover:bg-background transition-colors",
                                    selected?.id === msg.id && "bg-background border-l-2 border-l-red"
                                )}>
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <span className={cn("font-medium text-sm",
                                        msg.status === "nouveau" ? "text-foreground" : "text-muted-foreground"
                                    )}>
                                        {msg.name}
                                        {msg.status === "nouveau" && (
                                            <span className="ml-2 inline-block w-2 h-2 rounded-full bg-red align-middle" />
                                        )}
                                    </span>
                                    <span className={cn("px-1.5 py-0.5 text-[9px] uppercase tracking-wider shrink-0",
                                        statusConfig[msg.status as MessageStatus]?.cls || ""
                                    )}>
                                        {statusConfig[msg.status as MessageStatus]?.label}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground truncate mb-1">{msg.message}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    {msg.created_at ? new Date(msg.created_at).toLocaleDateString("fr-FR") : "—"}
                                    {msg.subject && <span className="text-red truncate">· {msg.subject}</span>}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ─── Détail ─── */}
                <div className="lg:flex-1">
                    {!selected ? (
                        <div className="bg-white border border-border min-h-64 flex items-center justify-center">
                            <div className="text-center">
                                <Mail className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                                <p className="text-muted-foreground text-sm">Sélectionnez un message pour le lire</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white border border-border">
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-border flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-serif text-foreground">{selected.name}</h3>
                                    <div className="flex items-center flex-wrap gap-4 mt-1">
                                        <a href={`mailto:${selected.email}`}
                                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red transition-colors">
                                            <Mail className="w-3 h-3" />{selected.email}
                                        </a>
                                        {selected.phone && (
                                            <a href={`tel:${selected.phone}`}
                                                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red transition-colors">
                                                <Phone className="w-3 h-3" />{selected.phone}
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <span className={cn("px-2 py-1 text-[10px] uppercase tracking-wider shrink-0",
                                    statusConfig[selected.status as MessageStatus]?.cls || ""
                                )}>
                                    {statusConfig[selected.status as MessageStatus]?.label}
                                </span>
                            </div>

                            {/* Meta */}
                            <div className="px-6 py-3 border-b border-border bg-background flex items-center gap-6 text-xs text-muted-foreground flex-wrap">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {selected.created_at ? new Date(selected.created_at).toLocaleString("fr-FR") : "—"}
                                </span>
                                {selected.subject && (
                                    <span>Sujet : <span className="text-foreground">{selected.subject}</span></span>
                                )}
                            </div>

                            {/* Message */}
                            <div className="px-6 py-6">
                                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                            </div>

                            {/* Changer statut */}
                            <div className="px-6 py-4 border-t border-border">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Changer le statut</p>
                                <div className="flex flex-wrap gap-2">
                                    {(["lu", "traité", "archivé"] as MessageStatus[]).map((s) => (
                                        <button key={s} onClick={() => updateStatus(selected.id!, s)}
                                            disabled={selected.status === s || updating}
                                            className={cn(
                                                "flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-wider border transition-colors disabled:opacity-60",
                                                selected.status === s
                                                    ? "border-red bg-red text-white"
                                                    : "border-border text-muted-foreground hover:border-red hover:text-red"
                                            )}>
                                            {updating && selected.status !== s ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                                <CheckCircle className="w-3.5 h-3.5" />
                                            )}
                                            {statusConfig[s].label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="px-6 pb-6 flex gap-3">
                                <a href={`mailto:${selected.email}?subject=Re: ${selected.subject || "Votre demande"}`}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 border border-red text-red text-xs uppercase tracking-widest hover:bg-red hover:text-white transition-colors">
                                    <Mail className="w-4 h-4" />
                                    Répondre par email
                                </a>
                                <button onClick={() => setDeleteId(selected.id!)}
                                    className="flex items-center gap-2 px-4 py-3 border border-border text-muted-foreground text-xs uppercase tracking-wider hover:border-rose-500 hover:text-rose-500 transition-colors">
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
                        <h3 className="text-xl font-serif text-foreground mb-2">Supprimer ce message ?</h3>
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