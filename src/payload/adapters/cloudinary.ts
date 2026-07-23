import type { Adapter } from '@payloadcms/plugin-cloud-storage/types'
import { v2 as cloudinary, type UploadApiOptions, type UploadApiResponse } from 'cloudinary'
import fs from 'node:fs'

import { env } from '@/core/config/env'

cloudinary.config({
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  secure: true,
})

function isAbsoluteURL(value: unknown): value is string {
  return typeof value === 'string' && (value.startsWith('https://') || value.startsWith('http://'))
}

export const cloudinaryAdapter = (): Adapter => {
  return ({ collection, prefix }) => {
    const folder = prefix ? `${prefix}/${collection.slug}` : collection.slug

    return {
      name: 'cloudinary',
      generateURL: ({ data, filename }) => {
        if (isAbsoluteURL(data?.cloudinary_secure_url)) {
          return data.cloudinary_secure_url
        }

        if (isAbsoluteURL(data?.url)) {
          return data.url
        }

        const encodedFilename = filename
          .split('/')
          .map((part) => encodeURIComponent(part))
          .join('/')

        return `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload/${folder}/${encodedFilename}`
      },
      handleDelete: async ({ doc, filename }) => {
        try {
          const storedPublicID = 'cloudinary_public_id' in doc
            ? doc.cloudinary_public_id
            : undefined
          const filenameWithoutExtension = filename.split('.').slice(0, -1).join('.')
          const publicID = typeof storedPublicID === 'string' && storedPublicID
            ? storedPublicID
            : `${folder}/${filenameWithoutExtension}`

          await cloudinary.uploader.destroy(publicID)
        } catch (error) {
          console.error('Cloudinary deletion failed. Continuing Payload operation gracefully.', error)
        }
      },
      handleUpload: async ({ data, file }) => {
        if (!file.tempFilePath && !file.buffer) {
          throw new Error('No buffer or tempFilePath found in file upload')
        }

        const parts = file.filename.split('.')
        const filenameWithoutExtension = parts.length > 1
          ? parts.slice(0, -1).join('.')
          : file.filename

        const options: UploadApiOptions = {
          folder,
          overwrite: true,
          public_id: filenameWithoutExtension,
          resource_type: 'auto',
        }

        const result = await new Promise<UploadApiResponse>((resolve, reject) => {
          const uploadCallback = (error: unknown, response?: UploadApiResponse): void => {
            if (error || !response) {
              reject(error instanceof Error ? error : new Error('Cloudinary upload failed without a result'))
              return
            }
            resolve(response)
          }

          const stream = cloudinary.uploader.upload_stream(options, uploadCallback)

          if (file.tempFilePath) {
            fs.createReadStream(file.tempFilePath).pipe(stream)
          } else {
            stream.end(file.buffer)
          }
        })

        data.cloudinary_public_id = result.public_id
        data.cloudinary_secure_url = result.secure_url
        data.url = result.secure_url

        if (typeof result.width === 'number') data.width = result.width
        if (typeof result.height === 'number') data.height = result.height

        return data
      },
      staticHandler: () => new Response(null, { status: 404, statusText: 'Not Found' }),
    }
  }
}
