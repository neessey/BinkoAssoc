"use client"

import { Building2, Users, Award, Shield } from "lucide-react"

const features = [
    {
        icon: Building2,
        title: "Gestion Locative",
        description: "Administration complète de vos biens immobiliers avec un suivi rigoureux et professionnel."
    },
    {
        icon: Users,
        title: "Accompagnement Personnalisé",
        description: "Une équipe dédiée à votre service pour répondre à tous vos besoins immobiliers."
    },
    {
        icon: Award,
        title: "Expertise Reconnue",
        description: "Plus de 15 ans d'expérience dans le secteur immobilier ivoirien."
    },
    {
        icon: Shield,
        title: "Confiance & Sécurité",
        description: "Vos investissements sont entre de bonnes mains avec notre gestion transparente."
    }
]

export function AboutSection() {
    return (
        <section id="apropos" className="py-24 md:py-32 bg-card">
            <div className="container mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Content */}
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-px w-12 bg-red" />
                            <span className="text-red font-(--font-sans) text-xs tracking-[0.3em] uppercase">
                                Qui sommes-nous
                            </span>
                        </div>

                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light tracking-wide text-foreground mb-8">
                            L&apos;Art de<br />
                            <span className="text-red">l&apos;Immobilier</span>
                        </h2>

                        <div className="space-y-6 text-foreground font-(--font-sans)leading-relaxed">
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
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-8 mt-12 pt-12 border-t border-border">
                            <div className="text-center">
                                <div className="text-4xl md:text-5xl font-serif text-red mb-2">15+</div>
                                <div className="text-foreground font-(--font-sans) text-xs tracking-wider uppercase">
                                    Années d&apos;expérience
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl md:text-5xl font-serif text-red mb-2">500+</div>
                                <div className="text-foreground font-(--font-sans) text-xs tracking-wider uppercase">
                                    Biens gérés
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl md:text-5xl font-serif text-red mb-2">98%</div>
                                <div className="text-foreground font-(--font-sans) text-xs tracking-wider uppercase">
                                    Clients satisfaits
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Image Grid */}
                    <div className="relative w-full">
                        <div className="grid grid-cols-2 gap-4 w-full">
                            <div className="space-y-4">
                                <div
                                    className="aspect-[3/4] bg-cover bg-center"
                                    style={{
                                        backgroundImage: "url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop')"
                                    }}
                                />
                                <div
                                    className="aspect-square bg-cover bg-center"
                                    style={{
                                        backgroundImage: "url('https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2070&auto=format&fit=crop')"
                                    }}
                                />
                            </div>
                            <div className="space-y-4 pt-4">
                                <div
                                    className="aspect-square bg-cover bg-center"
                                    style={{
                                        backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop')"
                                    }}
                                />
                                <div
                                    className="aspect-[3/4] bg-cover bg-center"
                                    style={{
                                        backgroundImage: "url('https://images.unsplash.com/photo-1600573472550-8090b5e0745e?q=80&w=2070&auto=format&fit=crop')"
                                    }}
                                />
                            </div>
                        </div>


                        {/* Floating Badge */}
                        <div className="absolute -bottom-6 -left-6 bg-red text-primary-foreground p-6 shadow-2xl">
                            <div className="text-3xl font-serif font-semibold">2014</div>
                            <div className="text-xs font-(--font-sans) tracking-wider uppercase">Fondée à Abidjan</div>
                        </div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-24">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group p-8 border border-border hover:border-red transition-all duration-500"
                        >
                            <feature.icon className="w-10 h-10 text-red mb-6 group-hover:scale-110 transition-transform duration-300" />
                            <h3 className="text-xl font-serif text-foreground mb-3">{feature.title}</h3>
                            <p className="text-foreground font-(--font-sans) text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
