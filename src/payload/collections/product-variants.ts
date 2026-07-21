/**
 * Product Variants Collection
 *
 * Product variations (flavors, sizes, nicotine levels, etc.).
 * Each variant has its own stock and SKU. Price is optional and internal-only.
 *
 * @see data-model.md section 5 for schema specification
 */

import type { CollectionConfig } from 'payload'

import { revalidateCache } from '../hooks/after-change/revalidate-cache'

export const ProductVariants: CollectionConfig = {
    slug: 'product_variants',
    admin: {
        useAsTitle: 'variant_name',
        defaultColumns: ['variant_name', 'product', 'sku', 'stock_quantity', 'is_active'],
        group: 'Catalog',
        description: 'Product variations with individual pricing and stock',
    },
    access: {
        read: () => true, // Public read for storefront
        create: ({ req: { user } }) => Boolean(user),
        update: ({ req: { user } }) => Boolean(user),
        delete: ({ req: { user } }) => user?.role === 'super-admin',
    },
    fields: [
        {
            name: 'product',
            type: 'relationship',
            relationTo: 'products',
            required: true,
            index: true,
            admin: {
                description: 'Parent product',
            },
        },
        {
            name: 'variant_name',
            type: 'text',
            required: true,
            admin: {
                description: 'Variant display name (e.g., "Strawberry Ice", "50mg")',
            },
        },
        {
            name: 'sku',
            type: 'text',
            required: true,
            unique: true,
            index: true,
            admin: {
                description: 'Stock Keeping Unit — must be unique',
            },
        },
        {
            type: 'collapsible',
            label: 'Internal Pricing',
            admin: {
                initCollapsed: true,
            },
            fields: [
                {
                    name: 'price',
                    type: 'number',
                    min: 0,
                    access: {
                        read: ({ req }) => Boolean(req.user),
                    },
                    admin: {
                        description: 'Optional internal unit price; never shown on the kiosk',
                        step: 0.01,
                    },
                },
            ],
        },
        {
            name: 'stock_quantity',
            type: 'number',
            required: true,
            defaultValue: 0,
            min: 0,
            admin: {
                description: 'Current inventory count',
            },
        },
        {
            name: 'images',
            type: 'array',
            admin: {
                description: 'Variant images (first image is primary, falls back to product image)',
            },
            fields: [
                {
                    name: 'image',
                    type: 'upload',
                    relationTo: 'media',
                    required: true,
                },
            ],
        },
        {
            name: 'option_value',
            type: 'text',
            admin: {
                description: 'Filter label (e.g., "6mg", "30ml")',
            },
        },
        {
            name: 'sort_order',
            type: 'number',
            required: true,
            defaultValue: 0,
            admin: {
                description: 'Display order (lower = first)',
                position: 'sidebar',
            },
        },
        {
            name: 'is_active',
            type: 'checkbox',
            required: true,
            defaultValue: true,
            admin: {
                description: 'Inactive variants are hidden from storefront',
                position: 'sidebar',
            },
        },
    ],
    hooks: {
        afterChange: [revalidateCache],
    },
    timestamps: true,
}
