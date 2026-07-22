/**
 * Products Collection
 *
 * Core product information with brand and category relationships.
 * Many-to-Many with categories, Many-to-One with brands.
 * One-to-Many with product_variants.
 *
 * @see data-model.md section 3 for schema specification
 */

import type { CollectionConfig } from 'payload'

import { generateSlug } from '../hooks/before-change/generate-slug'
import { revalidateCache } from '../hooks/after-change/revalidate-cache'

export const Products: CollectionConfig = {
    slug: 'products',
    enableQueryPresets: true,
    admin: {
        useAsTitle: 'name',
        defaultColumns: ['name', 'slug', 'brand', 'is_active', 'createdAt'],
        group: 'Store',
        description: 'Manage product information, classification, media, and the linked flavor inventory.',
        listSearchableFields: ['name', 'slug'],
        pagination: {
            defaultLimit: 15,
            limits: [15, 30, 60],
        },
        components: {
            views: {
                list: {
                    Component: '@/payload/admin/views/ProductsList#ProductsList',
                },
                edit: {
                    default: {
                        tab: {
                            label: 'General Info',
                            order: 0,
                        },
                    },
                    variants: {
                        Component: '@/payload/admin/views/ProductVariants#ProductVariants',
                        path: '/variants',
                        tab: {
                            href: '/variants',
                            label: 'Flavors & Inventory',
                            order: 100,
                        },
                    },
                },
            },
        },
    },
    access: {
        read: () => true, // Public read for storefront
        create: ({ req: { user } }) => Boolean(user),
        update: ({ req: { user } }) => Boolean(user),
        delete: ({ req: { user } }) => user?.role === 'super-admin',
    },
    fields: [
        {
            type: 'collapsible',
            label: 'Product details',
            admin: {
                initCollapsed: false,
            },
            fields: [
                {
                    type: 'row',
                    fields: [
                        {
                            name: 'name',
                            type: 'text',
                            required: true,
                            admin: {
                                description: 'Customer-facing product name',
                                width: '60%',
                            },
                        },
                        {
                            name: 'unit_label',
                            label: 'Unit label',
                            type: 'text',
                            required: true,
                            defaultValue: 'Unit',
                            admin: {
                                description: 'Piece, pack, bottle, etc.',
                                width: '40%',
                            },
                        },
                    ],
                },
                {
                    type: 'row',
                    fields: [
                        {
                            name: 'brand',
                            type: 'relationship',
                            relationTo: 'brands',
                            index: true,
                            admin: {
                                description: 'Product brand/manufacturer',
                                width: '40%',
                            },
                        },
                        {
                            name: 'categories',
                            type: 'relationship',
                            relationTo: 'categories',
                            hasMany: true,
                            admin: {
                                description: 'One or more storefront categories',
                                width: '60%',
                            },
                        },
                    ],
                },
                {
                    name: 'description',
                    type: 'richText',
                    admin: {
                        description: 'Product description shown in the catalog',
                    },
                },
            ],
        },
        {
            name: 'slug',
            label: 'Slug',
            type: 'text',
            required: true,
            unique: true,
            index: true,
            admin: {
                description: 'URL-friendly identifier (auto-generated from name)',
                position: 'sidebar',
            },
        },
        {
            type: 'collapsible',
            label: 'Product media',
            admin: {
                initCollapsed: false,
            },
            fields: [
                {
                    name: 'image',
                    type: 'upload',
                    relationTo: 'media',
                    admin: {
                        description: 'Main image used when a flavor has no dedicated image',
                    },
                },
            ],
        },
        {
            name: 'sort_order',
            label: 'Sort order',
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
            label: 'Active in storefront',
            type: 'checkbox',
            required: true,
            defaultValue: true,
            admin: {
                description: 'Inactive products are hidden from storefront',
                position: 'sidebar',
            },
        },
    ],
    hooks: {
        beforeChange: [generateSlug],
        afterChange: [revalidateCache],
    },
    timestamps: true,
}
