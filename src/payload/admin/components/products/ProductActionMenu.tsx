'use client'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Link } from '@payloadcms/ui'
import { Edit3, Eye, MoreHorizontal, PackagePlus, Trash2 } from 'lucide-react'
import React from 'react'

import type { ProductListItemDTO, ProductVariantDTO } from '../../types'

/**
 * Adapted from Maher/app/(admin)/dashboard/products/_components/products-columns.tsx.
 * Maher's Supabase actions were replaced with permission-aware Payload callbacks.
 */
export function ProductActionMenu({
  canCreateFlavor,
  canDelete,
  canUpdate,
  onAddFlavor,
  onDelete,
  onPreview,
  product,
}: {
  canCreateFlavor: boolean
  canDelete: boolean
  canUpdate: boolean
  onAddFlavor: () => void
  onDelete: () => void
  onPreview: () => void
  product: ProductListItemDTO
}): React.ReactElement {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild><button aria-label={`Open actions for ${product.name}`} className="dragon-icon-button h-8 w-8" type="button"><MoreHorizontal aria-hidden="true" size={16} /></button></DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" className="dragon-action-menu" sideOffset={6}>
          <DropdownMenu.Label className="dragon-action-menu__label">Product actions</DropdownMenu.Label>
          <DropdownMenu.Item asChild><button className="dragon-action-menu__item" onClick={onPreview} type="button"><Eye aria-hidden="true" size={15} />Preview</button></DropdownMenu.Item>
          {canCreateFlavor ? <DropdownMenu.Item asChild><button className="dragon-action-menu__item" onClick={onAddFlavor} type="button"><PackagePlus aria-hidden="true" size={15} />Add flavor</button></DropdownMenu.Item> : null}
          {canUpdate ? <DropdownMenu.Item asChild><Link className="dragon-action-menu__item" href={`/admin/collections/products/${product.id}`}><Edit3 aria-hidden="true" size={15} />Edit product</Link></DropdownMenu.Item> : null}
          {canDelete ? <><DropdownMenu.Separator className="dragon-action-menu__separator" /><DropdownMenu.Item asChild><button className="dragon-action-menu__item dragon-action-menu__item--danger" onClick={onDelete} type="button"><Trash2 aria-hidden="true" size={15} />Delete product</button></DropdownMenu.Item></> : null}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
export function FlavorActionMenu({
  canDelete,
  canUpdate,
  onDelete,
  onEdit,
  variant,
}: {
  canDelete: boolean
  canUpdate: boolean
  onDelete: () => void
  onEdit: () => void
  variant: ProductVariantDTO
}): React.ReactElement {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild><button aria-label={`Open actions for ${variant.name}`} className="dragon-icon-button h-8 w-8" type="button"><MoreHorizontal aria-hidden="true" size={16} /></button></DropdownMenu.Trigger>
      <DropdownMenu.Portal><DropdownMenu.Content align="end" className="dragon-action-menu" sideOffset={6}><DropdownMenu.Label className="dragon-action-menu__label">Flavor actions</DropdownMenu.Label>{canUpdate ? <DropdownMenu.Item asChild><button className="dragon-action-menu__item" onClick={onEdit} type="button"><Edit3 aria-hidden="true" size={15} />Edit flavor</button></DropdownMenu.Item> : null}{canDelete ? <DropdownMenu.Item asChild><button className="dragon-action-menu__item dragon-action-menu__item--danger" onClick={onDelete} type="button"><Trash2 aria-hidden="true" size={15} />Delete flavor</button></DropdownMenu.Item> : null}</DropdownMenu.Content></DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
