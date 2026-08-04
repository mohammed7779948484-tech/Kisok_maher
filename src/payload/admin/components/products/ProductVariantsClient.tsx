'use client'

import { PackageOpen, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState, useTransition } from 'react'
import { toast } from '@payloadcms/ui'

import type { ProductVariantDTO, ProductVariantsViewDTO } from '../../types'
import { AdminImage } from '../shared/AdminImage'
import { StatusBadge } from '../shared/StatusBadge'
import { FlavorActionMenu } from './ProductActionMenu'
import { VariantEditorPanel } from './VariantEditorPanel'

export function ProductVariantsClient({ data }: { data: ProductVariantsViewDTO }): React.ReactElement {
  const router = useRouter()
  const [editing, setEditing] = useState<ProductVariantDTO | null>(null)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPending, startTransition] = useTransition()

  function openEditor(variant: ProductVariantDTO | null): void {
    setEditing(variant)
    setError(null)
    setOpen(true)
  }

  function refresh(): void {
    startTransition(() => router.refresh())
  }

  async function deleteVariant(variant: ProductVariantDTO): Promise<void> {
    if (!window.confirm(`Delete flavor “${variant.name}”? This cannot be undone.`)) return
    setError(null)
    setIsDeleting(true)
    const response = await fetch(`/api/product_variants/${variant.id}`, { method: 'DELETE' })
    setIsDeleting(false)
    if (!response.ok) {
      const message = 'This flavor could not be deleted. Your role may not allow deletion or it may be referenced by an order.'
      setError(message)
      toast.error('Flavor was not deleted', { description: message })
      return
    }
    toast.success('Flavor deleted', { description: variant.name })
    refresh()
  }

  return (
    <main className="dragon-admin relative">
      {isPending || isDeleting ? <div className="dragon-loading" role="status">{isDeleting ? 'Deleting flavor…' : 'Refreshing flavors…'}</div> : null}
      <header className="dragon-page-header">
        <div><p className="dragon-muted mb-1 text-sm font-medium">{data.productName}</p><h1 className="dragon-page-title">Flavors &amp; inventory</h1><p className="dragon-page-description mt-2">Manage flavors, SKUs, optional internal prices, images, visibility, and stock as part of this product.</p></div>
        {data.canCreate ? <button className="dragon-button dragon-button--primary" onClick={() => openEditor(null)} type="button"><Plus aria-hidden="true" size={18} />Add flavor</button> : null}
      </header>

      <VariantEditorPanel canReadPrice={data.canReadPrice} media={data.media} onClose={() => setOpen(false)} onSaved={refresh} open={open} productID={data.productID} productName={data.productName} variant={editing} />

      {error ? <p className="m-0 rounded-lg border p-3 text-sm dragon-badge--danger" role="alert">{error}</p> : null}

      {data.variants.length ? <div className="dragon-table-wrap"><table className="dragon-table"><thead><tr><th>Flavor</th><th>SKU</th>{data.canReadPrice ? <th>Internal price</th> : null}<th>Stock</th><th>Sort</th><th>Status</th><th className="text-right">Actions</th></tr></thead><tbody>{data.variants.map((variant) => <tr className="dragon-row" key={String(variant.id)}><td><div className="flex items-center gap-3"><AdminImage className="h-11 w-11" fallback={variant.name} media={variant.image} /><span className="font-medium">{variant.name}</span>{variant.optionValue ? <span className="dragon-badge">{variant.optionValue}</span> : null}</div></td><td className="font-mono text-xs">{variant.sku}</td>{data.canReadPrice ? <td>{variant.price === null ? <span className="dragon-muted">Not set</span> : variant.price.toFixed(2)}</td> : null}<td><StatusBadge label={`${variant.stockQuantity} units`} status={variant.stockQuantity === 0 ? 'out-of-stock' : variant.stockQuantity <= 5 ? 'low-stock' : 'in-stock'} /></td><td>{variant.sortOrder}</td><td><StatusBadge status={variant.isActive ? 'active' : 'inactive'} /></td><td><div className="flex justify-end">{data.canUpdate || data.canDelete ? <FlavorActionMenu canDelete={data.canDelete} canUpdate={data.canUpdate} onDelete={() => void deleteVariant(variant)} onEdit={() => openEditor(variant)} variant={variant} /> : null}</div></td></tr>)}</tbody></table></div> : <div className="dragon-empty"><PackageOpen aria-hidden="true" size={30} /><p className="m-0 font-semibold">No flavors yet</p><p className="dragon-muted m-0 text-sm">Add the first flavor or option for this product.</p>{data.canCreate ? <button className="dragon-button dragon-button--primary mt-2" onClick={() => openEditor(null)} type="button"><Plus aria-hidden="true" size={17} />Add flavor</button> : null}</div>}
    </main>
  )
}
