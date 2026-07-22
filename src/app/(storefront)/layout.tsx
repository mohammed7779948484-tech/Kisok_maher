/**
 * Storefront Layout
 *
 * Main layout for the public storefront.
 * Includes Header and Footer.
 * Verifies session via DAL (NOT middleware).
 */

import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { redirect } from 'next/navigation'

import '../globals.css'
import { Providers } from '../providers'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'
import { verifySession } from '@/core/auth/session'
import { brandConfig } from '@/shared/config'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: `${brandConfig.displayName} — In-store catalog`,
  description: brandConfig.description,
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default async function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>): Promise<React.ReactElement> {
  // Security: Verify session via DAL
  const session = await verifySession()
  if (!session) {
    redirect('/gate')
  }

  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans text-on-surface antialiased">
        <Providers>
          <a className="fixed left-4 top-4 z-50 -translate-y-24 rounded-medium bg-primary px-4 py-3 text-label-large text-primary-foreground shadow-elevation-3 transition-transform duration-fast focus:translate-y-0" href="#main-content">
            Skip to content
          </a>
          <Header />
          <main className="min-h-[calc(100vh-4rem)]" id="main-content">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
