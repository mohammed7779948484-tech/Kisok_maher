import Link from 'next/link'

import { CloudinaryImage } from '@/shared/ui'

import { PLACEHOLDER_IMAGE } from '../constants'
import type { BrandCardProps } from '../types'

export function BrandCard({ brand }: BrandCardProps): React.ReactElement {
  const { name, slug, logoUrl } = brand

  return (
    <Link
      className="premium-interactive group flex h-full min-h-40 w-full flex-col items-center justify-center gap-4 rounded-large border border-outline-variant bg-surface p-5 text-center shadow-elevation-1 hover:border-primary/50 hover:shadow-elevation-3"
      href={`/brands/${slug}`}
    >
      <div className="relative h-20 w-20 overflow-hidden rounded-medium bg-surface-container">
        <CloudinaryImage alt={name} className="object-contain p-2" fill publicId={brand.cloudinaryPublicId} sizes="80px" src={logoUrl || PLACEHOLDER_IMAGE} />
      </div>
      <h3 className="text-title-small text-on-surface transition-colors duration-fast group-hover:text-primary">{name}</h3>
    </Link>
  )
}
