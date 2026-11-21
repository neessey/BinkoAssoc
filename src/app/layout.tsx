import React from "react"
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import ClientBody from "./ClientBody";
import { Providers } from "./providers";

// Polices hébergées dans le projet (versions variables, sous-ensemble latin) :
// le build ne dépend plus de Google Fonts, dont les échecs réseau cassaient le déploiement.
const cormorant = localFont({
    src: "./fonts/cormorant-garamond-latin-wght-normal.woff2",
    weight: "300 700",
    style: "normal",
    display: "swap",
    variable: "--font-serif"
});

const montserrat = localFont({
    src: "./fonts/montserrat-latin-wght-normal.woff2",
    weight: "300 600",
    style: "normal",
    display: "swap",
    variable: "--font-sans"
});

export const metadata: Metadata = {
    title: 'Binko & Associés | Immobilier de Prestige en Côte d\'Ivoire',
    description: 'Binko & Associés - Votre partenaire privilégié pour l\'administration de biens immobiliers de prestige à Abidjan et en Côte d\'Ivoire. Location, vente et gestion de patrimoine.',
    generator: 'v0.app',
    keywords: ['immobilier', 'Abidjan', 'Côte d\'Ivoire', 'location', 'vente', 'appartement', 'villa', 'Cocody', 'prestige'],
    icons: {
        icon: [
            {
                url: '/icon-light-32x32.png',
                media: '(prefers-color-scheme: light)',
            },
            {
                url: '/icon-dark-32x32.png',
                media: '(prefers-color-scheme: dark)',
            },
            {
                url: '/icon.svg',
                type: 'image/svg+xml',
            },
        ],
        apple: '/apple-icon.png',
    },
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="fr">
            <body className={`${cormorant.variable} ${montserrat.variable} font-sans antialiased`}>
                <Providers>
                    <ClientBody>{children}</ClientBody>
                </Providers>
            </body>
        </html>
    )
}
