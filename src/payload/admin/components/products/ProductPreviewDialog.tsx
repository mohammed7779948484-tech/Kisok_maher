'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { Eye, PackageOpen, X } from 'lucide-react'
import React from 'react'

import type { ProductListItemDTO } from '../../types'
import { AdminImage } from '../shared/AdminImage'
import { StatusBadge } from '../shared/StatusBadge'

/**
 * Adapted from Maher/app/(admin)/dashboard/products/_components/product-preview-dialog.tsx.
 * It deliberately uses a Payload DTO and never renders internal prices.
 */
export function ProductPreviewDialog({
  onOpenChange,
  open,
  product,
}: {
  onOpenChange: (open: boolean) => void
  open: boolean
  product: ProductListItemDTO | null
}): React.ReactElement | null {
  if (!product) return null

  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="dragon-drawer-overlay" />
        <Dialog.Content className="dragon-preview-dialog">
          <header className="dragon-preview-dialog__header"><div><p className="dragon-muted m-0 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide"><Eye aria-hidden="true" size={14} />Storefront preview</p><Dialog.Title className="mb-0 mt-2 text-xl font-semibold">{product.name}</Dialog.Title><Dialog.Description className="dragon-muted mb-0 mt-1 text-sm">Preview of customer-safe product and flavor information.</Dialog.Description></div><Dialog.Close aria-label="Close preview" className="dragon-icon-button"><X aria-hidden="true" size={18} /></Dialog.Close></header>
          <div className="dragon-preview-dialog__content">
            <section className="dragon-preview-hero"><AdminImage className="h-36 w-36 rounded-2xl" fallback={product.name} media={product.image} size={144} /><div className="min-w-0"><p className="dragon-muted m-0 text-sm">{product.brand?.name ?? 'kisok catalog'}</p><h2 className="mb-0 mt-2 text-3xl font-bold">{product.name}</h2><div className="mt-3 flex flex-wrap gap-2">{product.categories.map((category) => <span className="dragon-badge" key={String(category.id)}>{category.name}</span>)}<StatusBadge status={product.isActive ? 'active' : 'inactive'} /></div><p className="dragon-muted mb-0 mt-4 text-sm">{product.variants.length} flavors available · {product.totalStock} units in inventory</p></div></section>
            <section><div className="mb-3 flex items-end justify-between gap-4"><div><h3 className="m-0 text-base font-semibold">Choose a flavor</h3><p className="dragon-muted mb-0 mt-1 text-sm">Only storefront-safe information is shown.</p></div></div>{product.variants.length ? <div className="dragon-preview-flavors">{product.variants.map((variant) => <article className="dragon-preview-flavor" key={String(variant.id)}><AdminImage className="h-14 w-14" fallback={variant.name} media={variant.image ?? product.image} size={56} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h4 className="m-0 truncate text-sm font-semibold">{variant.name}</h4>{variant.optionValue ? <span className="dragon-badge">{variant.optionValue}</span> : null}</div><p className="dragon-muted mb-0 mt-1 text-xs">{variant.stockQuantity > 0 ? `${variant.stockQuantity} available` : 'Currently unavailable'}</p></div><StatusBadge status={variant.stockQuantity === 0 ? 'out-of-stock' : variant.stockQuantity <= 5 ? 'low-stock' : 'in-stock'} /></article>)}</div> : <div className="dragon-empty min-h-40"><PackageOpen aria-hidden="true" size={28} /><p className="m-0 font-medium">No flavors available</p></div>}</section>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
