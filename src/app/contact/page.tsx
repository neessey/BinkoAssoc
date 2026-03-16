/* eslint-disable react-hooks/set-state-in-effect */
"use client"
import { useEffect, useState } from "react"
import React from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Phone, Mail, MapPin, Clock, Send, ChevronDown, Facebook, Instagram, Linkedin, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

// Client Supabase
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const offices = [
    {
        city: "Abidjan",
        title: "Siège Social",
        address: "Cocody-Angré Boulevard Latrille",
        address2: "Immeuble SIPIM, 2ème étage",
        phone: "+225 22 42 98 76",
        phone2: "+225 47 32 69 64",
        email: "contact@binkoassocies.com",
        hours: "Lun - Ven: 8h00 - 18h00 | Sam: 9h00 - 13h00",
        mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3972.5!2d-3.98!3d5.36!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNcKwMjEnMzYuMCJOIDPCsDU4JzQ4LjAiVw!5e0!3m2!1sfr!2sci!4v1234567890"
    },
    {
        city: "Bouaké",
        title: "Agence",
        address: "Quartier Commerce",
        address2: "Avenue principale, près de la Mairie",
        phone: "+225 31 63 45 78",
        phone2: "+225 07 89 12 34",
        email: "bouake@binkoassocies.com",
        hours: "Lun - Ven: 8h00 - 17h00 | Sam: 9h00 - 12h00",
        mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3972.5!2d-5.03!3d7.69!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwNDEnMjQuMCJOIDXCsDAyJzI0LjAiVw!5e0!3m2!1sfr!2sci!4v1234567890"
    }
]

type FormStatus = "idle" | "loading" | "success" | "error"

export default function ContactPage() {
    const [isVisible, setIsVisible] = useState(false)
    const [selectedOffice, setSelectedOffice] = useState(0)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        propertyType: "",
        budget: "",
        message: ""
    })
    const [formStatus, setFormStatus] = useState<FormStatus>("idle")
    const [errorMsg, setErrorMsg] = useState("")

    useEffect(() => {
        setIsVisible(true)
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormStatus("loading")
        setErrorMsg("")

        try {
            const { error } = await supabase
                .from("contact_messages")
                .insert([{
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    phone: formData.phone.trim() || null,
                    subject: formData.subject.trim() || null,
                    message: [
                        formData.message.trim(),
                        formData.propertyType ? `Type de bien : ${formData.propertyType}` : null,
                        formData.budget ? `Budget : ${formData.budget}` : null,
                    ].filter(Boolean).join("\n\n"),
                    status: "nouveau",
                }])

            if (error) {
                console.error("Supabase error:", error)
                setErrorMsg("Une erreur est survenue. Veuillez réessayer ou nous appeler directement.")
                setFormStatus("error")
                return
            }

            setFormStatus("success")
            setFormData({
                name: "", email: "", phone: "", subject: "",
                propertyType: "", budget: "", message: ""
            })

            // Réinitialiser après 6 secondes
            setTimeout(() => setFormStatus("idle"), 6000)

        } catch (err) {
            console.error("Unexpected error:", err)
            setErrorMsg("Une erreur inattendue s'est produite. Vérifiez votre connexion.")
            setFormStatus("error")
        }
    }

    return (
        <main className="bg-background min-h-screen">
            <Header />

            {/* Hero Section */}
            <section className="relative h-[60vh] min-h-100 flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop')"
                    }}
                />
                <div className="absolute inset-0 bg-white/50 " />

                <div className={`relative z-10 text-center px-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-light tracking-wide text-foreground mb-6">
                        Parlons de<br />
                        <span className="text-red">Votre Projet</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-foreground font-(--font-sans) text-lg leading-relaxed">
                        Notre équipe est à votre écoute pour vous accompagner dans tous vos projets immobiliers.
                    </p>
                </div>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <ChevronDown className="w-8 h-8 text-red" />
                </div>
            </section>

            {/* Contact Info Cards */}
            <section className="py-12 bg-card">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { icon: Phone, label: "Téléphone", value: "+225 22 42 98 76" },
                            { icon: Mail, label: "Email", value: "contact@binkoassocies.com" },
                            { icon: MapPin, label: "Adresse", value: "Cocody-Angré, Abidjan" },
                            { icon: Clock, label: "Horaires", value: "Lun - Ven: 8h - 18h" },
                        ].map(({ icon: Icon, label, value }) => (
                            <div key={label} className="flex items-center gap-4 p-6 border border-border hover:border-red transition-all duration-300">
                                <div className="w-12 h-12 bg-red/10 flex items-center justify-center shrink-0">
                                    <Icon className="w-5 h-5 text-red" />
                                </div>
                                <div>
                                    <h4 className="text-foreground font-serif text-lg mb-1">{label}</h4>
                                    <p className="text-muted-foreground font-(--font-sans) text-sm">{value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Contact Section */}
            <section className="py-24 md:py-32">
                <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16">

                        {/* ─── Contact Form ─── */}
                        <div className="order-2 lg:order-1">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-px w-12 bg-red" />
                                <span className="text-red font-(--font-sans) text-xs tracking-[0.3em] uppercase">
                                    Formulaire
                                </span>
                            </div>

                            <h2 className="text-4xl md:text-5xl font-serif font-light tracking-wide text-foreground mb-8">
                                Envoyez-nous<br />
                                <span className="text-red">un message</span>
                            </h2>

                            {/* Succès */}
                            {formStatus === "success" && (
                                <div className="mb-8 p-6 bg-emerald-500/5 border border-emerald-500/30 flex items-start gap-4">
                                    <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-foreground font-serif text-lg mb-1">Message envoyé !</p>
                                        <p className="text-muted-foreground font-(--font-sans) text-sm">
                                            Merci pour votre message. Notre équipe vous contactera dans les plus brefs délais.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Erreur */}
                            {formStatus === "error" && (
                                <div className="mb-8 p-6 bg-red/5 border border-red/30 flex items-start gap-4">
                                    <AlertCircle className="w-6 h-6 text-red shrink-0 mt-0.5" />
                                    <p className="text-muted-foreground font-(--font-sans) text-sm">{errorMsg}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-muted-foreground font-(--font-sans) text-xs tracking-wider uppercase">
                                            Nom complet *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            disabled={formStatus === "loading"}
                                            className="w-full bg-card border border-border px-4 py-3 text-foreground font-(--font-sans) text-sm focus:border-red focus:outline-none transition-colors disabled:opacity-50"
                                            placeholder="Votre nom"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-muted-foreground font-(--font-sans) text-xs tracking-wider uppercase">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                            disabled={formStatus === "loading"}
                                            className="w-full bg-card border border-border px-4 py-3 text-foreground font-(--font-sans) text-sm focus:border-red focus:outline-none transition-colors disabled:opacity-50"
                                            placeholder="votre@email.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-muted-foreground font-(--font-sans) text-xs tracking-wider uppercase">
                                            Téléphone
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            disabled={formStatus === "loading"}
                                            className="w-full bg-card border border-border px-4 py-3 text-foreground font-(--font-sans) text-sm focus:border-red focus:outline-none transition-colors disabled:opacity-50"
                                            placeholder="+225 XX XX XX XX"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-muted-foreground font-(--font-sans) text-xs tracking-wider uppercase">
                                            Sujet *
                                        </label>
                                        <select
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            required
                                            disabled={formStatus === "loading"}
                                            className="w-full bg-card border border-border px-4 py-3 text-foreground font-(--font-sans) text-sm focus:border-red focus:outline-none transition-colors appearance-none cursor-pointer disabled:opacity-50"
                                        >
                                            <option value="">Sélectionner</option>
                                            <option value="location">Je cherche à louer</option>
                                            <option value="vente">Je cherche à acheter</option>
                                            <option value="vendre">Je souhaite vendre/louer mon bien</option>
                                            <option value="gestion">Gestion locative</option>
                                            <option value="information">Demande d&apos;information</option>
                                            <option value="autre">Autre</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-muted-foreground font-(--font-sans) text-xs tracking-wider uppercase">
                                            Type de bien
                                        </label>
                                        <select
                                            value={formData.propertyType}
                                            onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                                            disabled={formStatus === "loading"}
                                            className="w-full bg-card border border-border px-4 py-3 text-foreground font-(--font-sans) text-sm focus:border-red focus:outline-none transition-colors appearance-none cursor-pointer disabled:opacity-50"
                                        >
                                            <option value="">Sélectionner</option>
                                            <option value="appartement">Appartement</option>
                                            <option value="villa">Villa</option>
                                            <option value="duplex">Duplex</option>
                                            <option value="bureau">Bureau / Local commercial</option>
                                            <option value="terrain">Terrain</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-muted-foreground font-(--font-sans) text-xs tracking-wider uppercase">
                                            Budget
                                        </label>
                                        <select
                                            value={formData.budget}
                                            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                            disabled={formStatus === "loading"}
                                            className="w-full bg-card border border-border px-4 py-3 text-foreground font-(--font-sans) text-sm focus:border-red focus:outline-none transition-colors appearance-none cursor-pointer disabled:opacity-50"
                                        >
                                            <option value="">Sélectionner</option>
                                            <option value="0-200000">Moins de 200 000 FCFA</option>
                                            <option value="200000-500000">200 000 - 500 000 FCFA</option>
                                            <option value="500000-1000000">500 000 - 1 000 000 FCFA</option>
                                            <option value="1000000+">Plus de 1 000 000 FCFA</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-muted-foreground font-(--font-sans) text-xs tracking-wider uppercase">
                                        Message *
                                    </label>
                                    <textarea
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        required
                                        rows={6}
                                        disabled={formStatus === "loading"}
                                        className="w-full bg-card border border-border px-4 py-3 text-foreground font-(--font-sans) text-sm focus:border-red focus:outline-none transition-colors resize-none disabled:opacity-50"
                                        placeholder="Décrivez votre projet ou votre demande..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={formStatus === "loading"}
                                    className="w-full bg-red text-primary-foreground px-8 py-4 font-(--font-sans) text-xs tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-red/90 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {formStatus === "loading" ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Envoi en cours...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Envoyer le message
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* ─── Office Locations ─── */}
                        <div className="order-1 lg:order-2">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-px w-12 bg-red" />
                                <span className="text-red font-(--font-sans) text-xs tracking-[0.3em] uppercase">
                                    Nos Bureaux
                                </span>
                            </div>

                            <h2 className="text-4xl md:text-5xl font-serif font-light tracking-wide text-foreground mb-8">
                                Venez nous<br />
                                <span className="text-red">rencontrer</span>
                            </h2>

                            {/* Office Tabs */}
                            <div className="flex gap-4 mb-8">
                                {offices.map((office, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedOffice(index)}
                                        className={`px-6 py-3 font-(--font-sans) text-xs tracking-wider uppercase transition-all duration-300 ${selectedOffice === index
                                            ? 'bg-red text-primary-foreground'
                                            : 'border border-border text-muted-foreground hover:border-red hover:text-red'
                                            }`}
                                    >
                                        {office.city}
                                    </button>
                                ))}
                            </div>

                            {/* Selected Office Details */}
                            <div className="bg-card border border-border p-8 mb-8">
                                <h3 className="text-2xl font-serif text-foreground mb-2">
                                    {offices[selectedOffice].title}
                                </h3>
                                <p className="text-red font-(--font-sans) text-sm tracking-wider uppercase mb-6">
                                    {offices[selectedOffice].city}
                                </p>

                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <MapPin className="w-5 h-5 text-red shrink-0 mt-1" />
                                        <div>
                                            <p className="text-foreground font-(--font-sans) text-sm">
                                                {offices[selectedOffice].address}
                                            </p>
                                            <p className="text-muted-foreground font-(--font-sans) text-sm">
                                                {offices[selectedOffice].address2}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <Phone className="w-5 h-5 text-red shrink-0 mt-1" />
                                        <div>
                                            <a href={`tel:${offices[selectedOffice].phone.replace(/\s/g, '')}`}
                                                className="block text-foreground font-(--font-sans) text-sm hover:text-red transition-colors">
                                                {offices[selectedOffice].phone}
                                            </a>
                                            <a href={`tel:${offices[selectedOffice].phone2.replace(/\s/g, '')}`}
                                                className="block text-muted-foreground font-(--font-sans) text-sm hover:text-red transition-colors">
                                                {offices[selectedOffice].phone2}
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <Mail className="w-5 h-5 text-red shrink-0 mt-1" />
                                        <a href={`mailto:${offices[selectedOffice].email}`}
                                            className="text-foreground font-(--font-sans) text-sm hover:text-red transition-colors">
                                            {offices[selectedOffice].email}
                                        </a>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <Clock className="w-5 h-5 text-red shrink-0 mt-1" />
                                        <p className="text-muted-foreground font-(--font-sans) text-sm">
                                            {offices[selectedOffice].hours}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Map */}
                            <div className="aspect-video bg-card border border-border relative overflow-hidden">
                                <iframe
                                    src={offices[selectedOffice].mapUrl}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0, filter: 'grayscale(100%) contrast(1.1)' }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title={`Carte ${offices[selectedOffice].city}`}
                                />
                            </div>

                            {/* Social Links */}
                            <div className="mt-8">
                                <p className="text-foreground font-(--font-sans) text-xs tracking-wider uppercase mb-4">
                                    Suivez-nous
                                </p>
                                <div className="flex gap-4">
                                    {[Facebook, Instagram, Linkedin].map((Icon, i) => (
                                        <a key={i} href="#"
                                            className="w-10 h-10 border border-border flex items-center justify-center text-muted-foreground hover:border-red hover:text-red transition-all duration-300">
                                            <Icon className="w-4 h-4" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 md:py-32 bg-card">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="h-px w-12 bg-red" />
                            <span className="text-red font-(--font-sans) text-xs tracking-[0.3em] uppercase">FAQ</span>
                            <div className="h-px w-12 bg-red" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-serif font-light tracking-wide text-foreground">
                            Questions<br />
                            <span className="text-red">Fréquentes</span>
                        </h2>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-6">
                        {[
                            {
                                question: "Quels documents sont nécessaires pour louer un bien ?",
                                answer: "Pour louer un bien, vous devez fournir une pièce d'identité valide, un justificatif de revenus (bulletins de salaire ou attestation d'emploi), et une caution équivalente à 2-3 mois de loyer selon le bien."
                            },
                            {
                                question: "Quels sont vos honoraires de gestion locative ?",
                                answer: "Nos honoraires de gestion locative représentent généralement entre 5% et 10% du loyer mensuel, selon les services inclus. Contactez-nous pour un devis personnalisé."
                            },
                            {
                                question: "Proposez-vous des visites virtuelles des biens ?",
                                answer: "Oui, nous proposons des visites virtuelles pour certains de nos biens. Contactez-nous pour savoir si le bien qui vous intéresse dispose de cette option."
                            },
                            {
                                question: "Quel est le délai moyen pour trouver un locataire ?",
                                answer: "Le délai moyen est de 2 à 4 semaines selon le type de bien et sa localisation. Notre large réseau et notre expertise nous permettent de trouver rapidement des locataires qualifiés."
                            }
                        ].map((faq, index) => (
                            <div key={index} className="border border-border p-6 hover:border-red transition-all duration-300">
                                <h3 className="text-lg font-serif text-foreground mb-3">{faq.question}</h3>
                                <p className="text-muted-foreground font-(--font-sans) text-sm leading-relaxed">
                                    {faq.answer}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}