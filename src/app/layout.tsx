import React from "react"
import type { Metadata } from 'next'
import { Cormorant_Garamond, Montserrat } from 'next/font/google'
import './globals.css'
import ClientBody from "./ClientBody";


const cormorant = Cormorant_Garamond({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-serif"
});

const montserrat = Montserrat({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600"],
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
                <ClientBody>{children}</ClientBody>
            </body>
        </html>
    )
}
