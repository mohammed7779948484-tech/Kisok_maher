'use client'

import { useTransition } from 'react'
import { ImageIcon, Loader2, Minus, Plus, Trash2 } from 'lucide-react'

import { CloudinaryImage, StatusBadge } from '@/shared/ui'
import { cn } from '@/shared/lib/utils'

import { MAX_QUANTITY } from '../../constants'
import { removeItemAction } from '../../actions/remove-item.action'
import { updateQuantityAction } from '../../actions/update-quantity.action'
import { useCart } from '../../logic/cart.store'
import type { CartItemData } from '../../types'

interface CartItemProps {
  item: CartItemData
  isLoading?: boolean
}

export function CartItem({ item, isLoading = false }: CartItemProps): React.ReactElement {
  const [isPending, startTransition] = useTransition()
  const { setLoading } = useCart()

  const handleUpdateQuantity = (newQuantity: number) => {
    if (newQuantity < 1) return
    startTransition(async () => {
      await updateQuantityAction({ cartItemId: item.id, quantity: newQuantity })
    })
  }

  const handleRemove = () => {
    startTransition(async () => {
      setLoading(true)
      await removeItemAction({ cartItemId: item.id })
      setLoading(false)
    })
  }

  const isWorking = isLoading || isPending

  return (
    <article className={cn('relative flex gap-4 rounded-large border border-outline-variant bg-surface p-4 shadow-elevation-1 transition-opacity', !item.isActive && 'bg-neutral-container/40', isLoading && 'pointer-events-none opacity-60')}>
      {isWorking && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-large bg-surface/75" role="status">
          <Loader2 aria-hidden="true" className="h-6 w-6 animate-spin text-primary" />
          <span className="sr-only">Updating cart item</span>
        </div>
      )}

      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-medium bg-surface-container">
        {item.imageUrl || item.cloudinaryPublicId ? (
          <CloudinaryImage alt={item.productName} className="object-cover" fill publicId={item.cloudinaryPublicId} sizes="80px" src={item.imageUrl} />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-on-surface-variant"><ImageIcon aria-hidden="true" className="h-6 w-6" /></span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="break-words text-title-small text-on-surface">{item.productName}</h3>
            <p className="mt-1 break-words text-body-small text-on-surface-variant">{item.variantName}</p>
          </div>
          {!item.isActive && <StatusBadge tone="destructive">Unavailable</StatusBadge>}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div aria-label={`Quantity for ${item.productName}, ${item.variantName}`} className="quantity-control" role="group">
            <button aria-label="Decrease quantity" className="quantity-control-button" disabled={item.quantity <= 1 || isWorking} onClick={() => handleUpdateQuantity(item.quantity - 1)} type="button"><Minus aria-hidden="true" className="h-5 w-5" /></button>
            <span aria-live="polite" className="quantity-control-value">{item.quantity}</span>
            <button aria-label="Increase quantity" className="quantity-control-button" disabled={item.quantity >= item.stockQuantity || item.quantity >= MAX_QUANTITY || isWorking} onClick={() => handleUpdateQuantity(item.quantity + 1)} type="button"><Plus aria-hidden="true" className="h-5 w-5" /></button>
          </div>

          <button aria-label={`Remove ${item.productName} from cart`} className="flex h-icon-button w-icon-button items-center justify-center rounded-medium text-destructive transition-colors duration-fast hover:bg-destructive-container" disabled={isWorking} onClick={handleRemove} type="button">
            <Trash2 aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
      </div>
    </article>
  )
}
