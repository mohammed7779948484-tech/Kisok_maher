'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { Check, ImageIcon, Search, X } from 'lucide-react'
import React, { useMemo, useState } from 'react'

import type { AdminMediaDTO } from '../../types'
import { AdminImage } from './AdminImage'

interface AdminMediaPickerDialogProps {
  description?: string
  media: AdminMediaDTO[]
  onOpenChange: (open: boolean) => void
  onSelect: (mediaID: string) => void
  open: boolean
  selectedMediaID: string
  title?: string
}

function getMediaLabel(item: AdminMediaDTO): string {
  return item.alt || item.filename || `Media ${item.id}`
}

export function AdminMediaPickerDialog({
  description = 'Select one image from Payload Media.',
  media,
  onOpenChange,
  onSelect,
  open,
  selectedMediaID,
  title = 'Choose image',
}: AdminMediaPickerDialogProps): React.ReactElement {
  const [search, setSearch] = useState('')
  const filteredMedia = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return media
    return media.filter((item) => getMediaLabel(item).toLowerCase().includes(query))
  }, [media, search])

  function selectMedia(mediaID: string): void {
    onSelect(mediaID)
    onOpenChange(false)
  }

  return (
    <Dialog.Root
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen)
        if (!nextOpen) setSearch('')
      }}
      open={open}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="dragon-drawer-overlay" />
        <Dialog.Content className="dragon-media-dialog">
          <header className="dragon-media-dialog__header">
            <div>
              <Dialog.Title className="m-0 text-xl font-semibold">{title}</Dialog.Title>
              <Dialog.Description className="dragon-page-description mt-1">
                {description}
              </Dialog.Description>
            </div>
            <Dialog.Close aria-label="Close media library" className="dragon-icon-button">
              <X aria-hidden="true" size={18} />
            </Dialog.Close>
          </header>

          <div className="dragon-media-dialog__toolbar">
            <label className="relative block">
              <span className="sr-only">Search media</span>
              <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 dragon-muted" size={17} />
              <input
                className="dragon-control pl-10"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by filename or alt text…"
                value={search}
              />
            </label>
            <p className="dragon-muted m-0 text-sm tabular-nums">
              {filteredMedia.length} of {media.length} images
            </p>
          </div>

          <div className="dragon-media-dialog__body">
            {filteredMedia.length ? (
              <div aria-label="Select media image" className="dragon-media-grid" role="radiogroup">
                {filteredMedia.map((item) => {
                  const mediaID = String(item.id)
                  const selected = mediaID === selectedMediaID
                  const label = getMediaLabel(item)

                  return (
                    <button
                      aria-checked={selected}
                      aria-label={`Use ${label}`}
                      className="dragon-media-card"
                      key={mediaID}
                      onClick={() => selectMedia(mediaID)}
                      role="radio"
                      type="button"
                    >
                      <span className="dragon-media-card__preview">
                        <AdminImage className="h-full w-full" fallback={label} media={item} size={180} />
                        {selected ? <span className="dragon-media-card__check"><Check aria-hidden="true" size={14} /></span> : null}
                      </span>
                      <span className="block truncate px-2 py-2 text-left text-xs font-medium" title={label}>{label}</span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="dragon-empty">
                <ImageIcon aria-hidden="true" size={30} />
                <p className="m-0 font-semibold">{media.length ? 'No media matches your search' : 'No media uploaded yet'}</p>
                <p className="dragon-muted m-0 text-sm">{media.length ? 'Try another filename or alt text.' : 'Upload images to Payload Media, then return here to select one.'}</p>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
