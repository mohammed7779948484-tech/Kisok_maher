/**
 * Header Widget
 *
 * Main navigation header for the storefront.
 * Composes features: store name, navigation, CartButton with drawer.
 */
import { verifySession } from '@/core/auth/session'
import { getOrCreateCart, getCartItems, getCartItemCount } from '@/features/cart'
import { HeaderUI } from './HeaderUI'

/**
 * Server-side header widget.
 *
 * Fetches cart data on the server and passes as props to client components.
 */
export async function Header(): Promise<React.ReactElement> {
    // Fetch cart data server-side
    let cartItemCount = 0
    let cartItems: Awaited<ReturnType<typeof getCartItems>> = []

    const session = await verifySession()
    if (session) {
        const cart = await getOrCreateCart(session.sessionId)
        cartItemCount = await getCartItemCount(cart.id)
        cartItems = await getCartItems(cart.id)
    }

    return (
        <HeaderUI
            cartItemCount={cartItemCount}
            cartItems={cartItems}
        />
    )
}
