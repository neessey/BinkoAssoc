"use client"

import { useState, useEffect, ReactNode } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MapPin, Bed, Bath, Square, Utensils, CarFront, Armchair, ShowerHead, ArrowRight, ChevronDown, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type PropertyType = "location" | "vente" | "meuble"

interface Property {
    room: ReactNode
    kitchen: string
    balcon: string
    parking: string
    toilet: string
    id: string
    title: string
    description: string | null
    location: string
    quartier: string | null
    type: PropertyType
    price: number
    price_label: string | null
    beds: number
    baths: number
    area: number | null
    thumbnail: string | null
    featured: boolean
    available: boolean
}

const categoryLabels: Record<string, string> = {
    all: "Tous les biens",
    location: "Location",
    vente: "Vente",
    meuble: "Résidence Meublée",
}

export default function BiensPage() {
    const [properties, setProperties] = useState<Property[]>([])
    const [loading, setLoading] = useState(true)
    const [activeCategory, setActiveCategory] = useState("all")
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

    useEffect(() => {
        async function load() {
            setLoading(true)
            const { data, error } = await supabase
                .from("properties")
                .select("*")
                .eq("available", true)
                .order("featured", { ascending: false })
                .order("created_at", { ascending: false })

            if (!error && data) setProperties(data as Property[])
            setLoading(false)
        }
        load()
    }, [])

    const filteredProperties = activeCategory === "all"
        ? properties
        : properties.filter(p => p.type === activeCategory)

    // Comptages dynamiques
    const categories = [
        { id: "all", label: "Tous les biens", count: properties.length },
        { id: "location", label: "Location", count: properties.filter(p => p.type === "location").length },
        { id: "vente", label: "Vente", count: properties.filter(p => p.type === "vente").length },
        { id: "meuble", label: "Résidence Meublée", count: properties.filter(p => p.type === "meuble").length },
    ]

    const fallbackImage = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop"

    return (
        <main className="min-h-screen bg-background">
            <Header />

            {/* Hero Section */}
            <section className="relative h-[70vh] min-h-125 flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop')` }}
                />
                <div className="absolute inset-0 bg-white/50" />

                <div className="relative z-10 text-center px-6">
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="h-px w-12 bg-red" />
                        <span className="text-red font-(--font-sans) text-xs tracking-[0.3em] uppercase">
                            Collection Exclusive
                        </span>
                        <div className="h-px w-12 bg-red" />
                    </div>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-light tracking-wide text-foreground mb-6">
                        Nos Biens<br />
                        <span className="text-red">d&apos;Exception</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-foreground font-(--font-sans) text-sm md:text-base leading-relaxed">
                        Découvrez notre sélection de propriétés haut de gamme à Abidjan et en Côte d&apos;Ivoire.
                        Chaque bien est soigneusement sélectionné pour répondre aux exigences les plus élevées.
                    </p>
                </div>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <ChevronDown className="w-8 h-8 text-red" />
                </div>
            </section>

            {/* Filter Bar */}
            <section className="sticky top-18 z-40 bg-white/95 backdrop-blur-sm border-b border-border">
                <div className="container mx-auto px-6">
                    <div className="flex items-center justify-between py-4 overflow-x-auto">
                        <div className="flex items-center gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={cn(
                                        "px-5 py-2.5 font-(--font-sans) text-xs tracking-wider uppercase transition-all duration-300 whitespace-nowrap flex items-center gap-2",
                                        activeCategory === cat.id
                                            ? "bg-red text-white"
                                            : "text-muted-foreground hover:text-red"
                                    )}
                                >
                                    <span>{cat.label}</span>
                                    <span className={cn(
                                        "text-[10px] px-1.5 py-0.5 rounded-full",
                                        activeCategory === cat.id ? "bg-background/20" : "bg-muted"
                                    )}>
                                        {cat.count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className="text-muted-foreground font-(--font-sans) text-sm">
                            {loading ? "Chargement..." : `${filteredProperties.length} bien${filteredProperties.length > 1 ? 's' : ''} disponible${filteredProperties.length > 1 ? 's' : ''}`}
                        </div>
                    </div>
                </div>
            </section>

            {/* Properties List */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-6">

                    {/* État de chargement */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-32 gap-4">
                            <Loader2 className="w-8 h-8 text-red animate-spin" />
                            <p className="text-muted-foreground font-(--font-sans) text-sm uppercase tracking-widest">
                                Chargement des biens...
                            </p>
                        </div>
                    )}

                    {/* Aucun bien */}
                    {!loading && filteredProperties.length === 0 && (
                        <div className="text-center py-32">
                            <p className="text-foreground font-serif text-2xl mb-4">Aucun bien disponible</p>
                            <p className="text-muted-foreground font-(--font-sans) text-sm">
                                {activeCategory !== "all"
                                    ? `Aucun bien de type « ${categoryLabels[activeCategory]} » pour le moment.`
                                    : "Revenez bientôt, notre portfolio s'enrichit régulièrement."}
                            </p>
                        </div>
                    )}

                    {/* Liste des biens */}
                    {!loading && filteredProperties.length > 0 && (
                        <div className="space-y-0">
                            {filteredProperties.map((property, index) => (
                                <article
                                    key={property.id}
                                    className={cn(
                                        "group grid md:grid-cols-2 gap-0 border-b border-border cursor-pointer",
                                        index % 2 === 1 && "md:direction-rtl"
                                    )}
                                    onClick={() => setSelectedProperty(property)}
                                >
                                    {/* Image */}
                                    <div className={cn(
                                        "relative aspect-[16/10] md:aspect-auto md:h-125 overflow-hidden",
                                        index % 2 === 1 && "md:direction-ltr"
                                    )}>
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                            style={{ backgroundImage: `url('${property.thumbnail || fallbackImage}')` }}
                                        />
                                        <div className="absolute inset-0 bg-linear-to-t from-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                        {/* Badges */}
                                        <div className="absolute top-6 left-6 flex items-center gap-2">
                                            {property.featured && (
                                                <div className="px-3 py-1.5 bg-red text-background font-(--font-sans) text-[10px] tracking-widest uppercase">
                                                    En Vedette
                                                </div>
                                            )}
                                            <div className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-foreground font-(--font-sans) text-[10px] tracking-widest uppercase">
                                                {property.type === "location" ? "Location" : property.type === "vente" ? "Vente" : "Meublé"}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className={cn(
                                        "flex flex-col justify-center p-8 md:p-12 lg:p-16 bg-white",
                                        index % 2 === 1 && "md:direction-ltr"
                                    )}>
                                        <div className="flex items-center gap-2 text-muted-foreground mb-4">
                                            <MapPin className="w-4 h-4 text-red" />
                                            <span className="font-(--font-sans) text-xs tracking-wider uppercase">
                                                {property.location}
                                            </span>
                                        </div>

                                        <h2 className="text-3xl md:text-4xl font-serif font-light text-foreground mb-2 group-hover:text-red transition-colors duration-300">
                                            {property.title}
                                        </h2>

                                        {property.quartier && (
                                            <p className="text-red font-serif text-lg mb-6">
                                                {property.quartier}
                                            </p>
                                        )}

                                        <p className="text-muted-foreground font-(--font-sans) text-sm leading-relaxed mb-8 line-clamp-3">
                                            {property.description || "Bien d'exception disponible à la location ou à la vente."}
                                        </p>

                                        {/* Features */}
                                        <div className="flex items-center gap-6 text-foreground font-(--font-sans) text-sm mb-8 pb-8 border-b border-border">
                                            <div className="flex items-center gap-2">
                                                <Bed className="w-4 h-4 text-red" />
                                                <span>{property.beds} Chambres</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Bath className="w-4 h-4 text-red" />
                                                <span>{property.toilet} Toilettes</span>
                                            </div>
                                            {property.area && (
                                                <div className="flex items-center gap-2">
                                                    <Square className="w-4 h-4 text-red" />
                                                    <span>{property.area} m²</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Price & CTA */}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-muted-foreground font-(--font-sans) text-xs tracking-wider uppercase block mb-1">
                                                    {property.type === "location" || property.type === "meuble" ? "À partir de" : "Prix"}
                                                </span>
                                                <span className="text-red font-serif text-2xl">
                                                    {property.price_label || `${property.price.toLocaleString("fr-FR")} FCFA`}
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                className="flex items-center gap-3 px-6 py-3 border border- red text-red font-(--font-sans) text-xs tracking-widest uppercase hover:bg-red hover:text-background transition-all duration-300"
                                            >
                                                <span>Découvrir</span>
                                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Property Modal */}
            {selectedProperty && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/95 backdrop-blur-sm"
                    onClick={() => setSelectedProperty(null)}
                >
                    <div
                        className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white border border-border"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setSelectedProperty(null)}
                            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-background/80 backdrop-blur-sm text-foreground hover:text-red transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="grid md:grid-cols-2">
                            {/* Image */}
                            <div className="relative aspect-[4/3] md:aspect-auto md:h-full min-h-75">
                                <div
                                    className="absolute inset-0 bg-cover bg-center"
                                    style={{ backgroundImage: `url('${selectedProperty.thumbnail || fallbackImage}')` }}
                                />
                            </div>

                            {/* Content */}
                            <div className="p-8 md:p-12">
                                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                                    <MapPin className="w-4 h-4 text-red" />
                                    <span className="font-(--font-sans) text-xs tracking-wider uppercase">
                                        {selectedProperty.location}
                                    </span>
                                </div>

                                <h2 className="text-3xl md:text-4xl font-serif font-light text-foreground mb-2">
                                    {selectedProperty.title}
                                </h2>

                                {selectedProperty.quartier && (
                                    <p className="text-red font-serif text-lg mb-6">
                                        {selectedProperty.quartier}
                                    </p>
                                )}

                                <p className="text-muted-foreground font-(--font-sans) text-sm leading-relaxed mb-8">
                                    {selectedProperty.description || "Bien d'exception disponible."}
                                </p>

                                {/* Features */}
                                <div className="grid grid-cols-3 gap-4 mb-8 pb-8 border-b border-border">
                                    <div className="text-center p-4 bg-black/10">
                                        <Bed className="w-5 h-5 text-red mx-auto mb-2" />
                                        <span className="block text-foreground font-serif text-xl">{selectedProperty.beds}</span>
                                        <span className="text-foreground font-(--font-sans) text-xs">Chambres</span>
                                    </div>
                                    <div className="text-center p-4 bg-black/10">
                                        <Armchair className="w-5 h-5 text-red mx-auto mb-2" />
                                        <span className="block text-foreground font-serif text-xl">{selectedProperty.room}</span>
                                        <span className="text-foreground font-(--font-sans) text-xs">Salon</span>
                                    </div>
                                    <div className="text-center p-4 bg-black/10">
                                        <Utensils className="w-5 h-5 text-red mx-auto mb-2" />
                                        <span className="block text-foreground font-serif text-xl">{selectedProperty.kitchen || "—"}</span>
                                        <span className="text-foreground font-(--font-sans) text-xs">Cuisines</span>
                                    </div>
                                    <div className="text-center p-4 bg-black/10">
                                        <Square className="w-5 h-5 text-red mx-auto mb-2" />
                                        <span className="block text-foreground font-serif text-xl">{selectedProperty.balcon || "—"}</span>
                                        <span className="text-foreground font-(--font-sans) text-xs">Balcon</span>
                                    </div>
                                    <div className="text-center p-4 bg-black/10">
                                        <CarFront className="w-5 h-5 text-red mx-auto mb-2" />
                                        <span className="block text-foreground font-serif text-xl">{selectedProperty.parking || "—"}</span>
                                        <span className="text-foreground font-(--font-sans) text-xs">Parking</span>
                                    </div>
                                    <div className="text-center p-4 bg-black/10">
                                        <ShowerHead className="w-5 h-5 text-red mx-auto mb-2" />
                                        <span className="block text-foreground font-serif text-xl">{selectedProperty.toilet || "—"}</span>
                                        <span className="text-foreground font-(--font-sans) text-xs">toilette</span>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="mb-8 p-6 bg-muted/10 border border-border">
                                    <span className="text-foreground font-(--font-sans) text-xs tracking-wider uppercase block mb-2">
                                        {selectedProperty.type === "location" || selectedProperty.type === "meuble" ? "Loyer mensuel" : "Prix de vente"}
                                    </span>
                                    <span className="text-red font-serif text-3xl">
                                        {selectedProperty.price_label || `${selectedProperty.price.toLocaleString("fr-FR")} FCFA`}
                                    </span>
                                </div>

                                {/* CTA */}
                                <div className="flex gap-4">
                                    <Link
                                        href={`/reservation?bien=${selectedProperty.id}`}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-red text-background font-(--font-sans) text-xs tracking-widest uppercase hover:bg-(--red-light) transition-colors"
                                        onClick={() => setSelectedProperty(null)}
                                    >
                                        <span>Réserver une visite</span>
                                    </Link>
                                    <a
                                        href="tel:+22527222525"
                                        className="flex items-center justify-center gap-2 px-6 py-4 border border-red text-red font-(--font-sans) text-xs tracking-widest uppercase hover:bg-red hover:text-background transition-colors"
                                    >
                                        <span>Appeler</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Contact CTA Section */}
            <section className="py-24 md:py-32 bg-white border-t border-border">
                <div className="container mx-auto px-6 text-center">
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="h-px w-12 bg-red" />
                        <span className="text-red font-(--font-sans) text-xs tracking-[0.3em] uppercase">
                            Accompagnement Personnalisé
                        </span>
                        <div className="h-px w-12 bg-red" />
                    </div>

                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-light text-foreground mb-6">
                        Vous n&apos;avez pas trouvé<br />
                        <span className="text-red">votre bien idéal ?</span>
                    </h2>

                    <p className="max-w-xl mx-auto text-muted-foreground font-(--font-sans) text-sm leading-relaxed mb-10">
                        Nos conseillers sont à votre disposition pour vous accompagner dans votre recherche
                        et vous proposer des biens correspondant à vos critères spécifiques.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/#contact"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-red text-background font-(--font-sans) text-xs tracking-widest uppercase hover:bg-(--red-light) transition-colors"
                        >
                            <span>Contactez-nous</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <a
                            href="tel:+22527222525"
                            className="inline-flex items-center gap-3 px-8 py-4 border border-border text-foreground font-(--font-sans) text-xs tracking-widest uppercase hover:border-red hover:text-red transition-colors"
                        >
                            <span>+225 27 22 25 25</span>
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}