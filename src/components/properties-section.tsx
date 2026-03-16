"use client"

import { useState, useEffect } from "react"
import { MapPin, Bed, Bath, Square, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getProperties } from "@/lib/supabase"
import type { Property, PropertyType } from "@/types/database"

const categories = [
    { id: "all", label: "Tous les biens" },
    { id: "location", label: "Location" },
    { id: "vente", label: "Vente" },
    { id: "meuble", label: "Résidence Meublée" },
]

const typeLabels: Record<PropertyType, string> = {
    location: "Location",
    vente: "Vente",
    meuble: "Meublé",
}

export function PropertiesSection() {
    const [activeCategory, setActiveCategory] = useState<"all" | PropertyType>("all")
    const [properties, setProperties] = useState<Property[]>([])
    const [loading, setLoading] = useState(true)

    // Chargement depuis Supabase à chaque changement de filtre
    useEffect(() => {
        async function load() {
            setLoading(true)
            const data = await getProperties({ type: activeCategory })
            setProperties(data)
            setLoading(false)
        }
        load()
    }, [activeCategory])

    return (
        <section id="biens" className="py-24 md:py-32 bg-card">
            <div className="container mx-auto px-6">

                {/* Section Header */}
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-px w-12 bg-red" />
                            <span className="text-red font-[var(--font-sans)] text-xs tracking-[0.3em] uppercase">
                                Portfolio
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light tracking-wide text-foreground">
                            Nos Biens<br />
                            <span className="text-red">d&apos;Exception</span>
                        </h2>
                    </div>

                    {/* Filtres */}
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setActiveCategory(cat.id as "all" | PropertyType)}
                                className={cn(
                                    "px-6 py-3 font-[var(--font-sans)] text-xs tracking-wider uppercase transition-all duration-300",
                                    activeCategory === cat.id
                                        ? "bg-red text-primary-foreground"
                                        : "border border-border text-muted-foreground hover:border-red hover:text-red"
                                )}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex justify-center items-center py-24">
                        <Loader2 className="w-8 h-8 text-red animate-spin" />
                    </div>
                )}

                {/* Aucun résultat */}
                {!loading && properties.length === 0 && (
                    <div className="text-center py-24">
                        <p className="text-muted-foreground font-[var(--font-sans)] text-lg">
                            Aucun bien disponible dans cette catégorie.
                        </p>
                    </div>
                )}

                {/* Grille des biens */}
                {!loading && properties.length > 0 && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {properties.map((property) => (
                            <article
                                key={property.id}
                                className="group bg-background border border-border hover:border-red transition-all duration-500"
                            >
                                {/* Image */}
                                <div className="relative overflow-hidden aspect-[4/3]">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                        style={{
                                            backgroundImage: `url('${property.thumbnail || property.images?.[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800"}')`,
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent" />

                                    {property.featured && (
                                        <div className="absolute top-4 left-4 px-3 py-1 bg-red text-primary-foreground font-[var(--font-sans)] text-xs tracking-wider uppercase">
                                            En Vedette
                                        </div>
                                    )}

                                    <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm text-foreground font-[var(--font-sans)] text-xs tracking-wider uppercase">
                                        {typeLabels[property.type]}
                                    </div>
                                </div>

                                {/* Contenu */}
                                <div className="p-6">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                                        <MapPin className="w-4 h-4 text-red" />
                                        <span className="font-[var(--font-sans)] text-xs tracking-wider">
                                            {property.location}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-serif text-foreground mb-3 group-hover:text-red transition-colors">
                                        {property.title}
                                    </h3>

                                    <div className="flex items-center gap-4 text-muted-foreground font-[var(--font-sans)] text-sm mb-4">
                                        {property.beds > 0 && (
                                            <div className="flex items-center gap-1">
                                                <Bed className="w-4 h-4" />
                                                <span>{property.beds}</span>
                                            </div>
                                        )}
                                        {property.baths > 0 && (
                                            <div className="flex items-center gap-1">
                                                <Bath className="w-4 h-4" />
                                                <span>{property.baths}</span>
                                            </div>
                                        )}
                                        {property.area && (
                                            <div className="flex items-center gap-1">
                                                <Square className="w-4 h-4" />
                                                <span>{property.area} m²</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-border">
                                        <div className="text-red font-serif text-lg">
                                            {property.price_label || `${property.price.toLocaleString("fr-FR")} FCFA`}
                                        </div>
                                        <Link
                                            href={`/biens/${property.id}`}
                                            className="flex items-center gap-2 text-foreground font-[var(--font-sans)] text-xs tracking-wider uppercase hover:text-red transition-colors"
                                        >
                                            <span>Voir</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {/* Voir tout */}
                <div className="text-center mt-16">
                    <Link
                        href="/biens"
                        className="inline-flex items-center gap-3 px-8 py-4 border border-red text-red font-[var(--font-sans)] text-xs tracking-widest uppercase hover:bg-red hover:text-primary-foreground transition-all duration-300"
                    >
                        <span>Voir tous nos biens</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    )
}