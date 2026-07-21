/** Server-only cart reads through Payload Local API. */

import type { PayloadRequest } from 'payload'

import { getPayloadClient } from '@/lib/payload'
import type { CartItemData, OrderCartItem } from '../types'

/** Find the reusable cart row for a device session, including an expired row. */
export async function getCartBySession(sessionId: string, req?: PayloadRequest) {
    if (!sessionId) return null

    const payload = await getPayloadClient()
    const result = await payload.find({
        collection: 'carts',
        where: { session_id: { equals: sessionId } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
        ...(req ? { req } : {}),
    })

    return result.docs[0] ?? null
}

/** Public cart projection. It must never serialize internal price fields. */
export async function getCartItems(
    cartId: string | number,
    req?: PayloadRequest
): Promise<CartItemData[]> {
    return getCartItemProjection(cartId, false, req)
}

/** Authoritative server-only snapshot for order creation. */
export async function getCartItemsForOrderCreation(
    cartId: string | number,
    req: PayloadRequest
): Promise<OrderCartItem[]> {
    return getCartItemProjection(cartId, true, req) as Promise<OrderCartItem[]>
}

async function getCartItemProjection(
    cartId: string | number,
    includeInternalPrice: boolean,
    req?: PayloadRequest
): Promise<Array<CartItemData | OrderCartItem>> {
    if (!cartId) return []

    const payload = await getPayloadClient()
    const result = await payload.find({
        collection: 'cart_items',
        where: { cart: { equals: cartId } },
        depth: 2,
        limit: 50,
        overrideAccess: true,
        ...(req ? { req } : {}),
    })

    return result.docs.map((item) => {
        const variant = asRecord(item.variant)
        const product = asRecord(variant?.product)
        const variantImages = Array.isArray(variant?.images)
            ? variant.images as Array<{ image?: unknown }>
            : []
        const variantImage = variantImages[0]?.image

        const publicItem: CartItemData = {
            id: Number(item.id),
            variantId: Number(variant?.id ?? 0),
            productName: typeof product?.name === 'string' ? product.name : 'Unknown Product',
            variantName: typeof variant?.variant_name === 'string'
                ? variant.variant_name
                : 'Unknown Variant',
            imageUrl: extractImageUrl(variantImage) ?? extractImageUrl(product?.image),
            cloudinaryPublicId: extractCloudinaryPublicId(variantImage)
                ?? extractCloudinaryPublicId(product?.image),
            quantity: typeof item.quantity === 'number' ? item.quantity : 0,
            isActive: variant?.is_active !== false && product?.is_active !== false,
            stockQuantity: typeof variant?.stock_quantity === 'number'
                ? variant.stock_quantity
                : 0,
        }

        if (!includeInternalPrice) return publicItem

        return {
            ...publicItem,
            unitPrice: typeof variant?.price === 'number' ? variant.price : null,
        }
    })
}

export async function getCartItemCount(
    cartId: string | number,
    req?: PayloadRequest
): Promise<number> {
    const payload = await getPayloadClient()
    const result = await payload.find({
        collection: 'cart_items',
        where: { cart: { equals: cartId } },
        limit: 1000,
        pagination: false,
        depth: 0,
        overrideAccess: true,
        ...(req ? { req } : {}),
    })

    return result.docs.reduce(
        (total, item) => total + (typeof item.quantity === 'number' ? item.quantity : 0),
        0
    )
}

function asRecord(value: unknown): Record<string, unknown> | null {
    return typeof value === 'object' && value !== null
        ? value as Record<string, unknown>
        : null
}

function extractImageUrl(image: unknown): string | null {
    const value = asRecord(image)
    return typeof value?.url === 'string' ? value.url : null
}

function extractCloudinaryPublicId(image: unknown): string | null {
    const value = asRecord(image)
    return typeof value?.cloudinary_public_id === 'string'
        ? value.cloudinary_public_id
        : null
}
