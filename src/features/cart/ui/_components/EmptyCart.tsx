'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'

import { Button, EmptyState } from '@/shared/ui'

import { useCart } from '../../logic/cart.store'

export function EmptyCart(): React.ReactElement {
  const { closeDrawer } = useCart()

  return (
    <EmptyState
      action={<Button asChild><Link href="/products" onClick={closeDrawer}>Browse products</Link></Button>}
      className="border-0 bg-transparent"
      description="Browse the catalog and add a flavor to begin an order."
      icon={ShoppingBag}
      title="Your cart is empty"
    />
  )
}
