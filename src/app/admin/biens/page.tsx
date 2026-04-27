/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useEffect, useState } from "react"
import {
    Plus, Search, Edit2, Trash2, Eye, EyeOff, Star,
    Loader2, X, Save, MapPin, Building2,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Property, PropertyType } from "@/types/database"
import { cn } from "@/lib/utils"

const typeOptions: { value: PropertyType | "all"; label: string }[] = [
    { value: "all", label: "Tous" },
    { value: "location", label: "Location" },
    { value: "vente", label: "Vente" },
    { value: "meuble", label: "Meublé" },
]

// ✅ Utiliser une fonction pour garantir un nouvel objet à chaque appel
const getEmptyForm = () => ({
    title: "", description: "", location: "", quartier: "",
    type: "location" as PropertyType, price: "", price_label: "",
    beds: "", baths: "", room: "", kitchen: "", toilet: "", parking: "", balcon: "", thumbnail: "", featured: false, available: true,
})

export default function AdminBiens() {
    const [properties, setProperties] = useState<Property[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [filterType, setFilterType] = useState<PropertyType | "all">("all")
    const [showForm, setShowForm] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
    const [form, setForm] = useState(getEmptyForm())
    const [saving, setSaving] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    async function loadProperties() {
        setLoading(true)
        const { data } = await supabase
            .from("properties").select("*").order("created_at", { ascending: false })
        setProperties((data as Property[]) || [])
        setLoading(false)
    }

    useEffect(() => { loadProperties() }, [])

    const filtered = properties.filter((p) => {
        const matchType = filterType === "all" || p.type === filterType
        const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.location.toLowerCase().includes(search.toLowerCase())
        return matchType && matchSearch
    })

    function openCreate() {
        setForm(getEmptyForm())
        setEditId(null)
        setShowForm(true)
    }

    function openEdit(p: Property) {
        setForm({
            title: p.title, description: p.description || "", location: p.location,
            quartier: p.quartier || "", type: p.type, price: String(p.price),
            price_label: p.price_label || "", beds: String(p.beds), baths: String(p.baths),
            thumbnail: p.thumbnail || "",
            room: String(p.room || ""), kitchen: String(p.kitchen || ""), toilet: String(p.toilet || ""),
            parking: String(p.parking || ""), balcon: String(p.balcon || ""),
            featured: p.featured, available: p.available,
        })
        setEditId(p.id)
        setShowForm(true)
    }

    async function handleSave() {
        setSaving(true)

        // Validation du titre
        if (!form.title || form.title.trim() === "") {
            alert("Le titre est obligatoire")
            setSaving(false)
            return
        }

        // Construction du payload
        const payload = {
            title: form.title,
            description: form.description || null,
            location: form.location,
            quartier: form.quartier || null,
            type: form.type,
            price: Number(form.price) || 0,
            price_label: form.price_label || null,
            beds: Number(form.beds) || 0,
            baths: Number(form.baths) || 0,
            room: Number(form.room) || 0,
            kitchen: Number(form.kitchen) || 0,
            toilet: Number(form.toilet) || 0,
            parking: Number(form.parking) || 0,
            balcon: Number(form.balcon) || 0,
            thumbnail: form.thumbnail || null,
            featured: form.featured,
            available: form.available,
        }

        let error = null
        if (editId) {
            const { error: updateError } = await supabase
                .from("properties")
                .update(payload)
                .eq("id", editId)
            error = updateError
        } else {
            const { error: insertError } = await supabase
                .from("properties")
                .insert([payload])
            error = insertError
        }

        if (error) {
            console.error("Erreur Supabase :", error)
            alert(`Erreur : ${error.message}`)
            setSaving(false)
            return
        }

        setSaving(false)
        setShowForm(false)
        setEditId(null)
        loadProperties()
    }

    async function handleDelete(id: string) {
        await supabase.from("properties").delete().eq("id", id)
        setDeleteId(null)
        loadProperties()
    }

    async function toggleAvailable(p: Property) {
        await supabase.from("properties").update({ available: !p.available }).eq("id", p.id)
        loadProperties()
    }

    async function toggleFeatured(p: Property) {
        await supabase.from("properties").update({ featured: !p.featured }).eq("id", p.id)
        loadProperties()
    }

    return (
        <div className="p-6 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-px w-8 bg-red" />
                        <span className="text-red text-xs tracking-[0.3em] uppercase">Gestion</span>
                    </div>
                    <h1 className="text-3xl font-serif font-light text-foreground">Biens immobiliers</h1>
                </div>
                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-red text-white text-xs uppercase tracking-widest hover:bg-red/90 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Ajouter un bien
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text" placeholder="Rechercher par titre ou adresse..."
                        value={search} onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white border border-border pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-red focus:outline-none"
                    />
                </div>
                <div className="flex gap-2">
                    {typeOptions.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setFilterType(opt.value)}
                            className={cn(
                                "px-4 py-3 text-xs uppercase tracking-wider transition-colors",
                                filterType === opt.value
                                    ? "bg-red text-white"
                                    : "bg-white border border-border text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-border overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="w-6 h-6 text-red animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground text-sm">Aucun bien trouvé</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-background">
                                    {["Bien", "Type", "Prix", "Caract", "Statut", "Actions"].map((h) => (
                                        <th key={h} className="text-left px-6 py-3 text-xs uppercase tracking-widest text-muted-foreground">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filtered.map((p) => (
                                    <tr key={p.id} className="hover:bg-background transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-12 h-12 bg-cover bg-center shrink-0"
                                                    style={{ backgroundImage: `url('${p.thumbnail || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=100"}')` }}
                                                />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-foreground truncate max-w-48">{p.title}</p>
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                                        <MapPin className="w-3 h-3 text-red shrink-0" />
                                                        <span className="truncate max-w-36">{p.location}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2 py-1 text-[10px] uppercase tracking-wider border",
                                                p.type === "location" ? "border-blue-400/30 text-blue-500 bg-blue-500/5"
                                                    : p.type === "vente" ? "border-emerald-400/30 text-emerald-600 bg-emerald-500/5"
                                                        : "border-amber-400/30 text-amber-600 bg-amber-500/5"
                                            )}>
                                                {p.type === "location" ? "Location" : p.type === "vente" ? "Vente" : "Meublé"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-red font-medium">{p.price_label || `${p.price.toLocaleString("fr-FR")} FCFA`}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs text-muted-foreground">{p.beds}ch · {p.toilet}wc</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={cn(
                                                    "px-2 py-0.5 text-[10px] uppercase tracking-wider border",
                                                    p.available
                                                        ? "border-emerald-400/30 text-emerald-600 bg-emerald-500/5"
                                                        : "border-border text-muted-foreground"
                                                )}>
                                                    {p.available ? "Disponible" : "Indispo."}
                                                </span>
                                                {p.featured && (
                                                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => toggleFeatured(p)}
                                                    title="Vedette"
                                                    className="w-7 h-7 flex items-center justify-center border border-border text-muted-foreground hover:border-amber-400 hover:text-amber-500 transition-colors"
                                                >
                                                    <Star className={cn("w-3.5 h-3.5", p.featured && "fill-amber-500 text-amber-500")} />
                                                </button>
                                                <button
                                                    onClick={() => toggleAvailable(p)}
                                                    title={p.available ? "Masquer" : "Rendre disponible"}
                                                    className="w-7 h-7 flex items-center justify-center border border-border text-muted-foreground hover:border-blue-400 hover:text-blue-500 transition-colors"
                                                >
                                                    {p.available ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                                </button>
                                                <button
                                                    onClick={() => openEdit(p)}
                                                    className="w-7 h-7 flex items-center justify-center border border-border text-muted-foreground hover:border-red hover:text-red transition-colors"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteId(p.id)}
                                                    className="w-7 h-7 flex items-center justify-center border border-border text-muted-foreground hover:border-rose-500 hover:text-rose-500 transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
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

            {/* Modal Formulaire */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-start justify-center p-4 md:p-8 overflow-y-auto">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
                    <div className="relative w-full max-w-2xl bg-white border border-border z-10 shadow-2xl my-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                            <div>
                                <h2 className="text-xl font-serif text-foreground">
                                    {editId ? "Modifier le bien" : "Ajouter un bien"}
                                </h2>
                            </div>
                            <button onClick={() => setShowForm(false)}>
                                <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                            <div className="grid md:grid-cols-2 gap-4">
                                <Field label="Titre *">
                                    <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                                        className={inputCls} placeholder="Ex: Villa contemporaine" />
                                </Field>
                                <Field label="Type *">
                                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as PropertyType })}
                                        className={inputCls}>
                                        <option value="location">Location</option>
                                        <option value="vente">Vente</option>
                                        <option value="meuble">Résidence meublée</option>
                                    </select>
                                </Field>
                            </div>
                            <Field label="Adresse complète *">
                                <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                                    className={inputCls} placeholder="Ex: Cocody - Riviera 3" />
                            </Field>
                            <div className="grid md:grid-cols-2 gap-4">
                                <Field label="Quartier">
                                    <input value={form.quartier} onChange={e => setForm({ ...form, quartier: e.target.value })}
                                        className={inputCls} placeholder="Ex: Riviera" />
                                </Field>
                                <Field label="Prix (chiffres) *">
                                    <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                                        className={inputCls} placeholder="Ex: 850000" />
                                </Field>
                            </div>
                            <Field label="Libellé du prix (affiché)">
                                <input value={form.price_label} onChange={e => setForm({ ...form, price_label: e.target.value })}
                                    className={inputCls} placeholder="Ex: 850 000 FCFA/mois" />
                            </Field>
                            <div className="grid grid-cols-3 gap-4">
                                <Field label="Chambres">
                                    <input type="number" value={form.beds} onChange={e => setForm({ ...form, beds: e.target.value })}
                                        className={inputCls} placeholder="4" />
                                </Field>
                                <Field label="Salon">
                                    <input type="number" value={form.room} onChange={e => setForm({ ...form, room: e.target.value })}
                                        className={inputCls} placeholder="2" />
                                </Field>
                                <Field label="Cuisine">
                                    <input type="number" value={form.kitchen} onChange={e => setForm({ ...form, kitchen: e.target.value })}
                                        className={inputCls} placeholder="2" />
                                </Field>
                                <Field label="Balcon">
                                    <input type="number" value={form.balcon} onChange={e => setForm({ ...form, balcon: e.target.value })}
                                        className={inputCls} placeholder="2" />
                                </Field>
                                <Field label="Parkings">
                                    <input type="number" value={form.parking} onChange={e => setForm({ ...form, parking: e.target.value })}
                                        className={inputCls} placeholder="2" />
                                </Field>
                                <Field label="Toilettes">
                                    <input type="number" value={form.toilet} onChange={e => setForm({ ...form, toilet: e.target.value })}
                                        className={inputCls} placeholder="2" />
                                </Field>
                            </div>
                            <Field label="URL de l'image principale">
                                <input value={form.thumbnail} onChange={e => setForm({ ...form, thumbnail: e.target.value })}
                                    className={inputCls} placeholder="https://..." />
                            </Field>
                            {form.thumbnail && (
                                <div className="aspect-video bg-cover bg-center border border-border"
                                    style={{ backgroundImage: `url('${form.thumbnail}')` }} />
                            )}
                            <Field label="Description">
                                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                                    rows={3} className={inputCls + " resize-none"} placeholder="Décrivez le bien..." />
                            </Field>
                            <div className="flex items-center gap-6 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={form.featured}
                                        onChange={e => setForm({ ...form, featured: e.target.checked })}
                                        className="accent-red" />
                                    <span className="text-sm text-foreground">Mettre en vedette</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={form.available}
                                        onChange={e => setForm({ ...form, available: e.target.checked })}
                                        className="accent-red" />
                                    <span className="text-sm text-foreground">Disponible</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
                            <button onClick={() => setShowForm(false)}
                                className="px-6 py-2.5 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Annuler
                            </button>
                            <button onClick={handleSave} disabled={saving}
                                className="flex items-center gap-2 px-6 py-2.5 bg-red text-white text-sm hover:bg-red/90 disabled:opacity-60 transition-colors">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {editId ? "Enregistrer" : "Créer le bien"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Suppression */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setDeleteId(null)} />
                    <div className="relative bg-white border border-border p-8 max-w-sm w-full z-10 text-center">
                        <Trash2 className="w-10 h-10 text-rose-500 mx-auto mb-4" />
                        <h3 className="text-xl font-serif text-foreground mb-2">Supprimer ce bien ?</h3>
                        <p className="text-muted-foreground text-sm mb-6">Cette action est irréversible.</p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => setDeleteId(null)}
                                className="px-6 py-2.5 border border-border text-sm text-muted-foreground hover:text-foreground">
                                Annuler
                            </button>
                            <button onClick={() => handleDelete(deleteId)}
                                className="px-6 py-2.5 bg-rose-500 text-white text-sm hover:bg-rose-600">
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

const inputCls = "w-full bg-background border border-border px-3 py-2.5 text-sm text-foreground focus:border-red focus:outline-none transition-colors"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</label>
            {children}
        </div>
    )
}