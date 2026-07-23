'use client'

import { Check, ImageIcon, Package, Save } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import { toast } from '@payloadcms/ui'

import type { AdminEntityID, AdminMediaDTO, ProductVariantDTO } from '../../types'
import { AdminDrawer } from '../shared/AdminDrawer'
import { AdminImage } from '../shared/AdminImage'

interface VariantEditorDrawerProps {
  canReadPrice: boolean
  media: AdminMediaDTO[]
  onClose: () => void
  onSaved: () => void
  open: boolean
  productID: AdminEntityID | null
  productName: string
  variant: ProductVariantDTO | null
}

interface VariantFormState {
  imageID: string
  isActive: boolean
  name: string
  optionValue: string
  price: string
  sku: string
  sortOrder: string
  stockQuantity: string
}

const EMPTY_FORM: VariantFormState = {
  imageID: '',
  isActive: true,
  name: '',
  optionValue: '',
  price: '',
  sku: '',
  sortOrder: '0',
  stockQuantity: '0',
}

function getFormState(variant: ProductVariantDTO | null): VariantFormState {
  if (!variant) return EMPTY_FORM
  return {
    imageID: variant.image ? String(variant.image.id) : '',
    isActive: variant.isActive,
    name: variant.name,
    optionValue: variant.optionValue,
    price: variant.price === null ? '' : String(variant.price),
    sku: variant.sku,
    sortOrder: String(variant.sortOrder),
    stockQuantity: String(variant.stockQuantity),
  }
}

export function VariantEditorDrawer({
  canReadPrice,
  media,
  onClose,
  onSaved,
  open,
  productID,
  productName,
  variant,
}: VariantEditorDrawerProps): React.ReactElement {
  const [form, setForm] = useState<VariantFormState>(() => getFormState(variant))
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const selectedMedia = useMemo(
    () => media.find((item) => String(item.id) === form.imageID) ?? null,
    [form.imageID, media],
  )

  useEffect(() => {
    if (!open) return
    setForm(getFormState(variant))
    setError(null)
  }, [open, variant])

  async function saveVariant(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    if (isSaving || productID === null) return

    const price = form.price.trim() === '' ? null : Number(form.price)
    const stockQuantity = Number(form.stockQuantity)
    const sortOrder = Number(form.sortOrder)
    if ((canReadPrice && price !== null && (!Number.isFinite(price) || price < 0)) || !Number.isInteger(stockQuantity) || stockQuantity < 0 || !Number.isInteger(sortOrder) || sortOrder < 0) {
      setError('Check price, stock, and sort order. Stock and sort order must be whole numbers of zero or more.')
      toast.error('Check the inventory values')
      return
    }

    setError(null)
    setIsSaving(true)
    const body: Record<string, unknown> = {
      images: selectedMedia ? [{ image: selectedMedia.id }] : [],
      is_active: form.isActive,
      option_value: form.optionValue.trim() || null,
      product: productID,
      sku: form.sku.trim(),
      sort_order: sortOrder,
      stock_quantity: stockQuantity,
      variant_name: form.name.trim(),
    }
    if (canReadPrice) body.price = price

    try {
      const response = await fetch(variant ? `/api/product_variants/${variant.id}` : '/api/product_variants', {
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
        method: variant ? 'PATCH' : 'POST',
      })

      if (!response.ok) {
        const result = await response.json().catch(() => null) as { errors?: Array<{ message?: string }> } | null
        const message = result?.errors?.[0]?.message ?? 'Payload could not save this flavor. Check the SKU and required fields, then try again.'
        setError(message)
        toast.error('Flavor was not saved', { description: message })
        return
      }

      toast.success(variant ? 'Flavor updated' : 'Flavor created', { description: form.name.trim() })
      onClose()
      onSaved()
    } catch {
      const message = 'The flavor could not be saved because the server could not be reached. Try again.'
      setError(message)
      toast.error('Flavor was not saved', { description: message })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AdminDrawer
      description={`Manage inventory for ${productName || 'this product'} without leaving the products workspace.`}
      onOpenChange={(nextOpen) => { if (!nextOpen && !isSaving) onClose() }}
      open={open}
      title={variant ? 'Edit flavor' : 'Add flavor'}
    >
      <form className="grid gap-6" onSubmit={(event) => void saveVariant(event)}>
        <section className="dragon-form-section">
          <div className="dragon-form-section__title"><Package aria-hidden="true" size={17} /><span>Flavor details</span></div>
          <div className="grid gap-4">
            <label><span className="dragon-label">Flavor name</span><input autoFocus className="dragon-control" onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Strawberry Ice" required value={form.name} /></label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label><span className="dragon-label">SKU</span><input className="dragon-control" onChange={(event) => setForm({ ...form, sku: event.target.value })} placeholder="SKU-001" required value={form.sku} /></label>
              <label><span className="dragon-label">Option label <span className="dragon-muted">(optional)</span></span><input className="dragon-control" onChange={(event) => setForm({ ...form, optionValue: event.target.value })} placeholder="e.g. 50mg" value={form.optionValue} /></label>
            </div>
          </div>
        </section>

        <section className="dragon-form-section">
          <div className="dragon-form-section__title"><Package aria-hidden="true" size={17} /><span>Inventory &amp; internal pricing</span></div>
          <div className="grid gap-4 sm:grid-cols-3">
            <label><span className="dragon-label">Stock</span><input className="dragon-control" min="0" onChange={(event) => setForm({ ...form, stockQuantity: event.target.value })} required step="1" type="number" value={form.stockQuantity} /></label>
            {canReadPrice ? <label><span className="dragon-label">Internal price</span><input className="dragon-control" min="0" onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="Not set" step="0.01" type="number" value={form.price} /></label> : null}
            <label><span className="dragon-label">Sort order</span><input className="dragon-control" min="0" onChange={(event) => setForm({ ...form, sortOrder: event.target.value })} required step="1" type="number" value={form.sortOrder} /></label>
          </div>
          {canReadPrice ? <p className="dragon-muted m-0 text-xs">Internal prices remain visible only to authenticated administrators and are never sent to the kiosk.</p> : null}
        </section>

        <section className="dragon-form-section">
          <div className="dragon-form-section__title"><ImageIcon aria-hidden="true" size={17} /><span>Flavor image</span></div>
          <div className="flex items-center gap-3 rounded-xl border p-3">
            <AdminImage className="h-14 w-14" fallback={form.name || productName || 'FL'} media={selectedMedia} size={56} />
            <div className="min-w-0 flex-1"><p className="m-0 truncate text-sm font-medium">{selectedMedia?.alt || selectedMedia?.filename || 'Use the product image'}</p><p className="dragon-muted mb-0 mt-1 text-xs">Select an existing item from Payload Media.</p></div>
            {form.imageID ? <button className="dragon-button min-h-8 px-3 py-1" onClick={() => setForm({ ...form, imageID: '' })} type="button">Clear</button> : null}
          </div>
          {media.length ? (
            <div aria-label="Select flavor image" className="dragon-media-picker" role="radiogroup">
              {media.map((item) => {
                const selected = String(item.id) === form.imageID
                return <button aria-checked={selected} aria-label={`Use ${item.alt || item.filename || `media ${item.id}`}`} className="dragon-media-picker__item" key={String(item.id)} onClick={() => setForm({ ...form, imageID: String(item.id) })} role="radio" type="button"><AdminImage className="h-16 w-16" fallback={item.alt || item.filename || 'IM'} media={item} size={64} />{selected ? <span className="dragon-media-picker__check"><Check aria-hidden="true" size={13} /></span> : null}</button>
              })}
            </div>
          ) : <p className="dragon-muted m-0 text-sm">No media has been uploaded yet. The product image will be used.</p>}
        </section>

        <label className="dragon-switch-row"><span><span className="block font-medium">Active in storefront</span><span className="dragon-muted mt-1 block text-xs">Inactive flavors remain in the admin but cannot be ordered.</span></span><input checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} type="checkbox" /></label>

        {error ? <p className="m-0 rounded-lg border p-3 text-sm dragon-badge--danger" role="alert">{error}</p> : null}
        <div className="dragon-drawer-actions"><button className="dragon-button" disabled={isSaving} onClick={onClose} type="button">Cancel</button><button className="dragon-button dragon-button--primary" disabled={isSaving} type="submit"><Save aria-hidden="true" size={16} />{isSaving ? 'Saving…' : variant ? 'Save flavor' : 'Create flavor'}</button></div>
      </form>
    </AdminDrawer>
  )
}
