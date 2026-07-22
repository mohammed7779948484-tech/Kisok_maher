import Link from 'next/link'
import { Layers3 } from 'lucide-react'

import { CloudinaryImage, StatusBadge } from '@/shared/ui'

import { PLACEHOLDER_IMAGE } from '../constants'
import type { ProductCardProps } from '../types'

export function ProductCard({ product }: ProductCardProps): React.ReactElement {
  const { name, slug, imageUrl, brandName, variantCount, inStock } = product

  return (
    <Link
      className="premium-interactive group block h-full overflow-hidden rounded-large border border-outline-variant bg-surface shadow-elevation-1 hover:border-primary/50 hover:shadow-elevation-3"
      href={`/products/${slug}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-container">
        <CloudinaryImage
          alt={name}
          className="object-cover transition-transform duration-emphasized ease-emphasized group-hover:scale-[1.035] motion-reduce:transform-none"
          fill
          publicId={product.cloudinaryPublicId}
          sizes="(max-width: 719px) 100vw, (max-width: 1099px) 50vw, 25vw"
          src={imageUrl || PLACEHOLDER_IMAGE}
        />
        <div className="absolute left-3 top-3">
          <StatusBadge tone={inStock ? 'success' : 'destructive'}>
            {inStock ? 'Available' : 'Out of stock'}
          </StatusBadge>
        </div>
      </div>

      <div className="p-4">
        {brandName && <p className="mb-1 text-label-small uppercase tracking-wider text-on-surface-variant">{brandName}</p>}
        <h3 className="break-words text-title-small text-on-surface transition-colors duration-fast group-hover:text-primary">{name}</h3>
        <p className="mt-3 flex items-center gap-2 text-body-small text-on-surface-variant">
          <Layers3 aria-hidden="true" className="h-4 w-4" />
          {variantCount} {variantCount === 1 ? 'flavor' : 'flavors'}
        </p>
      </div>
    </Link>
  )
}
