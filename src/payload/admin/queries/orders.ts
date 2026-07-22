import type { Payload, TypedUser, Where } from 'payload'

import { asRecord, readID, readString } from '../lib/data'
import type { OrderListItemDTO, OrdersListDTO } from '../types'

interface OrdersListArgs {
  payload: Payload
  searchParams: Record<string, string | string[] | undefined> | undefined
  user: TypedUser
}

function getParam(params: OrdersListArgs['searchParams'], key: string): string {
  const value = params?.[key]
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '')
}

export async function getOrdersListData({ payload, searchParams, user }: OrdersListArgs): Promise<OrdersListDTO> {
  const filters = {
    page: Math.max(1, Number.parseInt(getParam(searchParams, 'page') || '1', 10) || 1),
    search: getParam(searchParams, 'search').trim(),
    status: getParam(searchParams, 'status'),
  }
  const clauses: Where[] = []
  if (filters.search) clauses.push({ order_number: { contains: filters.search } })
  if (['pending', 'processing', 'completed', 'cancelled'].includes(filters.status)) {
    clauses.push({ status: { equals: filters.status } })
  }
  const access = { overrideAccess: false as const, user }
  const result = await payload.find({
    ...access,
    collection: 'orders',
    depth: 0,
    limit: 20,
    page: filters.page,
    select: { createdAt: true, order_number: true, status: true },
    sort: '-createdAt',
    where: clauses.length ? { and: clauses } : {},
  })
  const orderIDs = result.docs.map((doc) => readID(doc)).filter((id): id is number | string => id !== null)
  const items = orderIDs.length ? await payload.find({
    ...access,
    collection: 'order_items',
    depth: 0,
    limit: Math.max(100, orderIDs.length * 20),
    select: { order: true },
    where: { order: { in: orderIDs } },
  }) : { docs: [] }
  const itemCounts = new Map<string, number>()
  for (const item of items.docs) {
    const id = readID(asRecord(item)?.order)
    if (id !== null) itemCounts.set(String(id), (itemCounts.get(String(id)) ?? 0) + 1)
  }
  const docs: OrderListItemDTO[] = result.docs.flatMap((doc) => {
    const record = asRecord(doc)
    const id = readID(doc)
    if (!record || id === null) return []
    return [{
      createdAt: readString(record.createdAt),
      id,
      itemCount: itemCounts.get(String(id)) ?? 0,
      orderNumber: readString(record.order_number, String(id)),
      status: readString(record.status, 'pending'),
    }]
  })
  return {
    docs,
    filters,
    hasNextPage: result.hasNextPage,
    hasPrevPage: result.hasPrevPage,
    page: result.page ?? filters.page,
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
  }
}
