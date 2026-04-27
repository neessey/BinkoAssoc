/* eslint-disable react-hooks/static-components */
"use client"

import { useState } from "react"
import {
    User, Lock, Bell, Globe, Save,
    Eye, EyeOff, CheckCircle, Loader2, Phone, MapPin,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { updateAdminPassword } from "@/app/actions/updateAdminPassword"
import { signOut, useSession } from "next-auth/react"

type Tab = "profil" | "securite" | "site" | "notifications"

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "profil", label: "Profil", icon: User },
    { id: "securite", label: "Sécurité", icon: Lock },
    { id: "site", label: "Infos du site", icon: Globe },
    { id: "notifications", label: "Notifications", icon: Bell },
]

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</label>
            {children}
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
    )
}

const inputCls = "w-full bg-background border border-border px-4 py-3 text-sm text-foreground focus:border-red focus:outline-none transition-colors"

function SaveButton({ saving, saved }: { saving: boolean; saved: boolean }) {
    return (
        <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-red text-white text-xs uppercase tracking-widest hover:bg-red/90 disabled:opacity-60 transition-colors"
        >
            {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement...</>
            ) : saved ? (
                <><CheckCircle className="w-4 h-4" /> Enregistré !</>
            ) : (
                <><Save className="w-4 h-4" /> Enregistrer</>
            )}
        </button>
    )
}

// ─── Onglet Profil ────────────────────────────────────────────
function TabProfil() {
    const [form, setForm] = useState({ name: "Administrateur", email: "admin@binkoassocies.com", role: "Administrateur principal" })
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)
        await new Promise(r => setTimeout(r, 800))
        setSaving(false); setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-6 pb-6 border-b border-border">
                <div className="w-20 h-20 bg-red flex items-center justify-center shrink-0">
                    <span className="text-white text-3xl font-serif font-semibold">A</span>
                </div>
                <div>
                    <p className="text-foreground font-medium">{form.name}</p>
                    <p className="text-muted-foreground text-sm">{form.email}</p>
                    <p className="text-red text-xs uppercase tracking-wider mt-1">{form.role}</p>
                </div>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
                <Field label="Nom complet">
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Adresse email">
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Rôle">
                    <input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className={inputCls} />
                </Field>
            </div>
            <div className="flex justify-end pt-4 border-t border-border">
                <SaveButton saving={saving} saved={saved} />
            </div>
        </form>
    )
}

// ─── Onglet Sécurité ──────────────────────────────────────────
// À placer en dehors de TabSecurite, par exemple après les imports
function PasswordInput({
    label,
    value,
    onChange,
    show,
    onToggleShow,
    placeholder = "••••••••",
}: {
    label: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    show: boolean
    onToggleShow: () => void
    placeholder?: string
}) {
    return (
        <Field label={label}>
            <div className="relative">
                <input
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    className={inputCls + " pr-10"}
                    placeholder={placeholder}
                />
                <button
                    type="button"
                    onClick={onToggleShow}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
        </Field>
    )
}

// Ensuite, dans TabSecurite, remplacez la définition interne par :
function TabSecurite() {
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [form, setForm] = useState({ current: "", new: "", confirm: "" })
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const { data: session } = useSession()
    const adminEmail = session?.user?.email
    const [error, setError] = useState("")

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError("")
        if (form.new !== form.confirm) {
            setError("Les mots de passe ne correspondent pas.")
            return
        }
        if (form.new.length < 8) {
            setError("Le mot de passe doit faire au moins 8 caractères.")
            return
        }

        setSaving(true)

        // Appel à la Server Action
        const formData = new FormData()
        formData.append('newPassword', form.new)
        formData.append('email', adminEmail || '') // ajouter l'email
        const result = await updateAdminPassword(formData)
        if (result.error) {
            setError(result.error)
            setSaving(false)
            return
        }

        // Succès
        setSaving(false)
        setSaved(true)
        setForm({ current: "", new: "", confirm: "" })
        setTimeout(() => setSaved(false), 3000)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
            {/* ... le reste du JSX inchangé ... */}
            <PasswordInput
                label="Mot de passe actuel"
                value={form.current}
                onChange={e => setForm({ ...form, current: e.target.value })}
                show={showCurrent}
                onToggleShow={() => setShowCurrent(!showCurrent)}
            />
            <PasswordInput
                label="Nouveau mot de passe"
                value={form.new}
                onChange={e => setForm({ ...form, new: e.target.value })}
                show={showNew}
                onToggleShow={() => setShowNew(!showNew)}
            />
            <PasswordInput
                label="Confirmer le mot de passe"
                value={form.confirm}
                onChange={e => setForm({ ...form, confirm: e.target.value })}
                show={showConfirm}
                onToggleShow={() => setShowConfirm(!showConfirm)}
            />
            {error && <p className="text-sm text-rose-500">{error}</p>}
            <div className="flex justify-end pt-4 border-t border-border">
                <SaveButton saving={saving} saved={saved} />
            </div>
        </form>
    )
}
// ─── Onglet Infos du site ─────────────────────────────────────
function TabSite() {
    const [form, setForm] = useState({
        siteName: "Binko & Associés",
        tagline: "L'Excellence Immobilière à Abidjan",
        phone1: "+225 22 42 98 76",
        phone2: "+225 47 32 69 64",
        email: "contact@binkoassocies.com",
        emailInfo: "info@binkoassocies.com",
        address: "Cocody-Angré Boulevard Latrille",
        city: "Abidjan, Côte d'Ivoire",
        hoursWeek: "8h00 - 18h00",
        hoursSat: "9h00 - 13h00",
        facebook: "",
        instagram: "",
        linkedin: "",
    })
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)
        await new Promise(r => setTimeout(r, 800))
        setSaving(false); setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">

            <div className="space-y-5">
                <h3 className="text-sm font-medium text-foreground uppercase tracking-wider flex items-center gap-2">
                    <Globe className="w-4 h-4 text-red" /> Identité
                </h3>
                <div className="grid md:grid-cols-2 gap-5">
                    <Field label="Nom du site">
                        <input value={form.siteName} onChange={e => setForm({ ...form, siteName: e.target.value })} className={inputCls} />
                    </Field>
                    <Field label="Slogan">
                        <input value={form.tagline} onChange={e => setForm({ ...form, tagline: e.target.value })} className={inputCls} />
                    </Field>
                </div>
            </div>

            <div className="pt-6 border-t border-border space-y-5">
                <h3 className="text-sm font-medium text-foreground uppercase tracking-wider flex items-center gap-2">
                    <Phone className="w-4 h-4 text-red" /> Contact
                </h3>
                <div className="grid md:grid-cols-2 gap-5">
                    <Field label="Téléphone principal">
                        <input value={form.phone1} onChange={e => setForm({ ...form, phone1: e.target.value })} className={inputCls} />
                    </Field>
                    <Field label="Téléphone secondaire">
                        <input value={form.phone2} onChange={e => setForm({ ...form, phone2: e.target.value })} className={inputCls} />
                    </Field>
                    <Field label="Email principal">
                        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputCls} />
                    </Field>
                    <Field label="Email info">
                        <input type="email" value={form.emailInfo} onChange={e => setForm({ ...form, emailInfo: e.target.value })} className={inputCls} />
                    </Field>
                </div>
            </div>

            <div className="pt-6 border-t border-border space-y-5">
                <h3 className="text-sm font-medium text-foreground uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red" /> Adresse & Horaires
                </h3>
                <div className="grid md:grid-cols-2 gap-5">
                    <Field label="Adresse">
                        <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className={inputCls} />
                    </Field>
                    <Field label="Ville">
                        <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className={inputCls} />
                    </Field>
                    <Field label="Horaires Lun-Ven">
                        <input value={form.hoursWeek} onChange={e => setForm({ ...form, hoursWeek: e.target.value })} className={inputCls} />
                    </Field>
                    <Field label="Horaires Samedi">
                        <input value={form.hoursSat} onChange={e => setForm({ ...form, hoursSat: e.target.value })} className={inputCls} />
                    </Field>
                </div>
            </div>

            <div className="pt-6 border-t border-border space-y-5">
                <h3 className="text-sm font-medium text-foreground uppercase tracking-wider">Réseaux sociaux</h3>
                <div className="grid md:grid-cols-3 gap-5">
                    <Field label="Facebook">
                        <input value={form.facebook} onChange={e => setForm({ ...form, facebook: e.target.value })}
                            className={inputCls} placeholder="https://facebook.com/..." />
                    </Field>
                    <Field label="Instagram">
                        <input value={form.instagram} onChange={e => setForm({ ...form, instagram: e.target.value })}
                            className={inputCls} placeholder="https://instagram.com/..." />
                    </Field>
                    <Field label="LinkedIn">
                        <input value={form.linkedin} onChange={e => setForm({ ...form, linkedin: e.target.value })}
                            className={inputCls} placeholder="https://linkedin.com/..." />
                    </Field>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
                <SaveButton saving={saving} saved={saved} />
            </div>
        </form>
    )
}

// ─── Onglet Notifications ─────────────────────────────────────
function TabNotifications() {
    const [prefs, setPrefs] = useState({
        newMessage: true,
        newVisit: true,
        dailySummary: false,
        notifEmail: "admin@binkoassocies.com",
    })
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)
        await new Promise(r => setTimeout(r, 800))
        setSaving(false); setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }

    const Toggle = ({ checked, onChange, label, desc }: { checked: boolean; onChange: () => void; label: string; desc: string }) => (
        <div className="flex items-center justify-between gap-4 py-4 border-b border-border last:border-0">
            <div>
                <p className="text-sm text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
            <button type="button" onClick={onChange}
                className={cn(
                    "relative w-11 h-6 transition-colors duration-200 shrink-0",
                    checked ? "bg-red" : "bg-muted"
                )}>
                <span className={cn(
                    "absolute top-1 w-4 h-4 bg-white transition-transform duration-200",
                    checked ? "translate-x-6" : "translate-x-1"
                )} />
            </button>
        </div>
    )

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
            <div className="bg-white border border-border px-6">
                <Toggle
                    checked={prefs.newMessage}
                    onChange={() => setPrefs({ ...prefs, newMessage: !prefs.newMessage })}
                    label="Nouveau message de contact"
                    desc="Recevoir une notification à chaque nouveau message"
                />
                <Toggle
                    checked={prefs.newVisit}
                    onChange={() => setPrefs({ ...prefs, newVisit: !prefs.newVisit })}
                    label="Nouvelle demande de visite"
                    desc="Recevoir une notification à chaque demande de visite"
                />
                <Toggle
                    checked={prefs.dailySummary}
                    onChange={() => setPrefs({ ...prefs, dailySummary: !prefs.dailySummary })}
                    label="Résumé quotidien"
                    desc="Recevoir un récapitulatif chaque matin"
                />
            </div>
            <Field label="Email de notification" hint="Les alertes seront envoyées à cette adresse">
                <input type="email" value={prefs.notifEmail}
                    onChange={e => setPrefs({ ...prefs, notifEmail: e.target.value })} className={inputCls} />
            </Field>
            <div className="flex justify-end pt-4 border-t border-border">
                <SaveButton saving={saving} saved={saved} />
            </div>
        </form>
    )
}

// ─── Page principale ──────────────────────────────────────────
export default function AdminSettings() {
    const [activeTab, setActiveTab] = useState<Tab>("profil")
    const { data: session } = useSession()

    const tabContent: Record<Tab, React.ReactNode> = {
        profil: <TabProfil />,
        securite: <TabSecurite />,
        site: <TabSite />,
        notifications: <TabNotifications />,
    }

    return (
        <div className="p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-px w-8 bg-red" />
                        <span className="text-red text-xs tracking-[0.3em] uppercase">Configuration</span>
                    </div>
                    <h1 className="text-3xl font-serif font-light text-foreground">Paramètres</h1>
                </div>
                <div className="flex items-center gap-4">

                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="px-4 py-2 border border-red text-red text-xs uppercase tracking-wider hover:bg-red hover:text-white transition-colors"
                    >
                        Déconnexion
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Tabs nav */}
                <div className="lg:w-56 shrink-0">
                    <div className="bg-white border border-border overflow-hidden">
                        {tabs.map((tab) => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3.5 text-sm transition-colors border-b border-border last:border-0",
                                    activeTab === tab.id
                                        ? "bg-red text-white"
                                        : "text-muted-foreground hover:text-foreground hover:bg-background"
                                )}>
                                <tab.icon className="w-4 h-4 shrink-0" />
                                <span className="text-xs uppercase tracking-wider">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 bg-white border border-border p-6 md:p-8">
                    {tabContent[activeTab]}
                </div>
            </div>
        </div>
    )
}