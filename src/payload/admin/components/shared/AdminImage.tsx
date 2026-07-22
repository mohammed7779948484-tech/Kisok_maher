import Image from 'next/image'
import React from 'react'

import type { AdminMediaDTO } from '../../types'

interface AdminImageProps {
  className?: string
  fallback: string
  media: AdminMediaDTO | null
  size?: number
}

export function AdminImage({
  className = '',
  fallback,
  media,
  size = 44,
}: AdminImageProps): React.ReactElement {
  if (!media?.url) {
    return (
      <span
        aria-hidden="true"
        className={`inline-flex shrink-0 items-center justify-center rounded-lg border text-xs font-semibold dragon-muted ${className}`}
      >
        {fallback.slice(0, 2).toUpperCase()}
      </span>
    )
  }

  return (
    <Image
      alt={media.alt ?? fallback}
      className={`shrink-0 rounded-lg border object-cover ${className}`}
      height={size}
      src={media.url}
      width={size}
    />
  )
}
