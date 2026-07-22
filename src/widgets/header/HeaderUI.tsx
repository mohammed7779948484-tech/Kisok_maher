'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { CartButton } from '@/features/cart/ui/CartButton'
import { CartDrawer } from '@/features/cart/ui/CartDrawer'
import type { CartItemData } from '@/features/cart/types'
import { BrandLogo } from '@/shared/ui'
import { brandConfig } from '@/shared/config'

import { MobileNav } from './MobileNav'

interface HeaderUIProps {
  cartItemCount: number
  cartItems: CartItemData[]
}

const NAV_LINKS = [
  { href: '/products', label: 'Products' },
  { href: '/brands', label: 'Brands' },
  { href: '/categories', label: 'Categories' },
  { href: '/track-order', label: 'Track Order' },
] as const

export function HeaderUI({ cartItemCount, cartItems }: HeaderUIProps): React.ReactElement {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b border-outline-variant/80 bg-surface/90 shadow-elevation-1 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-4 medium:px-6 expanded:px-8">
        <Link
          aria-label={`${brandConfig.displayName} home`}
          className="inline-flex min-h-touch items-center rounded-medium px-1 transition-colors duration-fast hover:bg-surface-container"
          href="/"
        >
          <BrandLogo iconClassName="h-9 w-9" />
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-1 medium:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)

            return (
              <Link
                aria-current={isActive ? 'page' : undefined}
                className={`premium-interactive inline-flex min-h-touch items-center rounded-medium px-4 text-label-large ${isActive ? 'bg-primary-container text-primary-container-foreground shadow-elevation-1' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <CartButton itemCount={cartItemCount} />
          <MobileNav />
        </div>
      </div>

      <CartDrawer items={cartItems} />
    </header>
  )
}
