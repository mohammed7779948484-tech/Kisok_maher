import { CartItem } from './_components/CartItem'
import { CartSummary } from './_components/CartSummary'
import { EmptyCart } from './_components/EmptyCart'
import type { CartItemData } from '../types'

interface CartPageContentProps {
    items: CartItemData[]
}

export function CartPageContent({ items }: CartPageContentProps): React.ReactElement {
    if (items.length === 0) return <EmptyCart />

    const hasInactiveItems = items.some((item) => !item.isActive)
    const fingerprint = items
        .map((item) => `${item.id}:${item.variantId}:${item.quantity}`)
        .sort()
        .join('|')

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-3 lg:col-span-2">
                {items.map((item) => <CartItem key={item.id} item={item} />)}
            </div>
            <div className="rounded-lg border border-border p-4">
                <h2 className="mb-3 text-lg font-semibold text-foreground">Order Summary</h2>
                <CartSummary
                    itemCount={items.reduce((sum, item) => sum + item.quantity, 0)}
                    cartFingerprint={fingerprint}
                    hasInactiveItems={hasInactiveItems}
                />
            </div>
        </div>
    )
}
