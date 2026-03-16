/* eslint-disable @next/next/no-img-element */
"use client"

import { ChevronDown } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
    return (
        <section id="accueil" className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: "url('/hero.jpg')",
                    }}
                />
                <div className="absolute inset-0 bg-white/30 " />
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-6 text-center">
                <div className="max-w-4xl mx-auto">
                    {/* Decorative Line */}
                    <div className="flex items-center justify-center gap-4 mb-8 opacity-0 animate-fade-in-up">
                        <div className="h-px w-12 bg-red" />
                        <span className="text-red font-(--font-sans)  text-xs tracking-[0.4em] uppercase">
                            Immobilier de Prestige
                        </span>
                        <div className="h-px w-12 bg-red" />
                    </div>

                    {/* Main Title */}
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-light tracking-wide text-foreground mb-6 opacity-0 animate-fade-in-up animation-delay-200">
                        L&apos;Excellence<br />
                        <span className="text-red">Immobilière</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg md:text-xl font-sans text-foreground max-w-2xl mx-auto mb-12 leading-relaxed opacity-0 animate-fade-in-up animation-delay-400">
                        Votre partenaire privilégié pour l&apos;administration de biens immobiliers
                        de prestige à Abidjan et en Côte d&apos;Ivoire
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-in-up animation-delay-600">
                        <Link
                            href="#biens"
                            className="px-8 py-4 bg-red text-primary-foreground font-(--font-sans)  text-xs tracking-widest uppercase hover:bg-red/90 transition-all duration-300"
                        >
                            Découvrir nos biens
                        </Link>
                        <Link
                            href="#apropos"
                            className="px-8 py-4 border border-foreground/30 text-foreground font-(--font-sans)  text-xs tracking-widest uppercase hover:border-red hover:text-red transition-all duration-300"
                        >
                            En savoir plus
                        </Link>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0 animate-fade-in animation-delay-600">
                <span className="text-foreground font-(--font-sans)  text-xs tracking-widest uppercase">
                    Défiler
                </span>
                <ChevronDown className="w-5 h-5 text-red animate-bounce" />
            </div>

            {/* Side Decorations */}
            <div className="hidden lg:block absolute left-10 top-1/2 -translate-y-1/2">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-px h-20 bg-linear-to-b from-transparent via-red to-transparent" />
                    <span className="text-foreground font-(--font-sans)  text-xs tracking-widest transform -rotate-90 whitespace-nowrap">
                        ABIDJAN - CÔTE D&apos;IVOIRE
                    </span>
                    <div className="w-px h-20 bg-linear-to-b from-transparent via-red to-transparent" />
                </div>
            </div>
            <div className="hidden lg:block absolute right-10 bottom-10">
                <img src="/logoA.png" alt="BINKO Logo" className="w-16 h-16" />
            </div>
        </section>
    )
}
