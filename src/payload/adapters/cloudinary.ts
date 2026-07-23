import type { Adapter } from '@payloadcms/plugin-cloud-storage/types'
import { v2 as cloudinary, type UploadApiOptions, type UploadApiResponse } from 'cloudinary'
import fs from 'fs'

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
          const record = doc as Record<string, unknown>
          const storedPublicID = record.cloudinary_public_id
          const filenameWithoutExtension = filename.split('.').slice(0, -1).join('.')
          const publicID = typeof storedPublicID === 'string' && storedPublicID
            ? storedPublicID
            : `${folder}/${filenameWithoutExtension}`

          await cloudinary.uploader.destroy(publicID)
        } catch (error) {
          console.error('Cloudinary deletion failed. Continuing Payload operation gracefully.', error)
        }
      },
      handleUpload: ({ data, file }) => {
        return new Promise<Record<string, unknown>>((resolve, reject) => {
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

          const uploadCallback = (error: unknown, result?: UploadApiResponse): void => {
            if (error || !result) {
              reject(error instanceof Error ? error : new Error('Cloudinary upload failed without a result'))
              return
            }

            const uploadData = data as Record<string, unknown>
            uploadData.cloudinary_public_id = result.public_id
            uploadData.cloudinary_secure_url = result.secure_url
            uploadData.url = result.secure_url

            if (typeof result.width === 'number') uploadData.width = result.width
            if (typeof result.height === 'number') uploadData.height = result.height

            resolve(uploadData)
          }

          const stream = cloudinary.uploader.upload_stream(options, uploadCallback)

          if (file.tempFilePath) {
            fs.createReadStream(file.tempFilePath).pipe(stream)
            return
          }

          if (file.buffer) {
            stream.end(file.buffer)
            return
          }

          stream.destroy(new Error('No buffer or tempFilePath found in file upload'))
          reject(new Error('No buffer or tempFilePath found in file upload'))
        })
      },
      staticHandler: () => new Response(null, { status: 404, statusText: 'Not Found' }),
    }
  }
}
