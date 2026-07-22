'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { ArrowRight, Loader2, ShoppingBag } from 'lucide-react'

import { placeOrderAction } from '@/features/checkout/actions/place-order.action'
import { Button, Separator } from '@/shared/ui'
import { useCart } from '../../logic/cart.store'

interface CartSummaryProps {
  itemCount: number
  cartFingerprint: string
  hasInactiveItems: boolean
  showCartLink?: boolean
}

export function CartSummary({ itemCount, cartFingerprint, hasInactiveItems, showCartLink = true }: CartSummaryProps): React.ReactElement {
  const router = useRouter()
  const { closeDrawer } = useCart()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function submitOrder(): void {
    if (hasInactiveItems || isPending) return
    setError(null)
    startTransition(async () => {
      const storageKey = `dragon-order-attempt:${cartFingerprint}`
      const idempotencyKey = sessionStorage.getItem(storageKey) ?? crypto.randomUUID()
      sessionStorage.setItem(storageKey, idempotencyKey)
      const result = await placeOrderAction({ idempotencyKey })
      if (!result.success || !result.data) {
        setError(result.error ?? 'Could not place order')
        return
      }
      sessionStorage.removeItem(storageKey)
      closeDrawer()
      router.push(`/order-confirmation/${result.data.confirmationToken}`)
      router.refresh()
    })
  }

  return (
    <div className="space-y-4 pt-2">
      <Separator />
      <div className="flex items-center justify-between gap-4 text-body-medium">
        <span className="text-on-surface-variant">Items</span>
        <strong className="text-on-surface tabular-nums">{itemCount}</strong>
      </div>
      {hasInactiveItems && <p className="rounded-medium bg-warning-container p-3 text-body-small text-warning">Remove unavailable items before ordering.</p>}
      {error && <p className="rounded-medium bg-destructive-container p-3 text-body-small text-destructive-container-foreground" role="alert">{error}</p>}
      <Button className="w-full" disabled={hasInactiveItems || isPending} onClick={submitOrder} size="lg" type="button">
        {isPending ? <><Loader2 aria-hidden="true" className="animate-spin" /> Submitting order…</> : <><ShoppingBag aria-hidden="true" /> Confirm order</>}
      </Button>
      {showCartLink && (
        <Link className="flex min-h-touch items-center justify-center gap-2 rounded-medium text-label-large text-primary hover:bg-primary-container" href="/cart" onClick={closeDrawer}>
          View full cart <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      )}
    </div>
  )
}
