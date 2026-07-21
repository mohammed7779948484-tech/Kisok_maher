'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { placeOrderAction } from '@/features/checkout/actions/place-order.action'
import { Separator } from '@/shared/ui/separator'
import { useCart } from '../../logic/cart.store'

interface CartSummaryProps {
    itemCount: number
    cartFingerprint: string
    hasInactiveItems: boolean
}

export function CartSummary({
    itemCount,
    cartFingerprint,
    hasInactiveItems,
}: CartSummaryProps): React.ReactElement {
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
        <div className="space-y-3 pt-2">
            <Separator />
            <p className="text-sm text-muted-foreground">Items: {itemCount}</p>
            {hasInactiveItems && <p className="text-xs text-destructive">Remove unavailable items before ordering.</p>}
            {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
            <button
                type="button"
                onClick={submitOrder}
                disabled={hasInactiveItems || isPending}
                className="w-full rounded-lg bg-primary py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
            >
                {isPending ? 'Submitting order…' : 'Confirm Order'}
            </button>
            <Link href="/cart" onClick={closeDrawer} className="block text-center text-sm text-muted-foreground hover:text-foreground">
                View Full Cart
            </Link>
        </div>
    )
}
