'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/ui/sheet'
import { fadeUp, staggerContainer } from '@/shared/ui/motion/variants'
import { useCart } from '../logic/cart.store'
import { CartItem } from './_components/CartItem'
import { CartSummary } from './_components/CartSummary'
import { EmptyCart } from './_components/EmptyCart'
import type { CartItemData } from '../types'

interface CartDrawerProps {
    items: CartItemData[]
}

export function CartDrawer({ items }: CartDrawerProps): React.ReactElement {
    const { isDrawerOpen, closeDrawer, isLoading } = useCart()
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
    const fingerprint = items
        .map((item) => `${item.id}:${item.variantId}:${item.quantity}`)
        .sort()
        .join('|')

    return (
        <Sheet open={isDrawerOpen} onOpenChange={closeDrawer}>
            <SheetContent className="flex w-full flex-col">
                <SheetHeader><SheetTitle>Shopping cart <span className="tabular-nums">({totalQuantity})</span></SheetTitle></SheetHeader>
                {items.length === 0 ? <EmptyCart /> : (
                    <>
                        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="flex-1 space-y-3 overflow-y-auto py-4 pr-1">
                            <AnimatePresence mode="popLayout">
                                {items.map((item) => (
                                    <motion.div key={item.id} variants={fadeUp} layout exit={{ opacity: 0, scale: 0.9 }}>
                                        <CartItem item={item} isLoading={isLoading} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                        <CartSummary
                            itemCount={totalQuantity}
                            cartFingerprint={fingerprint}
                            hasInactiveItems={items.some((item) => !item.isActive)}
                            showCartLink
                        />
                    </>
                )}
            </SheetContent>
        </Sheet>
    )
}
