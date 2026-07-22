import Link from 'next/link'

import { brandConfig } from '@/shared/config'
import { BrandLogo } from '@/shared/ui'

export function Footer(): React.ReactElement {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-outline-variant bg-surface">
      <div className="mx-auto grid max-w-content gap-8 px-4 py-10 medium:grid-cols-3 medium:px-6 expanded:px-8">
        <div>
          <BrandLogo />
          <p className="mt-4 max-w-sm text-body-medium text-on-surface-variant">{brandConfig.description}.</p>
        </div>

        <nav aria-label="Catalog links">
          <h2 className="text-title-small text-on-surface">Browse</h2>
          <ul className="mt-3 space-y-1">
            <li><Link className="inline-flex min-h-touch items-center text-body-medium text-on-surface-variant hover:text-primary" href="/products">All Products</Link></li>
            <li><Link className="inline-flex min-h-touch items-center text-body-medium text-on-surface-variant hover:text-primary" href="/brands">Brands</Link></li>
            <li><Link className="inline-flex min-h-touch items-center text-body-medium text-on-surface-variant hover:text-primary" href="/categories">Categories</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className="text-title-small text-on-surface">Order support</h2>
          <Link className="mt-3 inline-flex min-h-touch items-center text-label-large text-primary hover:underline" href="/track-order">Track an order</Link>
          <p className="text-body-small text-on-surface-variant">Keep the order number shown after confirmation.</p>
        </div>
      </div>
      <div className="border-t border-outline-variant px-4 py-5 text-center text-body-small text-on-surface-variant">
        © {currentYear} {brandConfig.displayName}. All rights reserved.
      </div>
    </footer>
  )
}
