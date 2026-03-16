"use client"

import { MapPin } from "lucide-react"
import Link from "next/link"

const locations = [
    {
        name: "Cocody",
        subtitle: "Quartier Résidentiel Premium",
        properties: 120,
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop"
    },
    {
        name: "Riviera",
        subtitle: "L'Excellence Abidjanaise",
        properties: 85,
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop"
    },
    {
        name: "Angré",
        subtitle: "Modernité & Confort",
        properties: 65,
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop"
    },
    {
        name: "Bouaké",
        subtitle: "Deuxième Ville du Pays",
        properties: 40,
        image: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?q=80&w=2070&auto=format&fit=crop"
    }
]

export function LocationsSection() {
    return (
        <section className="py-24 md:py-32 bg-card">
            <div className="container mx-auto px-6">
                {/* Section Header */}
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-px w-12 bg-red" />
                            <span className="text-red font-(--font-sans)  text-xs tracking-[0.3em] uppercase">
                                Emplacements
                            </span>
                        </div>

                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light tracking-wide text-foreground">
                            Nos Quartiers<br />
                            <span className="text-red">de Prédilection</span>
                        </h2>
                    </div>

                    <p className="text-muted-foreground font-(--font-sans)  leading-relaxed max-w-md">
                        Découvrez les quartiers les plus prisés d&apos;Abidjan où nous proposons
                        une sélection exclusive de biens immobiliers.
                    </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {locations.map((location, index) => (
                        <Link
                            key={index}
                            href="#"
                            className="group relative overflow-hidden aspect-[4/3] rounded-lg shadow-lg"
                        >
                            {/* Background Image */}
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                style={{ backgroundImage: `url('${location.image || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800"}')` }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent" />

                            {/* Content */}
                            <div className="absolute bottom inset-0 p-6 flex flex-col justify-end">
                                <div className="flex items-center gap-2 text-red mb-2">
                                    <MapPin className="w-4 h-4" />
                                    <span className="font-[var(--font-sans)] text-xs tracking-wider uppercase">
                                        {location.properties} Biens
                                    </span>
                                </div>

                                <h3 className="text-2xl font-serif text-foreground mb-1 group-hover:text-red transition-colors">
                                    {location.name}
                                </h3>

                                <p className="text-muted-foreground font-[var(--font-sans)] text-sm mb-4">
                                    {location.subtitle}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Map Section */}
                <div className="mt-20 grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h3 className="text-3xl md:text-4xl font-serif text-foreground mb-6">
                            Présents sur<br />
                            <span className="text-red">Tout le Territoire</span>
                        </h3>
                        <p className="text-muted-foreground font-(--font-sans)  leading-relaxed mb-8">
                            Avec notre siège à Abidjan et notre agence à Bouaké, nous couvrons
                            les principales zones économiques de la Côte d&apos;Ivoire pour vous offrir
                            un service de proximité et une connaissance approfondie du marché local.
                        </p>

                        {/* Offices */}
                        <div className="space-y-6">
                            <div className="flex gap-6 p-6 border border-border hover:border-red transition-colors">
                                <div className="w-2 h-full bg-red" />
                                <div>
                                    <h4 className="text-xl font-serif text-foreground mb-2">Siège - Abidjan</h4>
                                    <p className="text-muted-foreground font-(--font-sans)  text-sm mb-1">
                                        Cocody-Angré Boulevard Latrille
                                    </p>
                                    <p className="text-red font-(--font-sans)  text-sm">
                                        +225 22 42 98 76 / 47 32 69 64
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-6 p-6 border border-border hover:border-red transition-colors">
                                <div className="w-2 h-full bg-red" />
                                <div>
                                    <h4 className="text-xl font-serif text-foreground mb-2">Agence - Bouaké</h4>
                                    <p className="text-muted-foreground font-(--font-sans)  text-sm mb-1">
                                        Centre-ville de Bouaké
                                    </p>
                                    <p className="text-red font-(--font-sans)  text-sm">
                                        +225 30 63 03 84 / 47 32 69 64
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Map Placeholder */}
                    <div className="relative aspect-square bg-muted overflow-hidden">
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{
                                backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop')"
                            }}
                        />
                        <div className="absolute inset-0 bg-background/30" />

                        {/* Map Markers */}
                        <div className="absolute top-[63%] left-[44%] -translate-x-1/2 -translate-y-1/2">
                            <div className="relative">
                                <div className="w-4 h-4 bg-red-600 rounded-full animate-ping absolute" />
                                <div className="w-4 h-4 bg-red-600 rounded-full relative" />
                                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-foreground text-xs tracking-wider">
                                    ABIDJAN
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
