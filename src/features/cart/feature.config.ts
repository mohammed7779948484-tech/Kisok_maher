import type { FeatureConfig } from '@/features/_registry/types'

export const cartConfig: FeatureConfig = {
    id: 'cart',
    name: 'Shopping Cart',
    description: 'Reusable server-side cart for sequential customers on one store tablet',
    version: '1.0.0',
    dependencies: ['gate'],
    enabled: true,
}
