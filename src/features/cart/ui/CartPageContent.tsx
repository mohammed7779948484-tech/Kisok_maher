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
        <div className="grid gap-6 expanded:grid-cols-[minmax(0,3fr)_minmax(320px,2fr)]">
            <div className="space-y-3">
                {items.map((item) => <CartItem key={item.id} item={item} />)}
            </div>
            <aside className="h-fit rounded-large border border-outline-variant bg-surface p-5 shadow-elevation-1 expanded:sticky expanded:top-24">
                <h2 className="mb-3 text-title-medium text-on-surface">Order summary</h2>
                <CartSummary
                    itemCount={items.reduce((sum, item) => sum + item.quantity, 0)}
                    cartFingerprint={fingerprint}
                    hasInactiveItems={hasInactiveItems}
                    showCartLink={false}
                />
            </aside>
        </div>
    )
}
