"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function CTASection() {
    return (
        <section className="py-24 md:py-32 bg-card relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop')",
                    }}
                />
                <div className="absolute inset-0 bg-white/60" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Decorative */}
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <div className="h-px w-16 bg-red" />
                        <div className="w-3 h-3 border border-red rotate-45" />
                        <div className="h-px w-16 bg-red" />
                    </div>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light tracking-wide text-foreground mb-6">
                        Souhaitez-vous Publier<br />
                        <span className="text-red">Vos Biens?</span>
                    </h2>

                    <p className="text-xl text-foreground font-(--font-sans)  leading-relaxed mb-12 max-w-2xl mx-auto">
                        Confiez-nous vos biens immobiliers et bénéficiez de notre expertise
                        pour une gestion optimale et une visibilité maximale.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="#contact"
                            className="px-8 py-4 bg-red text-primary-foreground font-(--font-sans)  text-xs tracking-widest uppercase flex items-center gap-2 hover:bg-red/90 transition-all duration-300"
                        >
                            <span>Contactez-nous</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="tel:+22522429876"
                            className="px-8 py-4 border border-foreground/30 text-foreground font-(--font-sans)  text-xs tracking-widest uppercase hover:border-red hover:text-red transition-all duration-300"
                        >
                            +225 22 42 98 76
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
