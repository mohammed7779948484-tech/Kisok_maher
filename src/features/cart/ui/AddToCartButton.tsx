'use client'

import { useState } from 'react'
import { addToCartAction } from '../actions/add-to-cart.action'
import { useCart } from '../logic/cart.store'
import { Button } from '@/shared/ui/button'
import { Loader2, ShoppingCart } from 'lucide-react'

export interface AddToCartButtonProps {
    variantId: number
    stockQuantity: number
    quantity: number
}

export function AddToCartButton({
    variantId,
    stockQuantity,
    quantity,
}: AddToCartButtonProps): React.ReactElement {
    const [isLoading, setIsLoading] = useState(false)
    const { openDrawer } = useCart()

    async function handleAddToCart() {
        setIsLoading(true)

        const result = await addToCartAction({
            variantId,
            quantity,
        })

        setIsLoading(false)

        if (result.success) {
            openDrawer()
        }
    }

    if (stockQuantity === 0) {
        return (
            <Button className="w-full" disabled variant="secondary">
                Out of Stock
            </Button>
        )
    }

    return (
        <Button
            onClick={handleAddToCart}
            disabled={isLoading}
            className="w-full"
            size="lg"
        >
            {isLoading ? (
                <>
                    <Loader2 aria-hidden="true" className="animate-spin" />
                    Adding...
                </>
            ) : (
                <>
                    <ShoppingCart aria-hidden="true" />
                    Add to Cart
                </>
            )}
        </Button>
    )
}
