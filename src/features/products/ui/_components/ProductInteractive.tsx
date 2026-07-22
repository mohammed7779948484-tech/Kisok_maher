'use client'

import { useState } from 'react'

import { CloudinaryImage, StatusBadge } from '@/shared/ui'
import { cn } from '@/shared/lib/utils'

import { PLACEHOLDER_IMAGE } from '../../constants'
import type { CatalogVariant } from '../../types'
import { VariantSelector } from '../VariantSelector'

export interface ProductInteractiveProps {
  variants: CatalogVariant[]
  totalStock: number
  unitLabel?: string
  imageUrl?: string | null
  cloudinaryPublicId?: string | null
  productName: string
  brandName?: string | null
  description?: string | null
  ActionComponent?: React.ComponentType<{ variantId: number; stockQuantity: number; quantity: number }> | undefined
}

export function ProductInteractive({ variants, totalStock, unitLabel, imageUrl, cloudinaryPublicId, productName, brandName, description, ActionComponent }: ProductInteractiveProps): React.ReactElement {
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(variants[0]?.id ?? null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const selectedVariant = variants.find((variant) => variant.id === selectedVariantId)

  const handleVariantSelect = (variantId: number) => {
    setSelectedVariantId(variantId)
    setActiveImageIndex(0)
  }

  const galleryImages: string[] = selectedVariant && selectedVariant.images.length > 0
    ? selectedVariant.images
    : imageUrl ? [imageUrl] : [PLACEHOLDER_IMAGE]

  const galleryPublicIds: (string | null)[] = selectedVariant && selectedVariant.cloudinaryPublicIds && selectedVariant.cloudinaryPublicIds.length > 0
    ? selectedVariant.cloudinaryPublicIds
    : [cloudinaryPublicId || null]

  const displayImage = galleryImages[activeImageIndex] || galleryImages[0] || PLACEHOLDER_IMAGE
  const displayPublicId = galleryPublicIds[activeImageIndex] || galleryPublicIds[0] || null
  const displayTitle = selectedVariant ? `${productName} - ${selectedVariant.variantName}` : productName
  const displayStock = selectedVariant ? selectedVariant.stockQuantity : totalStock

  return (
    <div className="grid gap-8 medium:grid-cols-[minmax(0,1fr)_minmax(340px,0.9fr)] expanded:gap-10">
      <section aria-label="Product images" className="space-y-3">
        <div className="relative aspect-[4/3] overflow-hidden rounded-large border border-outline-variant bg-surface-container shadow-elevation-1">
          <CloudinaryImage alt={displayTitle} className="object-cover transition-opacity duration-standard" fill priority publicId={displayPublicId} sizes="(max-width: 719px) 100vw, 55vw" src={displayImage} />
        </div>

        {galleryImages.length > 1 && (
          <div aria-label="Product image gallery" className="flex gap-2 overflow-x-auto pb-2" role="group">
            {galleryImages.map((image, index) => {
              const publicId = galleryPublicIds[index] || null
              const isActive = index === activeImageIndex
              return (
                <button
                  aria-label={`View image ${index + 1} of ${displayTitle}`}
                  aria-pressed={isActive}
                  className={cn('relative h-touch w-touch shrink-0 overflow-hidden rounded-medium border-2 bg-surface', isActive ? 'border-primary ring-2 ring-focus-ring/30' : 'border-outline-variant hover:border-primary/50')}
                  key={`thumb-${index}`}
                  onClick={() => setActiveImageIndex(index)}
                  type="button"
                >
                  <CloudinaryImage alt="" className="object-cover" fill publicId={publicId} sizes="48px" src={image} />
                </button>
              )
            })}
          </div>
        )}

        {selectedVariant && <p className="text-center text-body-small text-on-surface-variant">Viewing: {selectedVariant.variantName}</p>}
      </section>

      <section className="flex flex-col gap-6" aria-labelledby="product-title">
        <div>
          {brandName && <p className="text-label-medium uppercase tracking-wider text-primary">{brandName}</p>}
          <h1 className="mt-2 text-headline-large text-on-surface" id="product-title">{displayTitle}</h1>
          <div className="mt-4"><StatusBadge tone={displayStock > 0 ? 'success' : 'destructive'}>{displayStock > 0 ? `In stock (${displayStock} ${unitLabel}s)` : 'Out of stock'}</StatusBadge></div>
        </div>

        {variants.length > 0 && (
          <VariantSelector ActionComponent={ActionComponent} onSelect={handleVariantSelect} selectedVariantId={selectedVariantId} variants={variants} />
        )}

        {description && (
          <div className="border-t border-outline-variant pt-6">
            <h2 className="mb-3 text-title-medium text-on-surface">Description</h2>
            <div className="customer-rich-text">{typeof description === 'string' ? <p>{description}</p> : <p>See full details above.</p>}</div>
          </div>
        )}
      </section>
    </div>
  )
}
