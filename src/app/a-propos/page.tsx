/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Building2, Users, Award, Shield, Target, Eye, Heart, ChevronDown } from "lucide-react"
import { useEffect, useState } from "react"

const values = [
    {
        icon: Shield,
        title: "Intégrité",
        description: "Nous agissons avec honnêteté et transparence dans toutes nos relations d'affaires."
    },
    {
        icon: Target,
        title: "Excellence",
        description: "Nous visons l'excellence dans chaque service que nous offrons à nos clients."
    },
    {
        icon: Users,
        title: "Proximité",
        description: "Nous cultivons des relations de confiance durables avec nos clients et partenaires."
    },
    {
        icon: Heart,
        title: "Engagement",
        description: "Nous nous engageons pleinement pour la satisfaction de nos clients."
    }
]

const team = [
    {
        name: "Mme Bintou TIMMIN",
        role: "Agent",
        email: "bintoutimmin@binkoassocies.com",
    },
    {
        name: "Elvis N\'DRI",
        role: "Agent",
        email: "elvisndri@binkoassocies.com",
    },
    {
        name: "Fulbert YAPI",
        role: "Agent",
        email: "fulbertyapi@binkoassocies.com",
    },
]

const milestones = [
    { year: "2008", title: "Création", description: "Fondation de Binko & Associés à Abidjan" },
    { year: "2012", title: "Expansion", description: "Ouverture de l'agence de Bouaké" },
    { year: "2016", title: "100 Biens", description: "Cap des 100 biens en gestion atteint" },
    { year: "2020", title: "Digital", description: "Lancement de notre plateforme en ligne" },
    { year: "2024", title: "500+ Biens", description: "Plus de 500 biens sous gestion" }
]

export default function AboutPage() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        setIsVisible(true)
    }, [])

    return (
        <main className="bg-background min-h-screen">
            <Header />

            {/* Hero Section */}
            <section className="relative h-[70vh] min-h-125 flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop')"
                    }}
                />
                <div className="absolute inset-0 bg-white/50 " />

                <div className={`relative z-10 text-center px-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="h-px w-12 bg-red" />
                        <span className="text-red font-(--font-sans)  text-xs tracking-[0.3em] uppercase">
                            Notre Histoire
                        </span>
                        <div className="h-px w-12 bg-red" />
                    </div>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-light tracking-wide text-foreground mb-6">
                        À Propos de<br />
                        <span className="text-red">Binko & Associés</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-foreground font-(--font-sans)  text-lg leading-relaxed">
                        Depuis 2014, nous accompagnons nos clients dans tous leurs projets immobiliers
                        avec professionnalisme et dévouement.
                    </p>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <ChevronDown className="w-8 h-8 text-red" />
                </div>
            </section>

            {/* About Content */}
            <section className="py-24 md:py-32 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left Content */}
                        <div>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-px w-12 bg-red" />
                                <span className="text-red font-(--font-sans)  text-xs tracking-[0.3em] uppercase">
                                    Qui sommes-nous
                                </span>
                            </div>

                            <h2 className="text-4xl md:text-5xl font-serif font-light tracking-wide text-foreground mb-8">
                                L&apos;Art de<br />
                                <span className="text-red">l&apos;Immobilier</span>
                            </h2>

                            <div className="space-y-6 text--foreground font-(--font-sans)  leading-relaxed">
                                <p>
                                    <strong className="text-foreground">Binko & Associés</strong> est une entreprise spécialisée
                                    dans l&apos;Administration de biens immobiliers. Notre métier d&apos;administrateur de biens et
                                    de gestionnaire de patrimoine immobilier consiste à gérer de manière rigoureuse et
                                    professionnelle vos investissements immobiliers à Abidjan.
                                </p>
                                <p>
                                    Nous mettons à la disposition de nos clients — propriétaires et bailleurs — notre
                                    service de gestion locative immobilière pour valoriser et sécuriser leurs patrimoines
                                    dans les meilleures conditions.
                                </p>
                                <p>
                                    Fort de notre expérience et de notre connaissance approfondie du marché immobilier
                                    ivoirien, nous offrons des solutions sur mesure adaptées aux besoins spécifiques
                                    de chaque client.
                                </p>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-8 mt-12 pt-12 border-t border-border">
                                <div className="text-center">
                                    <div className="text-4xl md:text-5xl font-serif text-red mb-2">15+</div>
                                    <div className="text--foreground font-(--font-sans)  text-xs tracking-wider uppercase">
                                        Années d&apos;expérience
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl md:text-5xl font-serif text-red mb-2">500+</div>
                                    <div className="text--foreground font-(--font-sans)  text-xs tracking-wider uppercase">
                                        Biens gérés
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl md:text-5xl font-serif text-red mb-2">98%</div>
                                    <div className="text--foreground font-(--font-sans)  text-xs tracking-wider uppercase">
                                        Clients satisfaits
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Content - Image Grid */}
                        <div className="relative w-full min-h-[500px]">
                            <div className="grid grid-cols-2 gap-4 w-full h-full">
                                <div className="space-y-4">
                                    <div
                                        className="aspect-[3/4] bg-cover bg-center"
                                        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800')" }}
                                    />
                                    <div
                                        className="aspect-square bg-cover bg-center"
                                        style={{ backgroundImage: "url('https://images.unsplash.com/photo-600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800')" }}
                                    />
                                </div>
                                <div className="space-y-4 pt-4">
                                    <div
                                        className="aspect-square bg-cover bg-center"
                                        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800')" }}
                                    />
                                    <div
                                        className="aspect-[3/4] bg-cover bg-center"
                                        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=800')" }}
                                    />
                                </div>
                            </div>


                            {/* Floating Badge */}
                            <div className="absolute -bottom-6 -left-6 bg-red text-primary-foreground p-6 shadow-2xl">
                                <div className="text-3xl font-serif font-semibold">2014</div>
                                <div className="text-xs font-(--font-sans)  tracking-wider uppercase">Fondée à Abidjan</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Vision & Mission */}
            <section className="py-24 md:py-32 bg-background">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16">
                        {/* Vision */}
                        <div className="relative p-12 border border-border hover:border-red transition-all duration-500 group">
                            <Eye className="w-12 h-12 text-red mb-6 group-hover:scale-110 transition-transform duration-300" />
                            <h3 className="text-3xl font-serif text-foreground mb-4">Notre Vision</h3>
                            <p className="text--foreground font-(--font-sans)  leading-relaxed">
                                Devenir le leader incontesté de la gestion immobilière en Côte d&apos;Ivoire, reconnu
                                pour notre excellence opérationnelle, notre intégrité et notre capacité à créer
                                de la valeur pour nos clients et partenaires.
                            </p>
                        </div>

                        {/* Mission */}
                        <div className="relative p-12 border border-border hover:border-red transition-all duration-500 group">
                            <Target className="w-12 h-12 text-red mb-6 group-hover:scale-110 transition-transform duration-300" />
                            <h3 className="text-3xl font-serif text-foreground mb-4">Notre Mission</h3>
                            <p className="text--foreground font-(--font-sans)  leading-relaxed">
                                Offrir des services immobiliers de qualité supérieure qui répondent aux attentes
                                de nos clients, en mettant à leur disposition notre expertise, notre engagement
                                et nos solutions innovantes.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Values */}
            <section className="py-24 md:py-32 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="h-px w-12 bg-red" />
                            <span className="text-red font-(--font-sans)  text-xs tracking-[0.3em] uppercase">
                                Nos Valeurs
                            </span>
                            <div className="h-px w-12 bg-red" />
                        </div>

                        <h2 className="text-4xl md:text-5xl font-serif font-light tracking-wide text-foreground mb-6">
                            Ce qui nous<br />
                            <span className="text-red">Guide</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => (
                            <div
                                key={index}
                                className="group p-8 border border-border hover:border-red transition-all duration-500 text-center"
                            >
                                <value.icon className="w-12 h-12 text-red mb-6 mx-auto group-hover:scale-110 transition-transform duration-300" />
                                <h3 className="text-xl font-serif text-foreground mb-3">{value.title}</h3>
                                <p className="text--foreground font-(--font-sans)  text-sm leading-relaxed">
                                    {value.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-24 md:py-14 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="h-px w-12 bg-red" />
                            <span className="text-red font-(--font-sans)  text-xs tracking-[0.3em] uppercase">
                                Notre Équipe
                            </span>
                            <div className="h-px w-12 bg-red" />
                        </div>

                        <h2 className="text-4xl md:text-5xl font-serif font-light tracking-wide text-foreground mb-6">
                            Des Experts à<br />
                            <span className="text-red">Votre Service</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {team.map((member, index) => (
                            <div
                                key={index}
                                className="group relative overflow-hidden border border-border hover:border-red transition-all duration-500"
                            >


                                {/* Content */}
                                <div className="p-8 bg-white">
                                    <h3 className="text-2xl font-serif text-foreground mb-1">{member.name}</h3>
                                    <div className="text-red font-(--font-sans)  text-xs tracking-wider uppercase mb-4">
                                        {member.role}
                                    </div>
                                    <a href={`mailto:${member.email}`} className="text-red font-(--font-sans) text-sm leading-relaxed hover:underline">
                                        {member.email}
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}
