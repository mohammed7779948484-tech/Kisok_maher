/**
 * ProductDetail Component
 *
 * Full product detail view with image gallery and injected interactive elements.
 * Server Component — renders static UI, delegates state to ProductInteractive.
 * @see Constitution: Component Injection Pattern used for ActionComponent.
 */

import { ProductInteractive } from './_components/ProductInteractive'

import type { ProductDetailProps } from '../types'

export interface ProductDetailWithActionProps extends ProductDetailProps {
    ActionComponent?: React.ComponentType<{ variantId: number; stockQuantity: number; quantity: number }>
}

export function ProductDetail({ product, ActionComponent }: ProductDetailWithActionProps): React.ReactElement {
    const { name, imageUrl, brandName, description, unitLabel, variants, totalStock, cloudinaryPublicId } = product

    return (
        <div className="py-4 medium:py-6">
            <ProductInteractive
                variants={variants}
                totalStock={totalStock}
                unitLabel={unitLabel}
                imageUrl={imageUrl}
                cloudinaryPublicId={cloudinaryPublicId}
                productName={name}
                brandName={brandName}
                description={description}
                ActionComponent={ActionComponent}
            />
        </div>
    )
}

