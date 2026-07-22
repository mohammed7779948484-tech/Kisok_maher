/**
 * Cart Page
 *
 * Full-page cart view. Server Component — verifies session (DAL).
 * Imports ONLY from public feature APIs (barrel files), NOT private _components.
 *
 * @see Constitution Line 370: app/ can import from widgets/, features/, shared/
 * @see Constitution Line 216-234: Private _components/ are NOT importable from outside
 * @see Constitution: DAL — verifySession at data access points
 */

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { verifySession } from '@/core/auth/session'
import {
    getOrCreateCart,
    getCartItems,
    CartPageContent,
} from '@/features/cart'
import { brandConfig } from '@/shared/config'
import { PageHeader } from '@/shared/ui'

export const metadata: Metadata = {
    title: `Shopping Cart — ${brandConfig.displayName}`,
    description: 'Review items in your shopping cart',
}

export default async function CartPage(): Promise<React.ReactElement> {
    // Security: Verify session via DAL (NOT middleware)
    const session = await verifySession()
    if (!session) {
        redirect('/gate')
    }

    // Fetch cart data server-side
    const cart = await getOrCreateCart(session.sessionId)
    const items = await getCartItems(cart.id)

    return (
        <div className="customer-shell max-w-6xl">
            <PageHeader description="Review quantities and confirm the order when everything is ready." eyebrow="Current order" title="Shopping cart" />
            <CartPageContent items={items} />
        </div>
    )
}
