"use client"

import React, { useState } from "react"
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, AlertCircle } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

// Client Supabase créé directement ici pour éviter tout problème d'import
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type FormState = "idle" | "loading" | "success" | "error"

export function ContactSection() {
    const [formData, setFormData] = useState({
        name: "", email: "", phone: "", subject: "", message: "",
    })
    const [formState, setFormState] = useState<FormState>("idle")
    const [errorMsg, setErrorMsg] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormState("loading")
        setErrorMsg("")

        try {
            const { error } = await supabase
                .from("contact_messages")
                .insert([{
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    phone: formData.phone.trim() || null,
                    subject: formData.subject.trim() || null,
                    message: formData.message.trim(),
                    status: "nouveau",
                }])

            if (error) {
                console.error("Supabase error:", error)
                // Message d'erreur spécifique selon le code
                if (error.code === "42501") {
                    setErrorMsg("Erreur de permission. Vérifiez la politique RLS dans Supabase (voir solution ci-dessous).")
                } else {
                    setErrorMsg(`Erreur: ${error.message}`)
                }
                setFormState("error")
                return
            }

            setFormState("success")
            setFormData({ name: "", email: "", phone: "", subject: "", message: "" })

        } catch (err) {
            console.error("Unexpected error:", err)
            setErrorMsg("Une erreur inattendue s'est produite. Vérifiez votre connexion.")
            setFormState("error")
        }
    }

    return (
        <section id="contact" className="py-24 md:py-32 bg-background">
            <div className="container mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-16">

                    {/* ─── Infos de contact ─── */}
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-px w-12 bg-red" />
                            <span className="text-red font-(--font-sans) text-xs tracking-[0.3em] uppercase">Contact</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light tracking-wide text-foreground mb-8">
                            Parlons de<br />
                            <span className="text-red">Votre Projet</span>
                        </h2>
                        <p className="text-muted-foreground font-(--font-sans) leading-relaxed mb-12">
                            Que vous souhaitiez louer, acheter, vendre ou confier la gestion de vos biens,
                            notre équipe est à votre écoute pour vous accompagner dans tous vos projets immobiliers.
                        </p>
                        <div className="space-y-6">
                            {[
                                { icon: Phone, title: "Téléphone", content: "+225 22 42 98 76\n+225 47 32 69 64" },
                                { icon: Mail, title: "Email", content: "contact@binkoassocies.com\ninfo@binkoassocies.com" },
                                { icon: MapPin, title: "Adresse", content: "Cocody-Angré Boulevard Latrille\nAbidjan, Côte d'Ivoire" },
                                { icon: Clock, title: "Horaires", content: "Lundi - Vendredi: 8h00 - 18h00\nSamedi: 9h00 - 13h00" },
                            ].map(({ icon: Icon, title, content }) => (
                                <div key={title} className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-red/10 flex items-center justify-center shrink-0">
                                        <Icon className="w-5 h-5 text-red" />
                                    </div>
                                    <div>
                                        <h4 className="text-foreground font-serif text-lg mb-1">{title}</h4>
                                        <p className="text-muted-foreground font-(--font-sans) text-sm whitespace-pre-line">{content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ─── Formulaire ─── */}
                    <div className="bg-card border border-border p-8 md:p-12">
                        <h3 className="text-2xl font-serif text-foreground mb-8">
                            Envoyez-nous un message
                        </h3>

                        {/* Succès */}
                        {formState === "success" && (
                            <div className="flex items-start gap-4 p-5 bg-emerald-50 border border-emerald-200 mb-8">
                                <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-emerald-800 font-serif text-lg mb-1">Message envoyé !</p>
                                    <p className="text-emerald-700 font-(--font-sans) text-sm">
                                        Nous avons bien reçu votre message et vous répondrons dans les plus brefs délais.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Erreur */}
                        {formState === "error" && (
                            <div className="flex items-start gap-4 p-5 bg-red-50 border border-red-200 mb-8">
                                <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-red-700 font-(--font-sans) text-sm">{errorMsg}</p>
                                    {errorMsg.includes("RLS") && (
                                        <p className="text-red-600 text-xs mt-2 font-mono bg-red-100 p-2">
                                            Solution : Supabase → SQL Editor → collez et exécutez :<br />
                                            <strong>ALTER TABLE contact_messages DISABLE ROW LEVEL SECURITY;</strong>
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-muted-foreground font-(--font-sans) text-xs tracking-wider uppercase">
                                        Nom complet *
                                    </label>
                                    <input type="text" value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required disabled={formState === "loading"}
                                        className="w-full bg-background border border-border px-4 py-3 text-foreground font-(--font-sans) text-sm focus:border-red focus:outline-none transition-colors disabled:opacity-50"
                                        placeholder="Votre nom" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-muted-foreground font-(--font-sans) text-xs tracking-wider uppercase">
                                        Email *
                                    </label>
                                    <input type="email" value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required disabled={formState === "loading"}
                                        className="w-full bg-background border border-border px-4 py-3 text-foreground font-(--font-sans) text-sm focus:border-red focus:outline-none transition-colors disabled:opacity-50"
                                        placeholder="votre@email.com" />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-muted-foreground font-(--font-sans) text-xs tracking-wider uppercase">
                                        Téléphone
                                    </label>
                                    <input type="tel" value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        disabled={formState === "loading"}
                                        className="w-full bg-background border border-border px-4 py-3 text-foreground font-(--font-sans) text-sm focus:border-red focus:outline-none transition-colors disabled:opacity-50"
                                        placeholder="+225 XX XX XX XX" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-muted-foreground font-(--font-sans) text-xs tracking-wider uppercase">
                                        Sujet
                                    </label>
                                    <select value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        disabled={formState === "loading"}
                                        className="w-full bg-background border border-border px-4 py-3 text-foreground font-(--font-sans) text-sm focus:border-red focus:outline-none transition-colors appearance-none cursor-pointer disabled:opacity-50">
                                        <option value="">Sélectionner</option>
                                        <option value="location">Location</option>
                                        <option value="vente">Vente</option>
                                        <option value="gestion">Gestion Locative</option>
                                        <option value="autre">Autre</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-muted-foreground font-(--font-sans) text-xs tracking-wider uppercase">
                                    Message *
                                </label>
                                <textarea value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    required rows={5} disabled={formState === "loading"}
                                    className="w-full bg-background border border-border px-4 py-3 text-foreground font-(--font-sans) text-sm focus:border-red focus:outline-none transition-colors resize-none disabled:opacity-50"
                                    placeholder="Décrivez votre projet ou votre demande..." />
                            </div>

                            <button type="submit" disabled={formState === "loading"}
                                className="w-full bg-red text-primary-foreground px-8 py-4 font-(--font-sans) text-xs tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-red/90 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed">
                                {formState === "loading" ? (
                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Envoi en cours...</>
                                ) : (
                                    <><Send className="w-4 h-4" /> Envoyer le message</>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    )
}