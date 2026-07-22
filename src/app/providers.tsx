/**
 * Providers Wrapper - Root application providers
 */

'use client'

import { MotionConfig } from 'framer-motion'
import type { ReactNode } from 'react'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps): React.ReactElement {
  return (
    <MotionConfig reducedMotion="user">
      {children}
    </MotionConfig>
  )
}
