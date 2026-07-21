/**
 * Cart Feature Types
 *
 * Type definitions for cart UI, actions, and data. Zustand store types live here
 * but cart items are NEVER stored in Zustand (server is source of truth).
 *
 * Public cart types intentionally contain no price fields.
 * @see api-spec.md: AddToCartResult, UpdateQuantityResult, RemoveItemResult
 * @see research.md: Decision #3 (Zustand UI-only store)
 */

import type { ActionResult } from '@/modules/orders'

/** Re-export for convenience */
export type { ActionResult }

/** Cart item data passed to UI components (server-fetched) */
export interface CartItemData {
    id: number
    variantId: number
    productName: string
    variantName: string
    imageUrl: string | null
    cloudinaryPublicId: string | null
    quantity: number
    isActive: boolean
    stockQuantity: number
}

/** Server-only item snapshot used while creating an order. */
export interface OrderCartItem extends CartItemData {
    unitPrice: number | null
}

/** Zustand UI-only store state (NO cart items — server is source of truth) */
export interface CartUIState {
    isDrawerOpen: boolean
    isLoading: boolean
    openDrawer: () => void
    closeDrawer: () => void
    setLoading: (loading: boolean) => void
}

/** Result from add-to-cart server action */
export interface AddToCartResult {
    cartItemCount: number
    itemName: string
}

/** Result from update-quantity server action */
export interface UpdateQuantityResult {
    cartItemCount: number
}

/** Result from remove-item server action */
export interface RemoveItemResult {
    cartItemCount: number
}

/** Result from clear-cart server action */
export interface ClearCartResult {
    clearedCount: number
}

/** Cart summary for display */
export interface CartSummaryData {
    itemCount: number
    hasInactiveItems: boolean
}
