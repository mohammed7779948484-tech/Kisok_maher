'use client'

import { Link } from '@payloadcms/ui'
import { ChevronLeft, ChevronRight, ClipboardList, Search } from 'lucide-react'
import { usePathname } from 'next/navigation'
import React, { useState } from 'react'

import type { OrdersListDTO } from '../../types'
import { StatusBadge } from '../shared/StatusBadge'

function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Unknown' : new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export function OrdersTableClient({ data }: { data: OrdersListDTO }): React.ReactElement {
  const pathname = usePathname()
  const [isNavigating, setIsNavigating] = useState(false)

  function navigate(updates: Record<string, string>): void {
    const values = { ...data.filters, ...updates }
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(values)) if (value && !(key === 'page' && String(value) === '1')) params.set(key, String(value))
    setIsNavigating(true)
    window.location.assign(`${pathname}?${params.toString()}`)
  }

  return <div className="relative grid gap-4">
    {isNavigating ? <div className="dragon-loading" role="status">Loading orders…</div> : null}
    <form className="flex flex-col gap-3 sm:flex-row" onSubmit={(event) => { event.preventDefault(); navigate({ page: '1', search: String(new FormData(event.currentTarget).get('search') ?? '') }) }}>
      <label className="relative flex-1"><span className="sr-only">Search order number</span><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-3" size={17} /><input className="dragon-control pl-10" defaultValue={data.filters.search} name="search" placeholder="Search order number…" /></label>
      <select aria-label="Filter orders by status" className="dragon-control sm:max-w-52" onChange={(event) => navigate({ page: '1', status: event.target.value })} value={data.filters.status}><option value="">All statuses</option><option value="pending">Pending</option><option value="processing">Processing</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select>
      <button className="dragon-button" type="submit">Search</button>
    </form>
    {data.docs.length ? <div className="dragon-table-wrap"><table className="dragon-table"><thead><tr><th>Order number</th><th>Created</th><th>Status</th><th>Items</th><th className="text-right">Action</th></tr></thead><tbody>{data.docs.map((order) => <tr className="dragon-row" key={String(order.id)}><td className="font-medium">#{order.orderNumber}</td><td className="dragon-muted">{formatDate(order.createdAt)}</td><td><StatusBadge status={order.status} /></td><td>{order.itemCount}</td><td className="text-right"><Link className="dragon-button min-h-8 px-3 py-1" href={`/admin/collections/orders/${order.id}`}>View order</Link></td></tr>)}</tbody></table></div> : <div className="dragon-empty"><ClipboardList aria-hidden="true" size={30} /><p className="m-0 font-semibold">No orders match these filters</p></div>}
    <footer className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="dragon-muted m-0 text-sm">{data.totalDocs} order{data.totalDocs === 1 ? '' : 's'} · Page {data.page} of {Math.max(1, data.totalPages)}</p><div className="flex gap-2"><button className="dragon-button" disabled={!data.hasPrevPage} onClick={() => navigate({ page: String(data.page - 1) })} type="button"><ChevronLeft aria-hidden="true" size={16} />Previous</button><button className="dragon-button" disabled={!data.hasNextPage} onClick={() => navigate({ page: String(data.page + 1) })} type="button">Next<ChevronRight aria-hidden="true" size={16} /></button></div></footer>
  </div>
}
