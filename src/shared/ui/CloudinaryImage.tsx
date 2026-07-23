'use client'

import Image, { type ImageProps } from 'next/image'
import { CldImage, type CldImageProps } from 'next-cloudinary'

export type CloudinaryImageProps = Omit<ImageProps, 'src'> & {
  src?: string | null
  publicId?: string | null
  /** Optional Cloudinary-specific props such as transformations. */
  cldProps?: Omit<CldImageProps, 'src' | 'alt' | 'width' | 'height'>
}

function isAbsoluteURL(value: string | null | undefined): value is string {
  return Boolean(value && (value.startsWith('https://') || value.startsWith('http://')))
}

/**
 * Universal image wrapper.
 * Uses persisted direct Cloudinary URLs first, then falls back to a public ID,
 * and finally supports local or Payload-relative image URLs.
 */
export function CloudinaryImage({ src, publicId, alt, cldProps, ...props }: CloudinaryImageProps) {
  if (isAbsoluteURL(src)) {
    return (
      <Image
        src={src}
        alt={alt || ''}
        {...props}
      />
    )
  }

  if (publicId) {
    return (
      <CldImage
        src={publicId}
        alt={alt || ''}
        width={props.width as number}
        height={props.height as number}
        format="auto"
        quality="auto"
        {...cldProps}
        {...props}
      />
    )
  }

  if (src) {
    return (
      <Image
        src={src}
        alt={alt || ''}
        {...props}
      />
    )
  }

  return null
}
