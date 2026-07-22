/**
 * Checkout Feature — Public API
 *
 * All exports from this feature must go through this barrel file.
 * External code imports from '@/features/checkout', NOT deep paths.
 *
 * @see Constitution Line 126: Import from index.ts only
 * @see Constitution Line 452: index.ts — REQUIRED — Public API exports only
 */

// ─── DB (server-side only) ────────────────────────────────────
export {
    getOrderById,
    getOrderByNumber,
    getOrderByConfirmationToken,
} from './db/queries'

export { createOrder } from './db/mutations'

// ─── Actions ──────────────────────────────────────────────────
export { processCheckoutAction } from './actions/process-checkout.action'
export { placeOrderAction } from './actions/place-order.action'

// ─── UI ───────────────────────────────────────────────────────
export { OrderConfirmation } from './ui/OrderConfirmation'

// ─── Types ────────────────────────────────────────────────────
export type {
    OrderConfirmationData,
} from './types'

// ─── Collections (for payload.config.ts) ──────────────────────
export { Orders, OrderItems } from './db/schema'
