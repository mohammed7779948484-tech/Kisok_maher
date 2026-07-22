'use client'

import { ShoppingBag } from 'lucide-react'

import { Badge } from '@/shared/ui'

import { useCart } from '../logic/cart.store'

interface CartButtonProps {
  itemCount: number
}

export function CartButton({ itemCount }: CartButtonProps): React.ReactElement {
  const { openDrawer } = useCart()

  return (
    <button
      aria-label={`Open cart (${itemCount} items)`}
      className="premium-interactive relative flex h-icon-button w-icon-button items-center justify-center rounded-medium border border-outline bg-surface/90 text-on-surface-variant shadow-elevation-1 hover:border-primary/50 hover:bg-primary-container hover:text-primary hover:shadow-elevation-2"
      onClick={openDrawer}
      type="button"
    >
      <ShoppingBag aria-hidden="true" className="h-5 w-5" />
      {itemCount > 0 && (
        <Badge className="absolute -right-2 -top-2 flex min-h-6 min-w-6 items-center justify-center rounded-full px-1 tabular-nums" variant="destructive">
          {itemCount > 99 ? '99+' : itemCount}
        </Badge>
      )}
    </button>
  )
}
