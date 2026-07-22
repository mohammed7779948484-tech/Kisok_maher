'use client'

import { Link } from '@payloadcms/ui'
import { Layers3, Settings } from 'lucide-react'
import { usePathname } from 'next/navigation'
import React from 'react'

export function AdminNavLinks(): React.ReactElement {
  const pathname = usePathname()

  return (
    <div className="dragon-nav-links">
      <Link
        aria-current={pathname === '/admin/catalog' ? 'page' : undefined}
        className="dragon-nav-link"
        href="/admin/catalog"
      >
        <Layers3 aria-hidden="true" size={18} />
        Catalog
      </Link>
      <Link
        aria-current={pathname === '/admin/globals/site-settings' ? 'page' : undefined}
        className="dragon-nav-link"
        href="/admin/globals/site-settings"
      >
        <Settings aria-hidden="true" size={18} />
        Store Settings
      </Link>
    </div>
  )
}
