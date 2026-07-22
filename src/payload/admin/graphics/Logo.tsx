'use client'

import Image from 'next/image'
import React from 'react'

export function Logo(): React.ReactElement {
  return (
    <div className="flex items-center gap-3 py-2">
      <Image alt="Dragon" className="h-9 w-9 rounded-md object-contain drop-shadow-sm" height={36} src="/logo.png" width={36} />
      <span className="text-xl font-semibold tracking-tight">Dragon</span>
    </div>
  )
}

export default Logo
