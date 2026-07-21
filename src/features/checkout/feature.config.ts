import type { FeatureConfig } from '@/features/_registry/types'

export const checkoutConfig: FeatureConfig = {
    id: 'checkout',
    name: 'Checkout',
    description: 'Single-tablet direct order submission with atomic stock and cart handling',
    version: '1.0.0',
    dependencies: ['gate', 'cart'],
    enabled: true,
}
