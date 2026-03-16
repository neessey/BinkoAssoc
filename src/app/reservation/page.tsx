/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import React, { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import {
    Calendar, Clock, MapPin, User, Phone, Mail, Home,
    ChevronDown, Check, ArrowRight, Loader2, AlertCircle
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
    thumbnail: string | null
    type: string
    price_label: string | null
    price: number
}

const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
]

const visitTypes = [
    { id: "physique", label: "Visite physique", description: "Visitez le bien en personne avec notre conseiller" },
    { id: "virtuelle", label: "Visite virtuelle", description: "Découvrez le bien en vidéo depuis chez vous" },
]

type SubmitStatus = "idle" | "loading" | "success" | "error"

function ReservationContent() {
    const searchParams = useSearchParams()
    const propertyIdUrl = searchParams.get("bien")

    const [properties, setProperties] = useState<Property[]>([])
    const [loadingProps, setLoadingProps] = useState(true)
    const [preSelected, setPreSelected] = useState<Property | null>(null)

    const [formData, setFormData] = useState({
        nom: "", prenom: "", email: "", telephone: "",
        bien: propertyIdUrl || "",
        typeVisite: "physique",
        date: "", heure: "", message: ""
    })

    const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle")
    const [errorMsg, setErrorMsg] = useState("")

    // Si un bien est pré-sélectionné depuis l'URL → on commence à l'étape 1
    // Sinon on commence à l'étape 1 aussi, mais l'étape 2 sera visible
    const [currentStep, setCurrentStep] = useState(1)

    // ── Charger les biens depuis Supabase ──────────────────────
    useEffect(() => {
        async function load() {
            const { data } = await supabase
                .from("properties")
                .select("id, title, location, thumbnail, type, price_label, price")
                .eq("available", true)
                .order("title")
            setProperties((data as Property[]) || [])
            setLoadingProps(false)
        }
        load()
    }, [])

    // ── Identifier le bien pré-sélectionné ────────────────────
    useEffect(() => {
        if (propertyIdUrl && properties.length > 0) {
            const found = properties.find(p => p.id === propertyIdUrl)
            if (found) {
                setPreSelected(found)
                setFormData(prev => ({ ...prev, bien: found.id }))
            }
        }
    }, [propertyIdUrl, properties])

    // Si un bien est pré-sélectionné, on n'a que 2 étapes visibles (coordonnées → date)
    const hasPreSelected = !!preSelected
    const totalSteps = hasPreSelected ? 2 : 3

    // Numéros d'étapes affichés dans le stepper
    const steps = hasPreSelected
        ? [
            { step: 1, label: "Vos coordonnées" },
            { step: 2, label: "Date & Heure" },
        ]
        : [
            { step: 1, label: "Vos coordonnées" },
            { step: 2, label: "Choix du bien" },
            { step: 3, label: "Date & Heure" },
        ]

    const isStepValid = (step: number) => {
        if (hasPreSelected) {
            switch (step) {
                case 1: return !!(formData.nom && formData.prenom && formData.email && formData.telephone)
                case 2: return !!(formData.date && formData.heure)
                default: return false
            }
        } else {
            switch (step) {
                case 1: return !!(formData.nom && formData.prenom && formData.email && formData.telephone)
                case 2: return !!(formData.bien && formData.typeVisite)
                case 3: return !!(formData.date && formData.heure)
                default: return false
            }
        }
    }

    const lastStep = totalSteps

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitStatus("loading")
        setErrorMsg("")

        const selectedProperty = preSelected || properties.find(p => p.id === formData.bien)

        try {
            const { error } = await supabase
                .from("visit_requests")
                .insert([{
                    name: `${formData.prenom} ${formData.nom}`.trim(),
                    email: formData.email.trim(),
                    phone: formData.telephone.trim() || null,
                    property_name: selectedProperty
                        ? `${selectedProperty.title} - ${selectedProperty.location}`
                        : null,
                    preferred_date: formData.date || null,
                    message: [
                        formData.message?.trim() || null,
                        `Type de visite : ${visitTypes.find(v => v.id === formData.typeVisite)?.label}`,
                        `Heure souhaitée : ${formData.heure}`,
                    ].filter(Boolean).join("\n"),
                    status: "en_attente",
                }])

            if (error) {
                console.error("Supabase error:", error)
                setErrorMsg("Une erreur est survenue. Veuillez réessayer ou nous appeler directement.")
                setSubmitStatus("error")
                return
            }
            setSubmitStatus("success")
        } catch (err) {
            console.error(err)
            setErrorMsg("Une erreur inattendue s'est produite. Vérifiez votre connexion.")
            setSubmitStatus("error")
        }
    }

    // ─── Écran de confirmation ────────────────────────────────
    if (submitStatus === "success") {
        const selectedProperty = preSelected || properties.find(p => p.id === formData.bien)
        return (
            <main className="min-h-screen bg-background">
                <Header />
                <section className="min-h-[80vh] flex items-center justify-center py-24 px-6">
                    <div className="max-w-xl text-center">
                        <div className="w-20 h-20 bg-red/10 flex items-center justify-center mx-auto mb-8">
                            <Check className="w-10 h-10 text-red" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif font-light text-foreground mb-6">
                            Réservation<br /><span className="text-red">Confirmée</span>
                        </h1>
                        <p className="text-muted-foreground font-(--font-sans) text-sm leading-relaxed mb-8">
                            Votre demande de visite a été enregistrée avec succès.
                            Un conseiller Binko & Associés vous contactera dans les plus brefs délais
                            pour confirmer votre rendez-vous.
                        </p>

                        <div className="p-6 bg-card border border-border mb-8 text-left">
                            <h3 className="text-foreground font-serif text-lg mb-4">Récapitulatif</h3>
                            <div className="divide-y divide-border">
                                {[
                                    { label: "Nom", value: `${formData.prenom} ${formData.nom}` },
                                    { label: "Bien", value: selectedProperty ? `${selectedProperty.title} — ${selectedProperty.location}` : "—" },
                                    { label: "Type", value: visitTypes.find(v => v.id === formData.typeVisite)?.label || "—" },
                                    {
                                        label: "Date", value: formData.date
                                            ? new Date(formData.date).toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
                                            : "—"
                                    },
                                    { label: "Heure", value: formData.heure, red: true },
                                ].map(({ label, value, red }) => (
                                    <div key={label} className="flex justify-between py-3 gap-4">
                                        <span className="text-muted-foreground font-(--font-sans) text-sm shrink-0">{label}</span>
                                        <span className={cn("font-(--font-sans) text-sm text-right", red ? "text-red" : "text-foreground")}>{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/biens"
                                className="inline-flex items-center gap-3 px-8 py-4 bg-red text-white font-(--font-sans) text-xs tracking-widest uppercase hover:bg-red/90 transition-colors">
                                <span>Voir d&apos;autres biens</span><ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link href="/"
                                className="inline-flex items-center gap-3 px-8 py-4 border border-border text-foreground font-(--font-sans) text-xs tracking-widest uppercase hover:border-red hover:text-red transition-colors">
                                Retour à l&apos;accueil
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
            <section className="relative h-[50vh] min-h-100 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${preSelected?.thumbnail || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop"}')` }} />
                <div className="absolute inset-0 bg-white/30" />
                <div className="relative z-10 text-center px-6">
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="h-px w-12 bg-red" />
                        <span className="text-red font-(--font-sans) text-xs tracking-[0.3em] uppercase">Visite Personnalisée</span>
                        <div className="h-px w-12 bg-red" />
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light tracking-wide text-foreground mb-4">
                        Réserver<br /><span className="text-red">une Visite</span>
                    </h1>
                    {/* Nom du bien pré-sélectionné dans le hero */}
                    {preSelected && (
                        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-background/80 backdrop-blur-sm border border-red/30">
                            <MapPin className="w-4 h-4 text-red shrink-0" />
                            <span className="text-foreground font-(--font-sans) text-sm">
                                {preSelected.title} — {preSelected.location}
                            </span>
                        </div>
                    )}
                </div>
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <ChevronDown className="w-5 h-5 text-red" />
                </div>
            </section>

            {/* Progress Steps */}
            <section className="bg-card border-b border-border">
                <div className="container mx-auto px-6 py-6">
                    <div className="flex items-center justify-center gap-4 md:gap-8">
                        {steps.map((item, index) => (
                            <div key={item.step} className="flex items-center gap-4">
                                <button type="button"
                                    onClick={() => { if (item.step < currentStep) setCurrentStep(item.step) }}
                                    className={cn("flex items-center gap-3 transition-all duration-300",
                                        currentStep === item.step ? "opacity-100" : "opacity-50 hover:opacity-75"
                                    )}>
                                    <div className={cn(
                                        "w-10 h-10 flex items-center justify-center font-(--font-sans) text-sm transition-all duration-300",
                                        currentStep === item.step ? "bg-red text-white"
                                            : currentStep > item.step ? "bg-red/20 text-red"
                                                : "border border-border text-muted-foreground"
                                    )}>
                                        {currentStep > item.step ? <Check className="w-4 h-4" /> : item.step}
                                    </div>
                                    <span className={cn("hidden md:block font-(--font-sans) text-xs tracking-wider uppercase",
                                        currentStep === item.step ? "text-red" : "text-muted-foreground"
                                    )}>
                                        {item.label}
                                    </span>
                                </button>
                                {index < steps.length - 1 && (
                                    <div className={cn("w-12 md:w-24 h-px transition-colors duration-300",
                                        currentStep > item.step ? "bg-red" : "bg-border"
                                    )} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Form */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto">

                        {submitStatus === "error" && (
                            <div className="mb-8 p-5 bg-red/5 border border-red/30 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red shrink-0 mt-0.5" />
                                <p className="text-muted-foreground font-(--font-sans) text-sm">{errorMsg}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>

                            {/* ── Étape 1 : Coordonnées ── */}
                            <div className={cn("transition-all duration-500", currentStep === 1 ? "block" : "hidden")}>
                                <div className="text-center mb-12">
                                    <User className="w-12 h-12 text-red mx-auto mb-4" />
                                    <h2 className="text-2xl md:text-3xl font-serif font-light text-foreground mb-2">Vos Coordonnées</h2>
                                    <p className="text-muted-foreground font-(--font-sans) text-sm">
                                        Renseignez vos informations pour que nous puissions vous contacter
                                    </p>
                                </div>

                                {/* Carte du bien sélectionné */}
                                {preSelected && (
                                    <div className="mb-8 flex items-center gap-4 p-4 bg-card border border-red/30">
                                        <div className="w-16 h-16 bg-cover bg-center shrink-0"
                                            style={{ backgroundImage: `url('${preSelected.thumbnail || ""}')` }} />
                                        <div>
                                            <p className="text-xs text-red uppercase tracking-wider mb-0.5">Bien sélectionné</p>
                                            <p className="text-foreground font-serif text-lg">{preSelected.title}</p>
                                            <p className="text-muted-foreground font-(--font-sans) text-xs flex items-center gap-1">
                                                <MapPin className="w-3 h-3 text-red" />{preSelected.location}
                                            </p>
                                        </div>
                                        <div className="ml-auto text-right">
                                            <p className="text-red font-serif text-lg">
                                                {preSelected.price_label || `${preSelected.price?.toLocaleString("fr-FR")} FCFA`}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="grid md:grid-cols-2 gap-6">
                                    {[
                                        { label: "Nom *", key: "nom", type: "text", placeholder: "Votre nom" },
                                        { label: "Prénom *", key: "prenom", type: "text", placeholder: "Votre prénom" },
                                        { label: "Email *", key: "email", type: "email", placeholder: "votre@email.com", icon: Mail },
                                        { label: "Téléphone *", key: "telephone", type: "tel", placeholder: "+225 XX XX XX XX XX", icon: Phone },
                                    ].map(({ label, key, type, placeholder, icon: Icon }) => (
                                        <div key={key} className="space-y-2">
                                            <label className="text-foreground font-(--font-sans) text-xs tracking-wider uppercase flex items-center gap-2">
                                                {Icon && <Icon className="w-4 h-4 text-red" />}{label}
                                            </label>
                                            <input type={type} required
                                                value={formData[key as keyof typeof formData] as string}
                                                onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                                                className="w-full px-4 py-4 bg-card border border-border text-foreground font-(--font-sans) text-sm focus:border-red focus:outline-none transition-colors"
                                                placeholder={placeholder} />
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-12 flex justify-end">
                                    <button type="button" disabled={!isStepValid(1)}
                                        onClick={() => setCurrentStep(hasPreSelected ? 2 : 2)}
                                        className={cn("flex items-center gap-3 px-8 py-4 font-(--font-sans) text-xs tracking-widest uppercase transition-all duration-300",
                                            isStepValid(1) ? "bg-red text-white hover:bg-red/90" : "bg-muted text-muted-foreground cursor-not-allowed"
                                        )}>
                                        <span>Continuer</span><ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* ── Étape 2 sans pré-sélection : Choix du bien ── */}
                            {!hasPreSelected && (
                                <div className={cn("transition-all duration-500", currentStep === 2 ? "block" : "hidden")}>
                                    <div className="text-center mb-12">
                                        <Home className="w-12 h-12 text-red mx-auto mb-4" />
                                        <h2 className="text-2xl md:text-3xl font-serif font-light text-foreground mb-2">Choix du Bien</h2>
                                        <p className="text-muted-foreground font-(--font-sans) text-sm">Sélectionnez le bien que vous souhaitez visiter</p>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-foreground font-(--font-sans) text-xs tracking-wider uppercase flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-red" />Bien à visiter *
                                            </label>
                                            <div className="relative">
                                                {loadingProps ? (
                                                    <div className="w-full px-4 py-4 bg-card border border-border flex items-center gap-2 text-muted-foreground text-sm">
                                                        <Loader2 className="w-4 h-4 animate-spin text-red" />
                                                        Chargement des biens...
                                                    </div>
                                                ) : (
                                                    <>
                                                        <select required value={formData.bien}
                                                            onChange={e => setFormData({ ...formData, bien: e.target.value })}
                                                            className="w-full px-4 py-4 bg-card border border-border text-foreground font-(--font-sans) text-sm focus:border-red focus:outline-none transition-colors appearance-none cursor-pointer">
                                                            <option value="">Sélectionnez un bien</option>
                                                            {properties.map(p => (
                                                                <option key={p.id} value={p.id}>
                                                                    {p.title} — {p.location}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-foreground font-(--font-sans) text-xs tracking-wider uppercase">Type de visite *</label>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                {visitTypes.map(type => (
                                                    <button key={type.id} type="button"
                                                        onClick={() => setFormData({ ...formData, typeVisite: type.id })}
                                                        className={cn("p-6 text-left border transition-all duration-300",
                                                            formData.typeVisite === type.id ? "border-red bg-red/5" : "border-border hover:border-red/50"
                                                        )}>
                                                        <div className="flex items-center justify-between mb-3">
                                                            <span className="text-foreground font-serif text-lg">{type.label}</span>
                                                            <div className={cn("w-5 h-5 border-2 flex items-center justify-center transition-all duration-300",
                                                                formData.typeVisite === type.id ? "border-red bg-red" : "border-border"
                                                            )}>
                                                                {formData.typeVisite === type.id && <Check className="w-3 h-3 text-white" />}
                                                            </div>
                                                        </div>
                                                        <p className="text-muted-foreground font-(--font-sans) text-sm">{type.description}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-12 flex justify-between">
                                        <button type="button" onClick={() => setCurrentStep(1)}
                                            className="flex items-center gap-3 px-8 py-4 border border-border text-foreground font-(--font-sans) text-xs tracking-widest uppercase hover:border-red hover:text-red transition-colors">
                                            Retour
                                        </button>
                                        <button type="button" disabled={!isStepValid(2)} onClick={() => setCurrentStep(3)}
                                            className={cn("flex items-center gap-3 px-8 py-4 font-(--font-sans) text-xs tracking-widest uppercase transition-all duration-300",
                                                isStepValid(2) ? "bg-red text-white hover:bg-red/90" : "bg-muted text-muted-foreground cursor-not-allowed"
                                            )}>
                                            <span>Continuer</span><ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ── Étape Date & Heure (étape 2 si pré-sélectionné, étape 3 sinon) ── */}
                            <div className={cn("transition-all duration-500",
                                currentStep === (hasPreSelected ? 2 : 3) ? "block" : "hidden"
                            )}>
                                <div className="text-center mb-12">
                                    <Calendar className="w-12 h-12 text-red mx-auto mb-4" />
                                    <h2 className="text-2xl md:text-3xl font-serif font-light text-foreground mb-2">Date & Heure</h2>
                                    <p className="text-muted-foreground font-(--font-sans) text-sm">Choisissez le moment qui vous convient le mieux</p>
                                </div>

                                {/* Type de visite si pré-sélectionné */}
                                {hasPreSelected && (
                                    <div className="mb-8 space-y-4">
                                        <label className="text-foreground font-(--font-sans) text-xs tracking-wider uppercase">Type de visite *</label>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {visitTypes.map(type => (
                                                <button key={type.id} type="button"
                                                    onClick={() => setFormData({ ...formData, typeVisite: type.id })}
                                                    className={cn("p-5 text-left border transition-all duration-300",
                                                        formData.typeVisite === type.id ? "border-red bg-red/5" : "border-border hover:border-red/50"
                                                    )}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-foreground font-serif text-base">{type.label}</span>
                                                        <div className={cn("w-5 h-5 border-2 flex items-center justify-center",
                                                            formData.typeVisite === type.id ? "border-red bg-red" : "border-border"
                                                        )}>
                                                            {formData.typeVisite === type.id && <Check className="w-3 h-3 text-white" />}
                                                        </div>
                                                    </div>
                                                    <p className="text-muted-foreground font-(--font-sans) text-xs">{type.description}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <label className="text-foreground font-(--font-sans) text-xs tracking-wider uppercase flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-red" />Date souhaitée *
                                        </label>
                                        <input type="date" required value={formData.date}
                                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full px-4 py-4 bg-card border border-border text-foreground font-(--font-sans) text-sm focus:border-red focus:outline-none transition-colors" />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-foreground font-(--font-sans) text-xs tracking-wider uppercase flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-red" />Créneau horaire *
                                        </label>
                                        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                                            {timeSlots.map(slot => (
                                                <button key={slot} type="button"
                                                    onClick={() => setFormData({ ...formData, heure: slot })}
                                                    className={cn("py-3 px-4 border font-(--font-sans) text-sm transition-all duration-300",
                                                        formData.heure === slot ? "border-red bg-red text-white" : "border-border text-foreground hover:border-red"
                                                    )}>
                                                    {slot}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-foreground font-(--font-sans) text-xs tracking-wider uppercase">Message (optionnel)</label>
                                        <textarea value={formData.message}
                                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                                            rows={4}
                                            className="w-full px-4 py-4 bg-card border border-border text-foreground font-(--font-sans) text-sm focus:border-red focus:outline-none transition-colors resize-none"
                                            placeholder="Informations complémentaires, questions, préférences..." />
                                    </div>
                                </div>

                                <div className="mt-12 flex justify-between">
                                    <button type="button" onClick={() => setCurrentStep(hasPreSelected ? 1 : 2)}
                                        className="flex items-center gap-3 px-8 py-4 border border-border text-foreground font-(--font-sans) text-xs tracking-widest uppercase hover:border-red hover:text-red transition-colors">
                                        Retour
                                    </button>
                                    <button type="submit"
                                        disabled={!isStepValid(hasPreSelected ? 2 : 3) || submitStatus === "loading"}
                                        className={cn("flex items-center gap-3 px-8 py-4 font-(--font-sans) text-xs tracking-widest uppercase transition-all duration-300",
                                            isStepValid(hasPreSelected ? 2 : 3) && submitStatus !== "loading"
                                                ? "bg-red text-white hover:bg-red/90"
                                                : "bg-muted text-muted-foreground cursor-not-allowed"
                                        )}>
                                        {submitStatus === "loading"
                                            ? <><Loader2 className="w-4 h-4 animate-spin" />Envoi en cours...</>
                                            : <><span>Confirmer la réservation</span><Check className="w-4 h-4" /></>
                                        }
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            {/* Contact Alternative */}
            <section className="py-16 bg-card border-t border-border">
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto text-center">
                        <h3 className="text-xl md:text-2xl font-serif font-light text-foreground mb-4">
                            Besoin d&apos;aide pour réserver ?
                        </h3>
                        <p className="text-muted-foreground font-(--font-sans) text-sm mb-8">
                            Notre équipe est disponible pour vous accompagner dans votre démarche
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <a href="tel:+22527222525"
                                className="flex items-center gap-3 text-red hover:text-red/80 transition-colors">
                                <Phone className="w-5 h-5" />
                                <span className="font-(--font-sans) text-sm">+225 27 22 25 25</span>
                            </a>
                            <div className="hidden sm:block w-px h-6 bg-border" />
                            <a href="mailto:contact@binkoassocies.com"
                                className="flex items-center gap-3 text-red hover:text-red/80 transition-colors">
                                <Mail className="w-5 h-5" />
                                <span className="font-(--font-sans) text-sm">contact@binkoassocies.com</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}

export default function ReserverVisitePage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-red animate-spin" />
                    <p className="text-muted-foreground font-(--font-sans) text-sm uppercase tracking-widest">Chargement...</p>
                </div>
            </main>
        }>
            <ReservationContent />
        </Suspense>
    )
}