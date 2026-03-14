/* eslint-disable @next/next/no-img-element */
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, Phone, Mail } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
    { name: "Accueil", href: "/" },
    { name: "À Propos", href: "/a-propos" },
    { name: "Services", href: "/services" },
    { name: "Nos Biens", href: "/biens" },
    { name: "Contact", href: "/contact" },
    { name: "Dossiers", href: "/dossier" },
]

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
                isScrolled
                    ? "bg-background/95 backdrop-blur-md border-b border-border"
                    : "bg-transparent"
            )}
        >
            {/* Top Bar */}
            <div className={cn(
                "border-b border-border/30 transition-all duration-300",
                isScrolled ? "h-0 opacity-0 overflow-hidden" : "h-auto opacity-100"
            )}>
                <div className="container mx-auto px-6 py-2 flex justify-between items-center text-sm">
                    <div className="flex items-center gap-6">
                        <a
                            href="tel:+22522429876"
                            className="flex items-center gap-2 text-foreground hover:text-red transition-colors"
                        >
                            <Phone className="w-3 h-3" />
                            <span className="font-(--font-sans)  text-xs tracking-wider">+225 22 42 98 76</span>
                        </a>
                        <a
                            href="mailto:contact@binkoassocies.com"
                            className="hidden sm:flex items-center gap-2 text-foreground hover:text-red transition-colors"
                        >
                            <Mail className="w-3 h-3" />
                            <span className="font-(--font-sans)  text-xs tracking-wider">contact@binkoassocies.com</span>
                        </a>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            href="#"
                            className="text-foreground hover:text-red transition-colors font-(--font-sans)  text-xs tracking-wider uppercase"
                        >
                            Espace Membre
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Navigation */}
            <nav className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3">
                        <div className="flex flex-col">
                            <div className="w-30 h-20">
                                <img src="/logo0.png" alt="logo" />
                            </div>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-8">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="font-(--font-sans)  text-sm tracking-wider uppercase text-foreground hover:text-red transition-colors duration-300"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* CTA Button */}
                    <div className="hidden lg:block">
                        <Link
                            href="/biens"
                            className="px-6 py-3 bg-red text-primary-foreground font-(--font-sans)  text-xs tracking-widest uppercase hover:bg-red/90 transition-all duration-300"
                        >
                            Rechercher un bien
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        type="button"
                        className="lg:hidden text-foreground hover:text-red transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                <div
                    className={cn(
                        "lg:hidden overflow-hidden transition-all duration-500",
                        isMobileMenuOpen ? "max-h-96 opacity-100 mt-6" : "max-h-0 opacity-0"
                    )}
                >
                    <div className="flex flex-col gap-4 pb-6 border-t border-border pt-6">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="font-(--font-sans)  text-sm tracking-wider uppercase text-muted-foreground hover:text-red transition-colors"
                            >
                                {item.name}
                            </Link>
                        ))}
                        <Link
                            href="/biens"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="mt-4 px-6 py-3 bg-red text-primary-foreground font-(--font-sans)  text-xs tracking-widest uppercase text-center hover:bg-red/90 transition-all"
                        >
                            Rechercher un bien
                        </Link>
                    </div>
                </div>
            </nav>
        </header>
    )
}
