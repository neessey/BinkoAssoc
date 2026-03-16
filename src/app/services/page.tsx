/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Home, Key, TrendingUp, FileText, ChevronDown, Check, ArrowRight, Building2, Shield, Clock, Users } from "lucide-react"
import { useEffect, useState } from "react"
import Link from "next/link"

const services = [
    {
        id: "location",
        icon: Home,
        title: "Location",
        subtitle: "Résidentiel & Commercial",
        description: "Trouvez le bien idéal parmi notre sélection d'appartements, villas et locaux commerciaux dans les meilleurs quartiers d'Abidjan.",
        longDescription: "Notre service de location vous accompagne dans la recherche du bien parfait, que ce soit pour un usage résidentiel ou commercial. Nous disposons d'un large portefeuille de propriétés dans les quartiers les plus prisés d'Abidjan : Cocody, Riviera, Marcory, Plateau, et bien d'autres.",
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop",
        features: [
            "Recherche personnalisée selon vos critères",
            "Visites accompagnées des biens",
            "Négociation des conditions de bail",
            "Rédaction et vérification des contrats",
            "État des lieux d'entrée et de sortie",
            "Suivi administratif complet"
        ]
    },
    {
        id: "vente",
        icon: Key,
        title: "Vente",
        subtitle: "Investissement Premium",
        description: "Investissez dans l'immobilier ivoirien avec nos opportunités exclusives de vente dans des emplacements stratégiques.",
        longDescription: "Que vous souhaitiez acquérir votre résidence principale, un investissement locatif ou un bien commercial, nous vous proposons des opportunités d'acquisition dans les zones à fort potentiel d'Abidjan et ses environs.",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
        features: [
            "Estimation gratuite de votre bien",
            "Mise en valeur et promotion",
            "Qualification des acquéreurs",
            "Accompagnement juridique",
            "Négociation au meilleur prix",
            "Suivi jusqu'à la signature notariale"
        ]
    },
    {
        id: "gestion",
        icon: TrendingUp,
        title: "Gestion Locative",
        subtitle: "Administration Complète",
        description: "Confiez-nous la gestion de vos biens : recherche de locataires, encaissement des loyers, suivi technique et administratif.",
        longDescription: "Notre service de gestion locative prend en charge l'intégralité de l'administration de vos biens immobiliers. De la recherche de locataires à l'encaissement des loyers, en passant par le suivi technique, nous vous libérons de toutes les contraintes.",
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop",
        features: [
            "Recherche et sélection de locataires",
            "Rédaction des baux",
            "Encaissement et reversement des loyers",
            "Gestion des impayés",
            "Suivi des travaux et entretien",
            "Reporting mensuel détaillé"
        ]
    },
    {
        id: "meuble",
        icon: FileText,
        title: "Résidence Meublée",
        subtitle: "Clé en Main",
        description: "Découvrez nos résidences entièrement meublées et équipées, prêtes à vous accueillir pour des séjours courts ou longs.",
        longDescription: "Pour les expatriés, les professionnels en mission ou simplement ceux qui recherchent un confort immédiat, nos résidences meublées offrent tout le nécessaire pour un séjour agréable : mobilier de qualité, électroménager, linge de maison.",
        image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2070&auto=format&fit=crop",
        features: [
            "Appartements entièrement équipés",
            "Mobilier de qualité",
            "Électroménager inclus",
            "Linge de maison fourni",
            "Services de ménage disponibles",
            "Flexibilité des durées de séjour"
        ]
    }
]

const whyChooseUs = [
    {
        icon: Building2,
        title: "Expertise Locale",
        description: "Une connaissance approfondie du marché immobilier abidjanais et ivoirien."
    },
    {
        icon: Shield,
        title: "Sécurité",
        description: "Vos transactions et vos biens sont protégés par des processus rigoureux."
    },
    {
        icon: Clock,
        title: "Réactivité",
        description: "Une équipe disponible et réactive pour répondre à toutes vos demandes."
    },
    {
        icon: Users,
        title: "Accompagnement",
        description: "Un suivi personnalisé tout au long de votre projet immobilier."
    }
]

export default function ServicesPage() {
    const [isVisible, setIsVisible] = useState(false)
    const [activeService, setActiveService] = useState("location")

    useEffect(() => {
        setIsVisible(true)
    }, [])

    const currentService = services.find(s => s.id === activeService) || services[0]

    return (
        <main className="bg-background min-h-screen">
            <Header />

            {/* Hero Section */}
            <section className="relative h-[70vh] min-h-125 flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')"
                    }}
                />
                <div className="absolute inset-0 bg-white/50 " />

                <div className={`relative z-10 text-center px-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="h-px w-12 bg-red" />
                        <span className="text-red font-(--font-sans)  text-xs tracking-[0.3em] uppercase">
                            Notre Expertise
                        </span>
                        <div className="h-px w-12 bg-red" />
                    </div>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-light tracking-wide text-foreground mb-6">
                        Nos<br />
                        <span className="text-red">Services</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-foreground font-(--font-sans)  text-lg leading-relaxed">
                        Des solutions immobilières complètes adaptées à chacun de vos besoins.
                    </p>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <ChevronDown className="w-8 h-8 text-red" />
                </div>
            </section>

            {/* Services Navigation */}
            <section className="py-8 bg-white border-b border-border sticky top-18 z-40">
                <div className="container mx-auto px-6">
                    <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                        {services.map((service) => (
                            <button
                                key={service.id}
                                onClick={() => setActiveService(service.id)}
                                className={`flex items-center gap-2 px-6 py-3 font-(--font-sans)  text-xs tracking-wider uppercase transition-all duration-300 ${activeService === service.id
                                    ? 'bg-red text-primary-foreground'
                                    : 'text-muted-foreground hover:text-red'
                                    }`}
                            >
                                <service.icon className="w-4 h-4" />
                                {service.title}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Service Detail */}
            <section className="py-24 md:py-32">
                <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Image */}
                        <div className="relative">
                            <div
                                className="aspect-[4/3] bg-cover bg-center"
                                style={{ backgroundImage: `url('${currentService.image}')` }}
                            />
                            <div className="absolute -bottom-6 -right-6 bg-red text-primary-foreground p-6 shadow-2xl">
                                <currentService.icon className="w-8 h-8" />
                            </div>
                        </div>

                        {/* Content */}
                        <div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-px w-12 bg-red" />
                                <span className="text-red font-(--font-sans)  text-xs tracking-[0.3em] uppercase">
                                    {currentService.subtitle}
                                </span>
                            </div>

                            <h2 className="text-4xl md:text-5xl font-serif font-light tracking-wide text-foreground mb-6">
                                {currentService.title}
                            </h2>

                            <p className="text-muted-foreground font-(--font-sans)  leading-relaxed mb-8">
                                {currentService.longDescription}
                            </p>

                            {/* Features List */}
                            <div className="space-y-4 mb-8">
                                {currentService.features.map((feature, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-red shrink-0 mt-0.5" />
                                        <span className="text-foreground font-(--font-sans)  text-sm">
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-3 px-8 py-4 bg-red text-primary-foreground font-(--font-sans)  text-xs tracking-widest uppercase hover:bg-red/90 transition-all duration-300"
                            >
                                <span>Nous contacter</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-24 md:py-32 bg-background">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="h-px w-12 bg-red" />
                            <span className="text-red font-(--font-sans)  text-xs tracking-[0.3em] uppercase">
                                Nos Atouts
                            </span>
                            <div className="h-px w-12 bg-red" />
                        </div>

                        <h2 className="text-4xl md:text-5xl font-serif font-light tracking-wide text-foreground mb-6">
                            Pourquoi Choisir<br />
                            <span className="text-red">Binko & Associés</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {whyChooseUs.map((item, index) => (
                            <div
                                key={index}
                                className="group p-8 border border-border hover:border-red transition-all duration-500 text-center"
                            >
                                <item.icon className="w-12 h-12 text-red mb-6 mx-auto group-hover:scale-110 transition-transform duration-300" />
                                <h3 className="text-xl font-serif text-foreground mb-3">{item.title}</h3>
                                <p className="text-muted-foreground font-(--font-sans)  text-sm leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 md:py-32 bg-white">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-serif font-light tracking-wide text-foreground mb-6">
                        Prêt à démarrer<br />
                        <span className="text-red">votre projet ?</span>
                    </h2>
                    <p className="max-w-2xl mx-auto text-muted-foreground font-(--font-sans)  leading-relaxed mb-10">
                        Notre équipe est à votre disposition pour vous accompagner dans tous vos projets immobiliers.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/contact"
                            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-red text-primary-foreground font-(--font-sans)  text-xs tracking-widest uppercase hover:bg-red/90 transition-all duration-300"
                        >
                            Nous contacter
                        </Link>
                        <Link
                            href="/biens"
                            className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-red text-red font-(--font-sans)  text-xs tracking-widest uppercase hover:bg-red hover:text-primary-foreground transition-all duration-300"
                        >
                            Voir nos biens
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}
