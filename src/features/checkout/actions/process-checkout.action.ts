'use server'

import type { ActionResult, CheckoutResult } from '@/modules/orders'
import { placeOrderAction } from './place-order.action'

/** @deprecated The kiosk uses placeOrderAction directly. */
export async function processCheckoutAction(input: unknown): Promise<ActionResult<CheckoutResult>> {
    return placeOrderAction(input)
}
