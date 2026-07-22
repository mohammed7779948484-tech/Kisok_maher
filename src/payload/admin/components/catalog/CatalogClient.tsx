'use client'

import { Edit3, ImageIcon, Layers3, Plus, Search, Tag, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useMemo, useState, useTransition } from 'react'
import { toast } from '@payloadcms/ui'

import type { AdminEntityID, CatalogBrandDTO, CatalogCategoryDTO, CatalogDTO } from '../../types'
import { AdminDrawer } from '../shared/AdminDrawer'
import { AdminImage } from '../shared/AdminImage'
import { StatusBadge } from '../shared/StatusBadge'

type CatalogTab = 'brands' | 'categories'
type EditableItem = CatalogBrandDTO | CatalogCategoryDTO

interface CatalogClientProps {
  data: CatalogDTO
}

interface CatalogFormState {
  description: string
  imageID: string
  isActive: boolean
  name: string
  parentID: string
  sortOrder: string
}

const EMPTY_FORM: CatalogFormState = {
  description: '', imageID: '', isActive: true, name: '', parentID: '', sortOrder: '0',
}

function isBrand(item: EditableItem): item is CatalogBrandDTO {
  return 'description' in item
}

export function CatalogClient({ data }: CatalogClientProps): React.ReactElement {
  const router = useRouter()
  const [tab, setTab] = useState<CatalogTab>(() => data.permissions.brands.read ? 'brands' : 'categories')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<EditableItem | null>(null)
  const [form, setForm] = useState<CatalogFormState>(EMPTY_FORM)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isPending, startTransition] = useTransition()

  const normalizedSearch = search.trim().toLowerCase()
  const brands = useMemo(() => data.brands.filter((item) => item.name.toLowerCase().includes(normalizedSearch)), [data.brands, normalizedSearch])
  const categories = useMemo(() => data.categories.filter((item) => item.name.toLowerCase().includes(normalizedSearch) || item.parent?.name.toLowerCase().includes(normalizedSearch)), [data.categories, normalizedSearch])
  const topLevelCategories = data.categories.filter((item) => !item.parent && item.id !== editing?.id)
  const permissions = data.permissions[tab]

  function closeDrawer(): void {
    setOpen(false)
    setEditing(null)
    setForm(EMPTY_FORM)
    setError(null)
  }

  function createItem(): void {
    setEditing(null)
    setForm(EMPTY_FORM)
    setError(null)
    setOpen(true)
  }

  function editItem(item: EditableItem): void {
    setEditing(item)
    setForm({
      description: isBrand(item) ? (item.description ?? '') : '',
      imageID: item.image ? String(item.image.id) : '',
      isActive: item.isActive,
      name: item.name,
      parentID: isBrand(item) ? '' : item.parent ? String(item.parent.id) : '',
      sortOrder: String(item.sortOrder),
    })
    setError(null)
    setOpen(true)
  }

  async function saveItem(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    if (isSaving) return
    setError(null)
    setIsSaving(true)
    const collection = tab
    const body = tab === 'brands'
      ? { description: form.description || null, is_active: form.isActive, logo: form.imageID || null, name: form.name, sort_order: Number(form.sortOrder) }
      : { image: form.imageID || null, is_active: form.isActive, name: form.name, parent: form.parentID || null, sort_order: Number(form.sortOrder) }
    const response = await fetch(editing ? `/api/${collection}/${editing.id}` : `/api/${collection}`, {
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
      method: editing ? 'PATCH' : 'POST',
    })
    setIsSaving(false)
    if (!response.ok) {
      const message = 'Payload could not save this entry. Review the fields and your permissions, then try again.'
      setError(message)
      toast.error('Catalog entry was not saved', { description: message })
      return
    }
    toast.success(editing ? 'Catalog entry updated' : 'Catalog entry created', { description: form.name })
    closeDrawer()
    startTransition(() => router.refresh())
  }

  async function deleteItem(id: AdminEntityID, name: string): Promise<void> {
    if (!window.confirm(`Delete “${name}”? This cannot be undone.`)) return
    setError(null)
    setIsSaving(true)
    const response = await fetch(`/api/${tab}/${id}`, { method: 'DELETE' })
    setIsSaving(false)
    if (!response.ok) {
      const message = 'This entry could not be deleted. It may still be in use or your role may not allow deletion.'
      setError(message)
      toast.error('Catalog entry was not deleted', { description: message })
      return
    }
    toast.success('Catalog entry deleted', { description: name })
    startTransition(() => router.refresh())
  }

  const items: EditableItem[] = tab === 'brands' ? brands : categories

  return (
    <div className="relative grid gap-5">
      {isPending || isSaving ? <div className="dragon-loading" role="status">{isSaving ? 'Saving catalog…' : 'Refreshing catalog…'}</div> : null}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="inline-flex w-fit rounded-lg border p-1">
          {data.permissions.brands.read ? <button className={`dragon-button min-h-8 border-0 px-3 py-1 ${tab === 'brands' ? 'dragon-subrow' : ''}`} onClick={() => { setTab('brands'); setSearch('') }} type="button"><Tag aria-hidden="true" size={16} />Brands ({data.brands.length})</button> : null}
          {data.permissions.categories.read ? <button className={`dragon-button min-h-8 border-0 px-3 py-1 ${tab === 'categories' ? 'dragon-subrow' : ''}`} onClick={() => { setTab('categories'); setSearch('') }} type="button"><Layers3 aria-hidden="true" size={16} />Categories ({data.categories.length})</button> : null}
        </div>
        <div className="flex flex-1 flex-col gap-3 sm:flex-row md:max-w-2xl">
          <label className="relative flex-1"><span className="sr-only">Search {tab}</span><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-3" size={17} /><input className="dragon-control pl-10" onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${tab}…`} value={search} /></label>
          {permissions.create ? <button className="dragon-button dragon-button--primary" onClick={createItem} type="button"><Plus aria-hidden="true" size={17} />Add {tab === 'brands' ? 'brand' : 'category'}</button> : null}
        </div>
      </div>

      {error && !open ? <p className="m-0 rounded-lg border p-3 text-sm dragon-badge--danger" role="alert">{error}</p> : null}

      {items.length ? <div className="dragon-table-wrap"><table className="dragon-table"><thead><tr><th>Name</th>{tab === 'categories' ? <th>Parent</th> : <th>Description</th>}<th>Sort</th><th>Status</th><th className="text-right">Actions</th></tr></thead><tbody>{items.map((item) => <tr className="dragon-row" key={String(item.id)}><td><div className="flex items-center gap-3"><AdminImage className="h-11 w-11" fallback={item.name} media={item.image} /><span className="font-medium">{item.name}</span></div></td><td className="dragon-muted">{isBrand(item) ? (item.description || '—') : (item.parent?.name ?? 'Top level')}</td><td>{item.sortOrder}</td><td><StatusBadge status={item.isActive ? 'active' : 'inactive'} /></td><td><div className="flex justify-end gap-2">{permissions.update ? <button aria-label={`Edit ${item.name}`} className="dragon-icon-button h-8 w-8" onClick={() => editItem(item)} type="button"><Edit3 aria-hidden="true" size={15} /></button> : null}{permissions.delete ? <button aria-label={`Delete ${item.name}`} className="dragon-icon-button h-8 w-8 dragon-button--danger" onClick={() => void deleteItem(item.id, item.name)} type="button"><Trash2 aria-hidden="true" size={15} /></button> : null}</div></td></tr>)}</tbody></table></div> : <div className="dragon-empty"><Layers3 aria-hidden="true" size={30} /><p className="m-0 font-semibold">No {tab} match your search</p></div>}

      <AdminDrawer description={`Create or update a ${tab === 'brands' ? 'manufacturer brand' : 'catalog category'}. Changes flow through Payload validation and hooks.`} onOpenChange={(nextOpen) => { if (!nextOpen) closeDrawer() }} open={open} title={`${editing ? 'Edit' : 'Add'} ${tab === 'brands' ? 'brand' : 'category'}`}>
        <form className="grid gap-5" onSubmit={(event) => void saveItem(event)}>
          <label><span className="dragon-label">Name</span><input className="dragon-control" onChange={(event) => setForm({ ...form, name: event.target.value })} required value={form.name} /></label>
          {tab === 'brands' ? <label><span className="dragon-label">Description</span><textarea className="dragon-control min-h-24" onChange={(event) => setForm({ ...form, description: event.target.value })} value={form.description} /></label> : <label><span className="dragon-label">Parent category</span><select className="dragon-control" onChange={(event) => setForm({ ...form, parentID: event.target.value })} value={form.parentID}><option value="">Top level</option>{topLevelCategories.map((category) => <option key={String(category.id)} value={String(category.id)}>{category.name}</option>)}</select></label>}
          <label><span className="dragon-label">Sort order</span><input className="dragon-control" min="0" onChange={(event) => setForm({ ...form, sortOrder: event.target.value })} required type="number" value={form.sortOrder} /></label>
          <label className="flex items-center gap-3"><input checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} type="checkbox" /><span className="font-medium">Active in storefront</span></label>
          <fieldset className="grid gap-3"><legend className="dragon-label">Image</legend><select className="dragon-control" onChange={(event) => setForm({ ...form, imageID: event.target.value })} value={form.imageID}><option value="">No image</option>{data.media.map((media) => <option key={String(media.id)} value={String(media.id)}>{media.alt || media.filename || `Media ${media.id}`}</option>)}</select>{form.imageID ? <div className="flex items-center gap-3 rounded-lg border p-3"><ImageIcon aria-hidden="true" size={18} /><span className="dragon-muted text-sm">Selected existing Payload media item</span></div> : null}</fieldset>
          {error ? <p className="m-0 rounded-lg border p-3 text-sm dragon-badge--danger" role="alert">{error}</p> : null}
          <div className="mt-2 flex justify-end gap-3"><button className="dragon-button" disabled={isSaving} onClick={closeDrawer} type="button">Cancel</button><button className="dragon-button dragon-button--primary" disabled={isSaving} type="submit">{isSaving ? 'Saving…' : editing ? 'Save changes' : `Create ${tab === 'brands' ? 'brand' : 'category'}`}</button></div>
        </form>
      </AdminDrawer>
    </div>
  )
}
