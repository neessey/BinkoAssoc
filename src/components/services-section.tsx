"use client"

import { Home, Key, TrendingUp, FileText } from "lucide-react"
import Link from "next/link"

const services = [
    {
        icon: Home,
        title: "Location",
        subtitle: "Résidentiel & Commercial",
        description: "Trouvez le bien idéal parmi notre sélection d'appartements, villas et locaux commerciaux dans les meilleurs quartiers d'Abidjan.",
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop",
        href: "#location"
    },
    {
        icon: Key,
        title: "Vente",
        subtitle: "Investissement Premium",
        description: "Investissez dans l'immobilier ivoirien avec nos opportunités exclusives de vente dans des emplacements stratégiques.",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
        href: "#vente"
    },
    {
        icon: TrendingUp,
        title: "Gestion Locative",
        subtitle: "Administration Complète",
        description: "Confiez-nous la gestion de vos biens : recherche de locataires, encaissement des loyers, suivi technique et administratif.",
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop",
        href: "#gestion"
    },
    {
        icon: FileText,
        title: "Résidence Meublée",
        subtitle: "Clé en Main",
        description: "Découvrez nos résidences entièrement meublées et équipées, prêtes à vous accueillir pour des séjours courts ou longs.",
        image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2070&auto=format&fit=crop",
        href: "#meuble"
    }
]

export function ServicesSection() {
    return (
        <section id="services" className="py-24 md:py-32 bg-background relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div
                    className="absolute top-0 left-0 w-full h-full"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23c9a962' fillOpacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}
                />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="h-px w-12 bg-red" />
                        <span className="text-red font-[var(--font-sans)] text-xs tracking-[0.3em] uppercase">
                            Nos Services
                        </span>
                        <div className="h-px w-12 bg-red" />
                    </div>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light tracking-wide text-foreground mb-6">
                        Des Services<br />
                        <span className="text-red">d&apos;Exception</span>
                    </h2>

                    <p className="text-muted-foreground font-[var(--font-sans)] leading-relaxed">
                        Que vous soyez à la recherche d&apos;un bien à louer, à acheter, ou que vous souhaitiez
                        confier la gestion de votre patrimoine, nous avons la solution adaptée à vos besoins.
                    </p>
                </div>

                {/* Services Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                    {services.map((service, index) => {
                        const Icon = service.icon
                        return (
                            <Link
                                key={index}
                                href={service.href}
                                className="group relative overflow-hidden bg-card border border-border hover:border-red transition-all duration-500"
                            >
                                {/* Background Image */}
                                <div className="absolute inset-0">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                        style={{ backgroundImage: `url('${service.image}')` }}
                                    />
                                    <div className="absolute inset-0 bg-white/30" />
                                </div>

                                {/* Content */}
                                <div className="relative z-10 p-8 md:p-12 min-h-[100px] flex flex-col justify-end">
                                    <Icon className="w-12 h-12 text-red mb-6" />

                                    <span className="text-red font-[var(--font-sans)] text-xs tracking-[0.2em] uppercase mb-2">
                                        {service.subtitle}
                                    </span>

                                    <h3 className="text-3xl md:text-4xl font-serif text-background mb-4">
                                        {service.title}
                                    </h3>

                                    <p className="text-background font-[var(--font-sans)] leading-relaxed mb-6">
                                        {service.description}
                                    </p>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}