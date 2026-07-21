/**
 * Cart & CartItems Collections
 *
 * Server-side cart persistence using relational model.
 * Carts are linked to gate sessions via session_id.
 * CartItems are separate rows (NOT embedded arrays).
 *
 * @see data-model.md sections 7-8 for schema specification
 */

import type { CollectionConfig } from 'payload'

/**
 * Carts Collection
 *
 * Session-linked shopping cart.
 * - UUID primary key for security/scale
 * - Unique session_id links to gate session
 * - Contents expire after 20 minutes of inactivity
 * - The row is reused for sequential customers on the same tablet session
 */
export const Carts: CollectionConfig = {
    slug: 'carts',
    admin: {
        useAsTitle: 'session_id',
        defaultColumns: ['session_id', 'expires_at', 'createdAt'],
        group: 'Commerce',
    },
    access: {
        read: ({ req: { user } }) => Boolean(user),
        create: ({ req: { user } }) => Boolean(user),
        update: ({ req: { user } }) => Boolean(user),
        delete: ({ req: { user } }) => Boolean(user && user.role === 'super-admin'),
    },
    fields: [
        {
            name: 'session_id',
            type: 'text',
            required: true,
            unique: true,
            index: true,
            admin: {
                description: 'Links to gate session (UUID)',
            },
        },
        {
            name: 'expires_at',
            type: 'date',
            required: true,
            index: true,
            admin: {
                description: 'Content expiry — extended on each cart update',
                date: {
                    pickerAppearance: 'dayAndTime',
                },
            },
        },
        {
            name: 'processing_key',
            type: 'text',
            index: true,
            admin: {
                readOnly: true,
                description: 'Temporary idempotency key while an order is being created',
            },
        },
        {
            name: 'processing_started_at',
            type: 'date',
            index: true,
            admin: {
                readOnly: true,
                description: 'Used to recover an abandoned order claim after two minutes',
                date: {
                    pickerAppearance: 'dayAndTime',
                },
            },
        },
    ],
    timestamps: true,
}

/**
 * CartItems Collection
 *
 * Individual items within a cart (relational, NOT embedded).
 * - One variant per cart only (upsert on duplicate)
 * - Legacy price_at_add is retained only to avoid a destructive column drop
 * - Cascading delete when parent cart is removed
 */
export const CartItems: CollectionConfig = {
    slug: 'cart_items',
    admin: {
        useAsTitle: 'id',
        defaultColumns: ['cart', 'variant', 'quantity'],
        group: 'Commerce',
    },
    access: {
        read: ({ req: { user } }) => Boolean(user),
        create: ({ req: { user } }) => Boolean(user),
        update: ({ req: { user } }) => Boolean(user),
        delete: ({ req: { user } }) => Boolean(user),
    },
    fields: [
        {
            name: 'cart',
            type: 'relationship',
            relationTo: 'carts',
            required: true,
            index: true,
            admin: {
                description: 'Parent cart',
            },
        },
        {
            name: 'variant',
            type: 'relationship',
            relationTo: 'product_variants',
            required: true,
            index: true,
            admin: {
                description: 'Product variant added to cart',
            },
        },
        {
            name: 'quantity',
            type: 'number',
            required: true,
            min: 1,
            max: 10,
            defaultValue: 1,
            admin: {
                description: 'Quantity in cart (max 10 per item)',
            },
        },
        {
            name: 'price_at_add',
            type: 'number',
            min: 0,
            admin: {
                hidden: true,
                description: 'Legacy compatibility field; not used by the kiosk flow',
            },
        },
    ],
    timestamps: true,
}
