"use client"

import Link from "next/link"
import { Facebook, Instagram, Linkedin, Twitter, Mail, Phone, MapPin, ArrowUp } from "lucide-react"

const quickLinks = [
    { name: "Accueil", href: "#accueil" },
    { name: "À Propos", href: "#apropos" },
    { name: "Services", href: "#services" },
    { name: "Nos Biens", href: "#biens" },
    { name: "Contact", href: "#contact" },
]

const services = [
    { name: "Location", href: "#" },
    { name: "Vente", href: "#" },
    { name: "Gestion Locative", href: "#" },
    { name: "Résidence Meublée", href: "#" },
    { name: "Conseil Immobilier", href: "#" },
]

const locations = [
    "Cocody - Angré",
    "Cocody - Riviera",
    "Yopougon",
    "Koumassi",
    "Bouaké"
]

export function Footer() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    return (
        <footer className="bg-card border-t border-border">
            {/* Main Footer */}
            <div className="container mx-auto px-6 py-16 md:py-20">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand Column */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="inline-block mb-6">
                            <div className="flex flex-col">
                                <span className="text-3xl font-serif font-semibold tracking-wide text-foreground">
                                    BINKO
                                </span>
                                <span className="text-red text-xs tracking-[0.3em] font-(--font-sans)  uppercase">
                                    & Associés
                                </span>
                            </div>
                        </Link>
                        <p className="text-muted-foreground font-(--font-sans)  text-sm leading-relaxed mb-6">
                            Votre partenaire privilégié pour l&apos;administration de biens immobiliers
                            de prestige à Abidjan et en Côte d&apos;Ivoire depuis 2008.
                        </p>

                        {/* Social Links */}
                        <div className="flex gap-4">
                            <a
                                href="#"
                                className="w-10 h-10 border border-border flex items-center justify-center text-muted-foreground hover:border-red hover:text-red transition-all duration-300"
                                aria-label="Facebook"
                            >
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 border border-border flex items-center justify-center text-muted-foreground hover:border-red hover:text-red transition-all duration-300"
                                aria-label="Instagram"
                            >
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 border border-border flex items-center justify-center text-muted-foreground hover:border-red hover:text-red transition-all duration-300"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="w-4 h-4" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 border border-border flex items-center justify-center text-muted-foreground hover:border-red hover:text-red transition-all duration-300"
                                aria-label="Twitter"
                            >
                                <Twitter className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-foreground font-serif text-lg mb-6">Liens Rapides</h4>
                        <ul className="space-y-3">
                            {quickLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-muted-foreground font-(--font-sans)  text-sm hover:text-red transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="text-foreground font-serif text-lg mb-6">Nos Services</h4>
                        <ul className="space-y-3">
                            {services.map((service) => (
                                <li key={service.name}>
                                    <Link
                                        href={service.href}
                                        className="text-muted-foreground font-(--font-sans)  text-sm hover:text-red transition-colors"
                                    >
                                        {service.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-foreground font-serif text-lg mb-6">Contact</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-red mt-1 shrink-0" />
                                <span className="text-muted-foreground font-(--font-sans)  text-sm">
                                    Cocody-Angré Boulevard Latrille<br />
                                    Abidjan, Côte d&apos;Ivoire
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-red shrink-0" />
                                <a
                                    href="tel:+22522429876"
                                    className="text-muted-foreground font-(--font-sans)  text-sm hover:text-red transition-colors"
                                >
                                    +225 22 42 98 76
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-red shrink-0" />
                                <a
                                    href="mailto:contact@binkoassocies.com"
                                    className="text-muted-foreground font-(--font-sans)  text-sm hover:text-red transition-colors"
                                >
                                    contact@binkoassocies.com
                                </a>
                            </li>
                        </ul>

                        {/* Locations Tags */}
                        <div className="mt-6 pt-6 border-t border-border">
                            <h5 className="text-foreground font-(--font-sans)  text-xs tracking-wider uppercase mb-3">
                                Nos Zones
                            </h5>
                            <div className="flex flex-wrap gap-2">
                                {locations.map((loc) => (
                                    <span
                                        key={loc}
                                        className="px-2 py-1 bg-background text-muted-foreground font-(--font-sans)  text-xs"
                                    >
                                        {loc}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-border">
                <div className="container mx-auto px-6 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-muted-foreground font-(--font-sans)  text-sm text-center md:text-left">
                            © {new Date().getFullYear()} Binko & Associés. Tous droits réservés.
                        </p>

                        <div className="flex items-center gap-6">
                            <Link
                                href="#"
                                className="text-muted-foreground font-(--font-sans)  text-xs hover:text-red transition-colors"
                            >
                                Politique de confidentialité
                            </Link>
                            <Link
                                href="#"
                                className="text-muted-foreground font-(--font-sans)  text-xs hover:text-red transition-colors"
                            >
                                Mentions légales
                            </Link>
                            <button
                                type="button"
                                onClick={scrollToTop}
                                className="w-10 h-10 border border-border flex items-center justify-center text-muted-foreground hover:border-red hover:text-red transition-all duration-300"
                                aria-label="Retour en haut"
                            >
                                <ArrowUp className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
