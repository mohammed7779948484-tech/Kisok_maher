/**
 * Gate Layout
 *
 * Minimal layout for the password entry page.
 * Does not include storefront Header or Footer.
 */

import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'

import '../globals.css'
import { Providers } from '../providers'
import { brandConfig } from '@/shared/config'

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
})

export const metadata: Metadata = {
    title: `Enter Password | ${brandConfig.displayName}`,
    description: brandConfig.description,
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
}

export default function GateLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>): React.ReactElement {
    return (
        <html lang="en" className={inter.variable}>
            <body className="min-h-screen bg-background font-sans text-on-surface">
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    )
}
