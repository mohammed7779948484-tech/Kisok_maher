import { LayoutGrid, Table2 } from 'lucide-react'
import React from 'react'

export type ProductsListMode = 'flavors' | 'payload'

export function ProductsListShell({
  customView,
  flavorsHref,
  mode,
  payloadHref,
  payloadView,
}: {
  customView: React.ReactNode
  flavorsHref: string
  mode: ProductsListMode
  payloadHref: string
  payloadView: React.ReactNode
}): React.ReactElement {
  return (
    <>
      <div className="dragon-list-mode-switcher-wrap">
        <nav className="dragon-list-mode-switcher" aria-label="Products list mode">
          <a aria-current={mode === 'flavors' ? 'page' : undefined} href={flavorsHref}><LayoutGrid aria-hidden="true" size={16} />Products &amp; flavors</a>
          <a aria-current={mode === 'payload' ? 'page' : undefined} href={payloadHref}><Table2 aria-hidden="true" size={16} />Payload table</a>
        </nav>
      </div>
      {mode === 'flavors' ? customView : payloadView}
    </>
  )
}
