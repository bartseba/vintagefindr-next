import 'server-only'
import { randomBytes } from 'crypto'

/**
 * Ported from app/lib/bunny-cdn.server.ts. `uploadImageToBunny` was ported
 * in Phase 5 (avatar uploads). `deleteImageFromBunny`/`purgeCdnCache` were
 * added in sub-phase 6.3 (vendor product CRUD). `uploadImageFromUrl` is
 * added in sub-phase 6.8 (CSV import — downloads vendor-supplied image
 * URLs and re-hosts them on the CDN).
 */

function getRequiredEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue
  if (!value || value === '') {
    console.warn(
      `WARNING: ${key} environment variable is not set. ` +
      `CDN uploads will fail. Set it in your .env file.`
    )
  }
  return value || ''
}

const BUNNY_STORAGE_ZONE = getRequiredEnv('BUNNY_STORAGE_ZONE', 'vintagefinder')
const BUNNY_ACCESS_KEY = getRequiredEnv('BUNNY_ACCESS_KEY')
const BUNNY_CDN_HOSTNAME = 'vintagefinder.b-cdn.net'
const BUNNY_STORAGE_ENDPOINT = `https://storage.bunnycdn.com/${BUNNY_STORAGE_ZONE}`
const BUNNY_API_KEY = getRequiredEnv('BUNNY_API_KEY')

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

export async function uploadImageToBunny(
  file: File,
  folder: string = 'products'
): Promise<UploadResult> {
  try {
    if (!BUNNY_ACCESS_KEY) {
      return { success: false, error: 'Bunny.net access key not configured' }
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' }
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return { success: false, error: 'File too large. Maximum size is 5MB.' }
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const uniqueId = randomBytes(16).toString('hex')
    const timestamp = Date.now()
    const filename = `${timestamp}-${uniqueId}.${fileExtension}`
    const remotePath = `${folder}/${filename}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const uploadResponse = await fetch(`${BUNNY_STORAGE_ENDPOINT}/${remotePath}`, {
      method: 'PUT',
      headers: {
        'AccessKey': BUNNY_ACCESS_KEY,
        'Content-Type': file.type,
        'Content-Length': buffer.length.toString(),
      },
      body: buffer,
    })

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error('Bunny.net upload error:', errorText)
      return { success: false, error: 'Failed to upload image to CDN' }
    }

    const cdnUrl = `https://${BUNNY_CDN_HOSTNAME}/${remotePath}`

    return { success: true, url: cdnUrl }
  } catch (error) {
    console.error('Image upload error:', error)
    return { success: false, error: 'Failed to upload image' }
  }
}

export async function uploadImageFromUrl(
  imageUrl: string,
  folder: string = 'products'
): Promise<UploadResult> {
  try {
    if (!BUNNY_ACCESS_KEY) {
      return { success: false, error: 'Bunny.net access key not configured' }
    }

    const response = await fetch(imageUrl)
    if (!response.ok) {
      return { success: false, error: 'Failed to download image from URL' }
    }

    const contentType = response.headers.get('content-type') || ''
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

    if (!allowedTypes.some(type => contentType.includes(type))) {
      return { success: false, error: 'Invalid image type from URL' }
    }

    let extension = 'jpg'
    if (contentType.includes('png')) extension = 'png'
    else if (contentType.includes('webp')) extension = 'webp'
    else if (contentType.includes('jpeg') || contentType.includes('jpg')) extension = 'jpg'

    const uniqueId = randomBytes(16).toString('hex')
    const timestamp = Date.now()
    const filename = `${timestamp}-${uniqueId}.${extension}`
    const remotePath = `${folder}/${filename}`

    const imageBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(imageBuffer)

    const maxSize = 5 * 1024 * 1024
    if (buffer.length > maxSize) {
      return { success: false, error: 'Image too large. Maximum size is 5MB.' }
    }

    const uploadResponse = await fetch(`${BUNNY_STORAGE_ENDPOINT}/${remotePath}`, {
      method: 'PUT',
      headers: {
        'AccessKey': BUNNY_ACCESS_KEY,
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
      },
      body: buffer,
    })

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error('Bunny.net upload error:', errorText)
      return { success: false, error: 'Failed to upload image to CDN' }
    }

    const cdnUrl = `https://${BUNNY_CDN_HOSTNAME}/${remotePath}`

    return { success: true, url: cdnUrl }
  } catch (error) {
    console.error('Image upload from URL error:', error)
    return { success: false, error: 'Failed to upload image from URL' }
  }
}

async function purgeCdnCache(imageUrl: string): Promise<void> {
  try {
    if (!BUNNY_API_KEY) {
      console.warn('Bunny.net API key not configured, skipping cache purge')
      return
    }

    const purgeResponse = await fetch(`https://api.bunny.net/purge?url=${encodeURIComponent(imageUrl)}`, {
      method: 'POST',
      headers: {
        'AccessKey': BUNNY_API_KEY,
        'Content-Type': 'application/json',
      },
    })

    if (!purgeResponse.ok) {
      console.warn('CDN cache purge failed:', purgeResponse.status)
    } else {
      console.log('Successfully purged CDN cache')
    }
  } catch (error) {
    console.warn('CDN cache purge error:', error)
  }
}

export async function deleteImageFromBunny(imageUrl: string): Promise<boolean> {
  try {
    if (!BUNNY_ACCESS_KEY) {
      console.warn('Bunny.net access key not configured')
      return false
    }

    if (!imageUrl.includes(BUNNY_CDN_HOSTNAME)) {
      console.warn('Image URL does not belong to Bunny CDN:', imageUrl)
      return false
    }

    const urlParts = imageUrl.split(BUNNY_CDN_HOSTNAME)
    if (urlParts.length < 2) {
      console.warn('Invalid CDN URL format:', imageUrl)
      return false
    }

    let remotePath = urlParts[1].startsWith('/') ? urlParts[1].substring(1) : urlParts[1]
    remotePath = remotePath.split('?')[0]

    console.log('Attempting to delete from Bunny CDN:', remotePath)

    const deleteResponse = await fetch(`${BUNNY_STORAGE_ENDPOINT}/${remotePath}`, {
      method: 'DELETE',
      headers: {
        'AccessKey': BUNNY_ACCESS_KEY,
      },
    })

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text()
      console.error('Bunny.net deletion failed:', deleteResponse.status, errorText)
      return false
    }

    console.log('Successfully deleted from Bunny CDN:', remotePath)

    await purgeCdnCache(imageUrl)

    return true
  } catch (error) {
    console.error('Image deletion error:', error)
    return false
  }
}
