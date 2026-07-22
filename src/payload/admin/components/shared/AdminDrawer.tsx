'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import React from 'react'

interface AdminDrawerProps {
  children: React.ReactNode
  description: string
  onOpenChange: (open: boolean) => void
  open: boolean
  title: string
}

export function AdminDrawer({
  children,
  description,
  onOpenChange,
  open,
  title,
}: AdminDrawerProps): React.ReactElement {
  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="dragon-drawer-overlay" />
        <Dialog.Content className="dragon-drawer">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="m-0 text-xl font-semibold">{title}</Dialog.Title>
              <Dialog.Description className="dragon-page-description mt-1">
                {description}
              </Dialog.Description>
            </div>
            <Dialog.Close className="dragon-icon-button" aria-label="Close drawer">
              <X aria-hidden="true" size={18} />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
