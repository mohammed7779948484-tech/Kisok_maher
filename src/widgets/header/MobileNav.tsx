'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'

import { BrandLogo, Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/shared/ui'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/brands', label: 'Brands' },
  { href: '/categories', label: 'Categories' },
  { href: '/track-order', label: 'Track Order' },
] as const

export function MobileNav(): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetTrigger asChild>
        <button
          aria-label="Open menu"
          className="flex h-icon-button w-icon-button items-center justify-center rounded-medium border border-outline text-on-surface-variant transition-colors duration-fast hover:bg-surface-container hover:text-on-surface medium:hidden"
          type="button"
        >
          <Menu aria-hidden="true" className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent className="flex flex-col" side="left">
        <SheetHeader className="mb-6">
          <SheetTitle><BrandLogo /></SheetTitle>
          <SheetDescription>Browse the in-store catalog or track an order.</SheetDescription>
        </SheetHeader>

        <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              aria-current={pathname === link.href || (link.href !== '/' && pathname.startsWith(`${link.href}/`)) ? 'page' : undefined}
              className={`premium-interactive flex min-h-touch items-center rounded-medium px-4 text-title-small ${pathname === link.href || (link.href !== '/' && pathname.startsWith(`${link.href}/`)) ? 'bg-primary-container text-primary-container-foreground shadow-elevation-1' : 'text-on-surface hover:bg-surface-container'}`}
              href={link.href}
              key={link.href}
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
