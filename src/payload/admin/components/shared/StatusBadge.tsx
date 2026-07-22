import React from 'react'

interface StatusBadgeProps {
  label?: string
  status: string
}

function getTone(status: string): string {
  if (['active', 'completed', 'in-stock'].includes(status)) return 'dragon-badge--success'
  if (['pending', 'processing', 'low-stock'].includes(status)) return 'dragon-badge--warning'
  if (['inactive', 'cancelled', 'out-of-stock'].includes(status)) return 'dragon-badge--danger'
  return ''
}

export function StatusBadge({ label, status }: StatusBadgeProps): React.ReactElement {
  return (
    <span className={`dragon-badge ${getTone(status)}`}>
      {label ?? status.replaceAll('-', ' ')}
    </span>
  )
}
