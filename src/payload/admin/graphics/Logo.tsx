'use client'

import React from 'react'
import { usePathname } from 'next/navigation'

import { BrandIcon } from '@/shared/ui'

export function Logo(): React.ReactElement | null {
  const pathname = usePathname()

  if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) {
    return null
  }

  return (
    <div className="flex items-center gap-3 py-2">
      <BrandIcon className="h-9 w-9 text-primary" title="kisok" />
      <span className="text-xl font-semibold tracking-tight">kisok</span>
    </div>
  )
}

export default Logo
