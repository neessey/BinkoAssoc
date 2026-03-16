/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useEffect, useState } from "react"
import { MapPin, Plus, Edit2, Trash2, Loader2, Save, X, Eye, EyeOff } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Location } from "@/types/database"
import { cn } from "@/lib/utils"

const emptyForm = { name: "", subtitle: "", image: "", active: true }

export default function AdminQuartiers() {
    const [locations, setLocations] = useState<Location[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
    const [form, setForm] = useState(emptyForm)
    const [saving, setSaving] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    async function load() {
        setLoading(true)
        const { data } = await supabase.from("locations").select("*").order("name")
        setLocations((data as Location[]) || [])
        setLoading(false)
    }

    useEffect(() => { load() }, [])

    function openCreate() {
        setForm(emptyForm); setEditId(null); setShowForm(true)
    }

    function openEdit(l: Location) {
        setForm({ name: l.name, subtitle: l.subtitle || "", image: l.image || "", active: l.active })
        setEditId(l.id); setShowForm(true)
    }

    async function handleSave() {
        if (!form.name) return
        setSaving(true)
        const payload = { name: form.name, subtitle: form.subtitle || null, image: form.image || null, active: form.active }
        if (editId) {
            await supabase.from("locations").update(payload).eq("id", editId)
        } else {
            await supabase.from("locations").insert([payload])
        }
        setSaving(false); setShowForm(false); setEditId(null); load()
    }

    async function handleDelete(id: string) {
        await supabase.from("locations").delete().eq("id", id)
        setDeleteId(null); load()
    }

    async function toggleActive(l: Location) {
        await supabase.from("locations").update({ active: !l.active }).eq("id", l.id)
        load()
    }

    return (
        <div className="p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-px w-8 bg-red" />
                        <span className="text-red text-xs tracking-[0.3em] uppercase">Zones</span>
                    </div>
                    <h1 className="text-3xl font-serif font-light text-foreground">Quartiers & Localisations</h1>
                </div>
                <button onClick={openCreate}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-red text-white text-xs uppercase tracking-widest hover:bg-red/90 transition-colors">
                    <Plus className="w-4 h-4" /> Ajouter un quartier
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-red animate-spin" /></div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {locations.map((l) => (
                        <div key={l.id}
                            className={cn("bg-card border transition-colors group overflow-hidden",
                                l.active ? "border-border hover:border-red" : "border-border opacity-60")}>
                            <div className="aspect-video bg-cover bg-center relative"
                                style={{ backgroundImage: `url('${l.image || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400"}')` }}>
                                <div className="absolute inset-0 bg-linear-to-t bg-black/50 " />
                                <div className="absolute bottom-0 left-0 p-3">
                                    <div className="flex items-center gap-1 text-white/80 text-xs mb-0.5">
                                        <MapPin className="w-3 h-3 text-red" />
                                        <span className="uppercase tracking-wider">Quartier</span>
                                    </div>
                                    <h3 className="text-white font-serif text-lg">{l.name}</h3>
                                </div>
                                {!l.active && (
                                    <div className="absolute top-2 right-2 bg-black/60 text-white text-[9px] uppercase tracking-wider px-2 py-1">
                                        Masqué
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <p className="text-sm text-muted-foreground mb-4 min-h-5">{l.subtitle || "—"}</p>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => toggleActive(l)}
                                        className="w-8 h-8 flex items-center justify-center border border-border text-muted-foreground hover:border-blue-400 hover:text-blue-500 transition-colors">
                                        {l.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                    </button>
                                    <button onClick={() => openEdit(l)}
                                        className="w-8 h-8 flex items-center justify-center border border-border text-muted-foreground hover:border-red hover:text-red transition-colors">
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => setDeleteId(l.id)}
                                        className="w-8 h-8 flex items-center justify-center border border-border text-muted-foreground hover:border-rose-500 hover:text-rose-500 transition-colors">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Form modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setShowForm(false)} />
                    <div className="relative w-full max-w-md bg-white border border-border z-10 shadow-2xl my-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                            <h2 className="text-xl font-serif text-foreground">
                                {editId ? "Modifier le quartier" : "Nouveau quartier"}
                            </h2>
                            <button onClick={() => setShowForm(false)}>
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {[
                                { label: "Nom du quartier *", key: "name", placeholder: "Ex: Cocody" },
                                { label: "Sous-titre", key: "subtitle", placeholder: "Ex: Quartier Résidentiel Premium" },
                                { label: "URL de l'image", key: "image", placeholder: "https://..." },
                            ].map(({ label, key, placeholder }) => (
                                <div key={key} className="space-y-1.5">
                                    <label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</label>
                                    <input value={form[key as keyof typeof form] as string}
                                        onChange={e => setForm({ ...form, [key]: e.target.value })}
                                        placeholder={placeholder}
                                        className="w-full bg-background border border-border px-3 py-2.5 text-sm text-foreground focus:border-red focus:outline-none" />
                                </div>
                            ))}
                            {form.image && (
                                <div className="aspect-video bg-cover bg-center border border-border"
                                    style={{ backgroundImage: `url('${form.image}')` }} />
                            )}
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={form.active}
                                    onChange={e => setForm({ ...form, active: e.target.checked })} className="accent-red" />
                                <span className="text-sm text-foreground">Visible sur le site</span>
                            </label>
                        </div>
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
                            <button onClick={() => setShowForm(false)}
                                className="px-6 py-2.5 border border-border text-sm text-muted-foreground hover:text-foreground">
                                Annuler
                            </button>
                            <button onClick={handleSave} disabled={saving}
                                className="flex items-center gap-2 px-6 py-2.5 bg-red text-white text-sm hover:bg-red/90 disabled:opacity-60">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {editId ? "Enregistrer" : "Créer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setDeleteId(null)} />
                    <div className="relative bg-card border border-border p-8 max-w-sm w-full z-10 text-center">
                        <Trash2 className="w-10 h-10 text-rose-500 mx-auto mb-4" />
                        <h3 className="text-xl font-serif text-foreground mb-2">Supprimer ce quartier ?</h3>
                        <p className="text-muted-foreground text-sm mb-6">Cette action est irréversible.</p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => setDeleteId(null)}
                                className="px-6 py-2.5 border border-border text-sm text-muted-foreground">Annuler</button>
                            <button onClick={() => handleDelete(deleteId)}
                                className="px-6 py-2.5 bg-rose-500 text-white text-sm hover:bg-rose-600">Supprimer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}