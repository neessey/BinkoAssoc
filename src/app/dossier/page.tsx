/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import React, { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import {
    User,  Mail, Briefcase, Home, FileText,
    Check, ArrowRight, Loader2, AlertCircle, Shield, Building2
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Property {
    id: string
    title: string
    location: string
    type: string
    price_label: string | null
    price: number
    thumbnail: string | null
}

type SubmitStatus = "idle" | "loading" | "success" | "error"

// ─── Documents requis selon profil (liste officielle Binko) ───
type DocConfigItem = {
    id: string
    label: string
    note?: string
    optional?: boolean
}

const DOCS_CONFIG: {
    [key: string]: {
        label: string
        docs: DocConfigItem[]
    }
} = {
    particulier_salarie: {
        label: "Particulier — Salarié(e)",
        docs: [
            { id: "cni",         label: "Copie de la Carte Nationale d'Identité (CNI)", note: "Ou carte consulaire / passeport pour les non-ivoiriens" },
            { id: "photo",       label: "Une photo d'identité" },
            { id: "attestation", label: "Attestation de travail ou certificat de prise de fonction" },
            { id: "rib",         label: "Relevé d'identité bancaire (RIB)", note: "Compte non fermé, personnel, domicilié en Côte d'Ivoire" },
            { id: "bulletins",   label: "Les 3 derniers bulletins de salaire" },
            { id: "quitus",      label: "Quitus du précédent propriétaire", note: "Ou copie règlement dernière facture CIE / SODECI — uniquement si précédemment en location", optional: true },
        ]
    },
    particulier_liberal: {
        label: "Particulier — Profession libérale",
        docs: [
            { id: "cni",    label: "Copie de la Carte Nationale d'Identité (CNI)", note: "Ou carte consulaire / passeport pour les non-ivoiriens" },
            { id: "photo",  label: "Une photo d'identité" },
            { id: "dfe",    label: "Déclaration Fiscale d'Existence (DFE)" },
            { id: "rc",     label: "Registre de commerce" },
            { id: "rib",    label: "Relevé d'identité bancaire (RIB)", note: "Compte non fermé, personnel, domicilié en Côte d'Ivoire" },
            { id: "impots", label: "Reçu du dernier règlement des impôts ou taxes communales" },
        ]
    },
    societe: {
        label: "Société / Entreprise",
        docs: [
            { id: "rc",      label: "Copie du registre de commerce de la société" },
            { id: "cni_dg",  label: "CNI du gérant ou directeur général", note: "Ou carte consulaire / passeport pour les non-ivoiriens" },
            { id: "photo",   label: "Photo d'identité du gérant" },
            { id: "dfe_rib", label: "Déclaration Fiscale d'Existence (DFE) + RIB de la société", note: "Compte non fermé de la société" },
            { id: "quitus",  label: "Quitus du précédent propriétaire", note: "Ou copie règlement dernière facture CIE / SODECI du gérant — si précédemment en location", optional: true },
        ]
    },
}

function DossierContent() {
    const searchParams  = useSearchParams()
    const propertyIdUrl = searchParams.get("bien")
    const typeUrl       = searchParams.get("type")

    const [properties, setProperties]   = useState<Property[]>([])
    const [preSelected, setPreSelected] = useState<Property | null>(null)
    const [currentStep, setCurrentStep] = useState(1)
    const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle")
    const [errorMsg, setErrorMsg]       = useState("")
    const [checkedDocs, setCheckedDocs] = useState<string[]>([])

    const [form, setForm] = useState({
        nom: "", prenom: "", email: "", telephone: "",
        nationalite: "", situation_familiale: "",
        type_profil: "" as keyof typeof DOCS_CONFIG | "",
        type_demande: typeUrl || "location",
        property_id: propertyIdUrl || "",
        profession: "", employeur: "", revenu_mensuel: "", anciennete: "",
        garant_nom: "", garant_telephone: "", garant_profession: "",
        message: "",
    })

    useEffect(() => {
        async function load() {
            const { data } = await supabase
                .from("properties")
                .select("id, title, location, type, price_label, price, thumbnail")
                .eq("available", true)
                .order("title")
            setProperties((data as Property[]) || [])
        }
        load()
    }, [])

    useEffect(() => {
        if (propertyIdUrl && properties.length > 0) {
            const found = properties.find(p => p.id === propertyIdUrl)
            if (found) {
                setPreSelected(found)
                setForm(prev => ({
                    ...prev,
                    property_id: found.id,
                    type_demande: typeUrl || (found.type === "vente" ? "vente" : "location")
                }))
            }
        }
    }, [propertyIdUrl, properties, typeUrl])

    const currentDocs    = form.type_profil ? DOCS_CONFIG[form.type_profil as keyof typeof DOCS_CONFIG]?.docs || [] : []
    const requiredDocs   = currentDocs.filter(d => !d.optional)
    const allRequiredChecked = requiredDocs.every(d => checkedDocs.includes(d.id))

    const steps = [
        { step: 1, label: "Identité",     icon: User },
        { step: 2, label: "Situation",    icon: Briefcase },
        { step: 3, label: "Documents",    icon: FileText },
        { step: 4, label: "Bien visé",    icon: Home },
        { step: 5, label: "Confirmation", icon: Check },
    ]

    const isStepValid = (step: number) => {
        switch (step) {
            case 1: return !!(form.nom && form.prenom && form.email && form.telephone && form.type_profil)
            case 2: return !!(form.profession && form.revenu_mensuel)
            case 3: return allRequiredChecked
            case 4: return !!(form.property_id || preSelected)
            default: return true
        }
    }

    const toggleDoc = (id: string) => {
        setCheckedDocs(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id])
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitStatus("loading")
        const selectedProp = preSelected || properties.find(p => p.id === form.property_id)
        const docsChecked  = currentDocs.filter(d => checkedDocs.includes(d.id)).map(d => d.label).join(" | ")
        try {
            const { error } = await supabase.from("dossiers").insert([{
                nom: form.nom.trim(), prenom: form.prenom.trim(),
                email: form.email.trim(), telephone: form.telephone.trim(),
                nationalite: form.nationalite || null,
                situation_familiale: form.situation_familiale || null,
                type_demande: form.type_demande,
                property_id:   selectedProp?.id || null,
                property_name: selectedProp ? `${selectedProp.title} — ${selectedProp.location}` : null,
                profession: form.profession || null, employeur: form.employeur || null,
                revenu_mensuel: form.revenu_mensuel || null, anciennete: form.anciennete || null,
                garant_nom: form.garant_nom || null, garant_telephone: form.garant_telephone || null,
                garant_profession: form.garant_profession || null,
                message: [
                    form.message ? `Message : ${form.message}` : "",
                    `Profil : ${DOCS_CONFIG[form.type_profil as keyof typeof DOCS_CONFIG]?.label || ""}`,
                    `Documents cochés : ${docsChecked}`,
                ].filter(Boolean).join("\n\n"),
                status: "en_attente",
            }])
            if (error) { setErrorMsg("Une erreur est survenue."); setSubmitStatus("error"); return }
            setSubmitStatus("success")
        } catch {
            setErrorMsg("Erreur de connexion.")
            setSubmitStatus("error")
        }
    }

    const inputCls  = "w-full px-4 py-3 bg-card border border-border text-foreground font-sans text-sm focus:border-red focus:outline-none transition-colors"
    const selectCls = inputCls + " appearance-none cursor-pointer"

    if (submitStatus === "success") {
        return (
            <main className="min-h-screen bg-background">
                <Header />
                <section className="min-h-[80vh] flex items-center justify-center py-24 px-6">
                    <div className="max-w-xl text-center">
                        <div className="w-24 h-24 bg-emerald-500/10 flex items-center justify-center mx-auto mb-8">
                            <Check className="w-12 h-12 text-emerald-500" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif font-light text-foreground mb-6">
                            Dossier<br /><span className="text-red">Déposé !</span>
                        </h1>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                            Votre dossier a été transmis à notre équipe. Nous l&apos;étudierons dans les plus brefs délais et vous contacterons pour la suite.
                        </p>
                        <div className="p-6 bg-card border border-border text-left mb-8">
                            <h3 className="text-foreground font-serif text-lg mb-4">Ce qui se passe ensuite</h3>
                            <div className="space-y-4">
                                {[
                                    { n: "1", t: "Étude du dossier",  d: "Notre équipe examine votre dossier sous 48h ouvrées." },
                                    { n: "2", t: "Réponse par email", d: `Vous recevrez une réponse à l'adresse ${form.email}` },
                                    { n: "3", t: "Si validé",         d: "Nous vous contacterons pour la remise des documents originaux et la signature." },
                                ].map(({ n, t, d }) => (
                                    <div key={n} className="flex items-start gap-4">
                                        <div className="w-7 h-7 bg-red text-white text-xs font-serif flex items-center justify-center shrink-0 mt-0.5">{n}</div>
                                        <div>
                                            <p className="text-foreground text-sm font-medium mb-0.5">{t}</p>
                                            <p className="text-muted-foreground text-xs">{d}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/biens" className="inline-flex items-center gap-3 px-8 py-4 bg-red text-white text-xs tracking-widest uppercase hover:bg-red/90 transition-colors">
                                Voir d&apos;autres biens <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link href="/" className="inline-flex items-center gap-3 px-8 py-4 border border-border text-foreground text-xs tracking-widest uppercase hover:border-red hover:text-red transition-colors">
                                Accueil
                            </Link>
                        </div>
                    </div>
                </section>
                <Footer />
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-background">
            <Header />

            {/* Hero */}
            <section className="relative h-[45vh] min-h-80 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?q=80&w=2073&auto=format&fit=crop')` }} />
                <div className="absolute inset-0 bg-background/80" />
                <div className="relative z-10 text-center px-6">
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="h-px w-12 bg-red" />
                        <span className="text-red text-xs tracking-[0.3em] uppercase">Candidature</span>
                        <div className="h-px w-12 bg-red" />
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light tracking-wide text-foreground mb-4">
                        Déposer votre<br /><span className="text-red">Dossier</span>
                    </h1>
                    <p className="max-w-xl mx-auto text-muted-foreground text-sm leading-relaxed">
                        Complétez votre dossier de candidature. Notre équipe l&apos;étudiera et vous contactera sous 48h.
                    </p>
                </div>
            </section>

            {/* Bandeau */}
            <div className="bg-card border-b border-border py-4">
                <div className="container mx-auto px-6">
                    <div className="flex flex-wrap items-center justify-center gap-8 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-red" /><span>Données confidentielles</span></div>
                        <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /><span>Réponse sous 48h</span></div>
                        <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-red" /><span>Notification par email</span></div>
                    </div>
                </div>
            </div>

            {/* Stepper */}
            <div className="bg-card border-b border-border">
                <div className="container mx-auto px-6 py-6">
                    <div className="flex items-center justify-center gap-1 md:gap-4">
                        {steps.map((item, index) => (
                            <div key={item.step} className="flex items-center gap-1 md:gap-4">
                                <button type="button"
                                    onClick={() => item.step < currentStep && setCurrentStep(item.step)}
                                    className={cn("flex items-center gap-2 transition-all",
                                        currentStep === item.step ? "opacity-100" : "opacity-40 hover:opacity-60"
                                    )}>
                                    <div className={cn(
                                        "w-8 h-8 flex items-center justify-center text-xs transition-all",
                                        currentStep === item.step  ? "bg-red text-white"
                                        : currentStep > item.step  ? "bg-red/20 text-red border border-red/30"
                                        : "border border-border text-muted-foreground"
                                    )}>
                                        {currentStep > item.step ? <Check className="w-3 h-3" /> : item.step}
                                    </div>
                                    <span className={cn("hidden md:block text-xs tracking-wider uppercase",
                                        currentStep === item.step ? "text-red" : "text-muted-foreground"
                                    )}>
                                        {item.label}
                                    </span>
                                </button>
                                {index < steps.length - 1 && (
                                    <div className={cn("w-4 md:w-10 h-px", currentStep > item.step ? "bg-red" : "bg-border")} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Formulaire */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-6">
                    <div className="max-w-2xl mx-auto">

                        {submitStatus === "error" && (
                            <div className="mb-6 p-4 bg-red/5 border border-red/30 flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-red shrink-0" />
                                <p className="text-sm text-muted-foreground">{errorMsg}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>

                            {/* ── Étape 1 : Identité ── */}
                            <div className={cn(currentStep === 1 ? "block" : "hidden")}>
                                <div className="text-center mb-10">
                                    <User className="w-10 h-10 text-red mx-auto mb-3" />
                                    <h2 className="text-2xl font-serif font-light text-foreground">Informations personnelles</h2>
                                </div>

                                <div className="mb-8">
                                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Vous êtes… *</p>
                                    <div className="grid md:grid-cols-3 gap-3">
                                        {(Object.entries(DOCS_CONFIG) as [keyof typeof DOCS_CONFIG, typeof DOCS_CONFIG[keyof typeof DOCS_CONFIG]][]).map(([key, val]) => (
                                            <button key={key} type="button"
                                                onClick={() => { setForm({ ...form, type_profil: key }); setCheckedDocs([]) }}
                                                className={cn(
                                                    "p-4 text-left border transition-all",
                                                    form.type_profil === key ? "border-red bg-red/5" : "border-border hover:border-red/50"
                                                )}>
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    {key === "societe"
                                                        ? <Building2 className={cn("w-5 h-5 mt-0.5", form.type_profil === key ? "text-red" : "text-muted-foreground")} />
                                                        : <User className={cn("w-5 h-5 mt-0.5", form.type_profil === key ? "text-red" : "text-muted-foreground")} />
                                                    }
                                                    <div className={cn("w-4 h-4 border-2 flex items-center justify-center shrink-0",
                                                        form.type_profil === key ? "border-red bg-red" : "border-border"
                                                    )}>
                                                        {form.type_profil === key && <Check className="w-2.5 h-2.5 text-white" />}
                                                    </div>
                                                </div>
                                                <p className={cn("text-xs font-medium leading-snug",
                                                    form.type_profil === key ? "text-foreground" : "text-muted-foreground"
                                                )}>
                                                    {val.label}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-5">
                                    {[
                                        { label: "Nom *",      key: "nom",        type: "text",  placeholder: "Votre nom" },
                                        { label: "Prénom *",   key: "prenom",     type: "text",  placeholder: "Votre prénom" },
                                        { label: "Email *",    key: "email",      type: "email", placeholder: "votre@email.com" },
                                        { label: "Téléphone *",key: "telephone",  type: "tel",   placeholder: "+225 XX XX XX XX" },
                                        { label: "Nationalité",key: "nationalite",type: "text",  placeholder: "Ivoirien(ne)" },
                                    ].map(({ label, key, type, placeholder }) => (
                                        <div key={key} className="space-y-1.5">
                                            <label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</label>
                                            <input type={type} required={label.includes("*")}
                                                value={form[key as keyof typeof form] as string}
                                                onChange={e => setForm({ ...form, [key]: e.target.value })}
                                                className={inputCls} placeholder={placeholder} />
                                        </div>
                                    ))}
                                    <div className="space-y-1.5">
                                        <label className="text-xs uppercase tracking-wider text-muted-foreground">Situation familiale</label>
                                        <select value={form.situation_familiale}
                                            onChange={e => setForm({ ...form, situation_familiale: e.target.value })}
                                            className={selectCls}>
                                            <option value="">Sélectionner</option>
                                            <option>Célibataire</option>
                                            <option>Marié(e)</option>
                                            <option>Divorcé(e)</option>
                                            <option>Veuf / Veuve</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-10 flex justify-end">
                                    <button type="button" disabled={!isStepValid(1)} onClick={() => setCurrentStep(2)}
                                        className={cn("flex items-center gap-2 px-8 py-4 text-xs tracking-widest uppercase transition-all",
                                            isStepValid(1) ? "bg-red text-white hover:bg-red/90" : "bg-muted text-muted-foreground cursor-not-allowed"
                                        )}>
                                        Continuer <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* ── Étape 2 : Situation pro ── */}
                            <div className={cn(currentStep === 2 ? "block" : "hidden")}>
                                <div className="text-center mb-10">
                                    <Briefcase className="w-10 h-10 text-red mx-auto mb-3" />
                                    <h2 className="text-2xl font-serif font-light text-foreground">Situation professionnelle</h2>
                                </div>
                                <div className="grid md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs uppercase tracking-wider text-muted-foreground">Profession *</label>
                                        <input type="text" required value={form.profession}
                                            onChange={e => setForm({ ...form, profession: e.target.value })}
                                            className={inputCls} placeholder="Ex: Ingénieur, Commerçant..." />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs uppercase tracking-wider text-muted-foreground">Employeur / Entreprise</label>
                                        <input type="text" value={form.employeur}
                                            onChange={e => setForm({ ...form, employeur: e.target.value })}
                                            className={inputCls} placeholder="Nom de l'entreprise" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs uppercase tracking-wider text-muted-foreground">Revenu mensuel net *</label>
                                        <select required value={form.revenu_mensuel}
                                            onChange={e => setForm({ ...form, revenu_mensuel: e.target.value })}
                                            className={selectCls}>
                                            <option value="">Sélectionner</option>
                                            <option>Moins de 300 000 FCFA</option>
                                            <option>300 000 – 600 000 FCFA</option>
                                            <option>600 000 – 1 000 000 FCFA</option>
                                            <option>1 000 000 – 2 000 000 FCFA</option>
                                            <option>Plus de 2 000 000 FCFA</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs uppercase tracking-wider text-muted-foreground">Ancienneté dans le poste</label>
                                        <select value={form.anciennete}
                                            onChange={e => setForm({ ...form, anciennete: e.target.value })}
                                            className={selectCls}>
                                            <option value="">Sélectionner</option>
                                            <option>Moins de 6 mois</option>
                                            <option>6 mois – 1 an</option>
                                            <option>1 – 3 ans</option>
                                            <option>Plus de 3 ans</option>
                                        </select>
                                    </div>
                                </div>

                                {form.type_demande === "location" && (
                                    <div className="mt-8 pt-6 border-t border-border">
                                        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Garant (optionnel)</p>
                                        <div className="grid md:grid-cols-3 gap-5">
                                            {[
                                                { key: "garant_nom",        label: "Nom du garant",  placeholder: "Nom complet",       type: "text" },
                                                { key: "garant_telephone",  label: "Téléphone",      placeholder: "+225 XX XX XX XX", type: "tel"  },
                                                { key: "garant_profession", label: "Profession",     placeholder: "Profession",        type: "text" },
                                            ].map(({ key, label, placeholder, type }) => (
                                                <div key={key} className="space-y-1.5">
                                                    <label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</label>
                                                    <input type={type} value={form[key as keyof typeof form] as string}
                                                        onChange={e => setForm({ ...form, [key]: e.target.value })}
                                                        className={inputCls} placeholder={placeholder} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-10 flex justify-between">
                                    <button type="button" onClick={() => setCurrentStep(1)}
                                        className="flex items-center gap-2 px-8 py-4 border border-border text-muted-foreground text-xs tracking-widest uppercase hover:border-red hover:text-red transition-colors">
                                        Retour
                                    </button>
                                    <button type="button" disabled={!isStepValid(2)} onClick={() => setCurrentStep(3)}
                                        className={cn("flex items-center gap-2 px-8 py-4 text-xs tracking-widest uppercase transition-all",
                                            isStepValid(2) ? "bg-red text-white hover:bg-red/90" : "bg-muted text-muted-foreground cursor-not-allowed"
                                        )}>
                                        Continuer <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* ── Étape 3 : Documents ── */}
                            <div className={cn(currentStep === 3 ? "block" : "hidden")}>
                                <div className="text-center mb-10">
                                    <FileText className="w-10 h-10 text-red mx-auto mb-3" />
                                    <h2 className="text-2xl font-serif font-light text-foreground">Documents à fournir</h2>
                                    <p className="text-muted-foreground text-sm mt-2 max-w-md mx-auto">
                                        Liste officielle des documents requis pour votre profil. Cochez ceux que vous pouvez fournir.
                                    </p>
                                </div>

                                {form.type_profil && (
                                    <div className="flex items-center gap-3 p-4 bg-red/5 border border-red/30 mb-6">
                                        <FileText className="w-5 h-5 text-red shrink-0" />
                                        <div>
                                            <p className="text-xs text-red uppercase tracking-wider">Profil sélectionné</p>
                                            <p className="text-foreground text-sm font-medium">
                                                {DOCS_CONFIG[form.type_profil as keyof typeof DOCS_CONFIG]?.label}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3 mb-6">
                                    {currentDocs.map(doc => (
                                        <button key={doc.id} type="button" onClick={() => toggleDoc(doc.id)}
                                            className={cn(
                                                "w-full text-left flex items-start gap-4 p-4 border transition-all",
                                                checkedDocs.includes(doc.id)
                                                    ? "border-emerald-500/40 bg-emerald-500/5"
                                                    : "border-border hover:border-red/30"
                                            )}>
                                            <div className={cn(
                                                "w-5 h-5 border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all",
                                                checkedDocs.includes(doc.id) ? "border-emerald-500 bg-emerald-500" : "border-border"
                                            )}>
                                                {checkedDocs.includes(doc.id) && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={cn("text-sm font-medium",
                                                        checkedDocs.includes(doc.id) ? "text-foreground" : "text-muted-foreground"
                                                    )}>
                                                        {doc.label}
                                                    </p>
                                                    {doc.optional && (
                                                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground border border-border px-2 py-0.5 shrink-0">
                                                            Optionnel
                                                        </span>
                                                    )}
                                                </div>
                                                {doc.note && (
                                                    <p className="text-muted-foreground text-xs mt-1 leading-relaxed">{doc.note}</p>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {!allRequiredChecked && checkedDocs.length > 0 && (
                                    <div className="flex items-start gap-3 p-4 bg-yellow-500/5 border border-yellow-500/30 mb-4">
                                        <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                                        <p className="text-sm text-muted-foreground">Cochez tous les documents obligatoires pour continuer.</p>
                                    </div>
                                )}

                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-8">
                                    <span>{checkedDocs.filter(id => requiredDocs.some(d => d.id === id)).length} / {requiredDocs.length} documents obligatoires</span>
                                    {allRequiredChecked && (
                                        <span className="text-emerald-500 flex items-center gap-1">
                                            <Check className="w-3 h-3" /> Tous les documents requis cochés
                                        </span>
                                    )}
                                </div>

                                <div className="mt-4 flex justify-between">
                                    <button type="button" onClick={() => setCurrentStep(2)}
                                        className="flex items-center gap-2 px-8 py-4 border border-border text-muted-foreground text-xs tracking-widest uppercase hover:border-red hover:text-red transition-colors">
                                        Retour
                                    </button>
                                    <button type="button" disabled={!allRequiredChecked} onClick={() => setCurrentStep(4)}
                                        className={cn("flex items-center gap-2 px-8 py-4 text-xs tracking-widest uppercase transition-all",
                                            allRequiredChecked ? "bg-red text-white hover:bg-red/90" : "bg-muted text-muted-foreground cursor-not-allowed"
                                        )}>
                                        Continuer <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* ── Étape 4 : Bien visé ── */}
                            <div className={cn(currentStep === 4 ? "block" : "hidden")}>
                                <div className="text-center mb-10">
                                    <Home className="w-10 h-10 text-red mx-auto mb-3" />
                                    <h2 className="text-2xl font-serif font-light text-foreground">Bien immobilier visé</h2>
                                </div>

                                {preSelected ? (
                                    <div className="flex items-center gap-4 p-5 bg-card border border-red/30 mb-6">
                                        <div className="w-16 h-16 bg-cover bg-center shrink-0 bg-muted"
                                            style={{ backgroundImage: `url('${preSelected.thumbnail || ""}')` }} />
                                        <div className="flex-1">
                                            <p className="text-xs text-red uppercase tracking-wider mb-0.5">Bien sélectionné</p>
                                            <p className="text-foreground font-serif text-lg">{preSelected.title}</p>
                                            <p className="text-muted-foreground text-xs">{preSelected.location}</p>
                                        </div>
                                        <p className="text-red font-serif text-lg text-right shrink-0">
                                            {preSelected.price_label || `${preSelected.price?.toLocaleString("fr-FR")} FCFA`}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-1.5 mb-6">
                                        <label className="text-xs uppercase tracking-wider text-muted-foreground">Choisir un bien *</label>
                                        <select required value={form.property_id}
                                            onChange={e => setForm({ ...form, property_id: e.target.value })}
                                            className={selectCls}>
                                            <option value="">Sélectionnez un bien</option>
                                            {properties.map(p => (
                                                <option key={p.id} value={p.id}>{p.title} — {p.location}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="space-y-1.5 mb-6">
                                    <label className="text-xs uppercase tracking-wider text-muted-foreground">Type de demande</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { v: "location", l: "Location", d: "Je souhaite louer ce bien" },
                                            { v: "vente",    l: "Achat",    d: "Je souhaite acheter ce bien" },
                                        ].map(({ v, l, d }) => (
                                            <button key={v} type="button" onClick={() => setForm({ ...form, type_demande: v })}
                                                className={cn("p-4 text-left border transition-all",
                                                    form.type_demande === v ? "border-red bg-red/5" : "border-border hover:border-red/50"
                                                )}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-foreground font-serif text-lg">{l}</span>
                                                    <div className={cn("w-5 h-5 border-2 flex items-center justify-center",
                                                        form.type_demande === v ? "border-red bg-red" : "border-border"
                                                    )}>
                                                        {form.type_demande === v && <Check className="w-3 h-3 text-white" />}
                                                    </div>
                                                </div>
                                                <p className="text-muted-foreground text-xs">{d}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs uppercase tracking-wider text-muted-foreground">Message (optionnel)</label>
                                    <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                                        rows={4} className={inputCls + " resize-none"}
                                        placeholder="Disponibilités, questions, informations complémentaires..." />
                                </div>

                                <div className="mt-10 flex justify-between">
                                    <button type="button" onClick={() => setCurrentStep(3)}
                                        className="flex items-center gap-2 px-8 py-4 border border-border text-muted-foreground text-xs tracking-widest uppercase hover:border-red hover:text-red transition-colors">
                                        Retour
                                    </button>
                                    <button type="button" disabled={!isStepValid(4)} onClick={() => setCurrentStep(5)}
                                        className={cn("flex items-center gap-2 px-8 py-4 text-xs tracking-widest uppercase transition-all",
                                            isStepValid(4) ? "bg-red text-white hover:bg-red/90" : "bg-muted text-muted-foreground cursor-not-allowed"
                                        )}>
                                        Vérifier <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* ── Étape 5 : Récapitulatif ── */}
                            <div className={cn(currentStep === 5 ? "block" : "hidden")}>
                                <div className="text-center mb-10">
                                    <FileText className="w-10 h-10 text-red mx-auto mb-3" />
                                    <h2 className="text-2xl font-serif font-light text-foreground">Récapitulatif</h2>
                                    <p className="text-muted-foreground text-sm mt-1">Vérifiez vos informations avant d&apos;envoyer</p>
                                </div>

                                <div className="bg-card border border-border divide-y divide-border mb-6">
                                    {([
                                        { section: "Identité" },
                                        { label: "Profil",      value: DOCS_CONFIG[form.type_profil as keyof typeof DOCS_CONFIG]?.label || "—" },
                                        { label: "Nom complet", value: `${form.prenom} ${form.nom}` },
                                        { label: "Email",       value: form.email },
                                        { label: "Téléphone",   value: form.telephone },
                                        { section: "Situation" },
                                        { label: "Profession",  value: form.profession },
                                        { label: "Revenus",     value: form.revenu_mensuel ? form.revenu_mensuel + " / mois" : "—" },
                                        { section: "Documents cochés" },
                                        ...currentDocs.filter(d => checkedDocs.includes(d.id)).map(d => ({ checked: true, value: d.label })),
                                        { section: "Bien visé" },
                                        { label: "Bien",  value: preSelected ? `${preSelected.title} — ${preSelected.location}` : properties.find(p => p.id === form.property_id)?.title || "—" },
                                        { label: "Type",  value: form.type_demande === "location" ? "Location" : "Achat" },
                                    ] as Array<{section?: string; label?: string; value?: string; checked?: boolean}>).map((item, i) => (
                                        item.section ? (
                                            <div key={i} className="px-5 py-2 bg-background">
                                                <p className="text-xs text-red uppercase tracking-widest">{item.section}</p>
                                            </div>
                                        ) : item.checked ? (
                                            <div key={i} className="flex items-center gap-3 px-5 py-2.5">
                                                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                                <span className="text-foreground text-sm">{item.value}</span>
                                            </div>
                                        ) : (
                                            <div key={i} className="flex justify-between px-5 py-3 gap-4">
                                                <span className="text-muted-foreground text-sm shrink-0">{item.label}</span>
                                                <span className="text-foreground text-sm text-right">{item.value}</span>
                                            </div>
                                        )
                                    ))}
                                </div>

                                <div className="p-4 bg-yellow-500/5 border border-yellow-500/30 mb-8 flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        <strong className="text-foreground">Important :</strong> Les documents cochés devront être remis en original ou en copie lors de notre rencontre, après validation de votre dossier.
                                    </p>
                                </div>

                                <div className="flex justify-between">
                                    <button type="button" onClick={() => setCurrentStep(4)}
                                        className="flex items-center gap-2 px-8 py-4 border border-border text-muted-foreground text-xs tracking-widest uppercase hover:border-red hover:text-red transition-colors">
                                        Modifier
                                    </button>
                                    <button type="submit" disabled={submitStatus === "loading"}
                                        className="flex items-center gap-2 px-8 py-4 bg-red text-white text-xs tracking-widest uppercase hover:bg-red/90 disabled:opacity-60 transition-all min-w-52 justify-center">
                                        {submitStatus === "loading"
                                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi en cours...</>
                                            : <><FileText className="w-4 h-4" /> Soumettre mon dossier</>
                                        }
                                    </button>
                                </div>
                            </div>

                        </form>
                    </div>
                </div>
            </section>
            <Footer />
        </main>
    )
}

export default function DossierPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-red animate-spin" />
            </main>
        }>
            <DossierContent />
        </Suspense>
    )
}