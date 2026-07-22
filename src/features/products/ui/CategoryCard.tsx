import Link from 'next/link'

import { CloudinaryImage } from '@/shared/ui'

import { PLACEHOLDER_IMAGE } from '../constants'
import type { CategoryCardProps } from '../types'

export function CategoryCard({ category }: CategoryCardProps): React.ReactElement {
  const { name, slug, imageUrl } = category

  return (
    <Link
      className="premium-interactive group block h-full overflow-hidden rounded-large border border-outline-variant bg-surface shadow-elevation-1 hover:border-primary/50 hover:shadow-elevation-3"
      href={`/categories/${slug}`}
    >
      <div className="relative aspect-[4/3] bg-surface-container">
        <CloudinaryImage alt={name} className="object-cover transition-transform duration-emphasized ease-emphasized group-hover:scale-[1.035] motion-reduce:transform-none" fill publicId={category.cloudinaryPublicId} sizes="(max-width: 719px) 100vw, (max-width: 1099px) 50vw, 33vw" src={imageUrl || PLACEHOLDER_IMAGE} />
      </div>
      <div className="p-4"><h3 className="text-title-medium text-on-surface transition-colors duration-fast group-hover:text-primary">{name}</h3></div>
    </Link>
  )
}
