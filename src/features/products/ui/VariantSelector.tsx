'use client'

import { useState } from 'react'
import { Check, Minus, Plus } from 'lucide-react'

import { CloudinaryImage, EmptyState, StatusBadge } from '@/shared/ui'
import { cn } from '@/shared/lib/utils'
import { PackageOpen } from 'lucide-react'

import { PLACEHOLDER_IMAGE } from '../constants'
import type { VariantSelectorProps } from '../types'

export function VariantSelector({ variants, selectedVariantId, onSelect, ActionComponent }: VariantSelectorProps): React.ReactElement {
  const [quantities, setQuantities] = useState<Record<number, number>>(() => {
    const initial: Record<number, number> = {}
    for (const v of variants) initial[v.id] = 1
    return initial
  })

  const updateQuantity = (variantId: number, delta: number, max: number) => {
    setQuantities((prev) => {
      const current = prev[variantId] ?? 1
      const next = Math.max(1, Math.min(max, current + delta))
      return { ...prev, [variantId]: next }
    })
  }

  if (variants.length === 0) {
    return <EmptyState className="py-8" description="This product does not have an available flavor yet." icon={PackageOpen} title="No flavors available" />
  }

  return (
    <section aria-labelledby="variant-heading" className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-title-medium text-on-surface" id="variant-heading">Choose a flavor</h2>
        <span className="text-label-medium text-on-surface-variant">{variants.length} options</span>
      </div>

      <div className="grid gap-3">
        {variants.map((variant) => {
          const isSelected = variant.id === selectedVariantId
          const inStock = variant.stockQuantity > 0
          const thumbnailUrl = variant.images[0] || PLACEHOLDER_IMAGE
          const qty = quantities[variant.id] ?? 1

          return (
            <article
              className={cn(
                'overflow-hidden rounded-large border bg-surface transition-[border-color,background-color,box-shadow] duration-standard',
                isSelected ? 'border-primary bg-primary-container/40 shadow-elevation-2' : 'border-outline-variant shadow-elevation-0'
              )}
              key={variant.id}
            >
              <button
                aria-pressed={isSelected}
                className="premium-interactive flex min-h-touch w-full items-center gap-4 p-4 text-left hover:bg-primary-container/25"
                onClick={() => onSelect(variant.id)}
                type="button"
              >
                <span className="relative aspect-square h-16 shrink-0 overflow-hidden rounded-medium bg-surface-container">
                  <CloudinaryImage alt={variant.variantName} className="object-cover" fill publicId={variant.cloudinaryPublicIds?.[0] || null} sizes="64px" src={thumbnailUrl} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn('block break-words text-title-small', isSelected ? 'text-primary' : 'text-on-surface')}>{variant.variantName}</span>
                  <span className="mt-2 block"><StatusBadge tone={inStock ? 'success' : 'destructive'}>{inStock ? `${variant.stockQuantity} in stock` : 'Out of stock'}</StatusBadge></span>
                </span>
                <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full border', isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-outline bg-surface')} aria-hidden="true">
                  {isSelected ? <Check className="h-4 w-4" /> : null}
                </span>
              </button>

              {inStock && isSelected && ActionComponent && (
                <div className="animate-refined-reveal flex flex-col gap-3 border-t border-outline-variant p-4 medium:flex-row medium:items-center">
                  <div aria-label={`Quantity for ${variant.variantName}`} className="quantity-control" role="group">
                    <button
                      aria-label={`Decrease ${variant.variantName} quantity`}
                      className="quantity-control-button"
                      disabled={qty <= 1}
                      onClick={(event) => {
                        event.stopPropagation()
                        updateQuantity(variant.id, -1, variant.stockQuantity)
                      }}
                      type="button"
                    >
                      <Minus aria-hidden="true" className="h-5 w-5" />
                    </button>
                    <span aria-live="polite" className="quantity-control-value">{qty}</span>
                    <button
                      aria-label={`Increase ${variant.variantName} quantity`}
                      className="quantity-control-button"
                      disabled={qty >= variant.stockQuantity}
                      onClick={(event) => {
                        event.stopPropagation()
                        updateQuantity(variant.id, 1, variant.stockQuantity)
                      }}
                      type="button"
                    >
                      <Plus aria-hidden="true" className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex-1"><ActionComponent quantity={qty} stockQuantity={variant.stockQuantity} variantId={variant.id} /></div>
                </div>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
