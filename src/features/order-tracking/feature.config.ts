import type { FeatureConfig } from '@/features/_registry/types'

export const orderTrackingConfig: FeatureConfig = {
    id: 'order-tracking',
    name: 'Order Tracking',
    description: 'Privacy-safe order lookup by order number with status timeline display',
    version: '1.0.0',
    dependencies: ['checkout'],
    enabled: true,
}
