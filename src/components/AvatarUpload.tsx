'use client'

import { useState, useRef } from 'react'
import { Camera, Loader2, X } from 'lucide-react'

interface AvatarUploadProps {
  currentUrl?: string | null
  fallbackText: string
  onUploadComplete: (url: string) => void
  maxSize?: number
}

/**
 * Ported from app/components/AvatarUpload.tsx. Note: `/api/upload-image`
 * (this component's upload target) only authorizes vendors and admins —
 * this component is also mounted on `/profile` for regular (non-vendor)
 * users, who will get a 403 "Forbidden" here. Confirmed this is a
 * pre-existing gap in the Remix original too (not introduced by this
 * port) — preserved as-is since it fails gracefully (shows `uploadError`,
 * doesn't crash), not a live-crash exception this migration's policy
 * would otherwise fix. Worth flagging to product/backend if regular-user
 * avatar upload is actually meant to work.
 */
export function AvatarUpload({
  currentUrl,
  fallbackText,
  onUploadComplete,
  maxSize = 1 * 1024 * 1024
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Nur JPEG, PNG und WebP sind erlaubt')
      return
    }

    if (file.size > maxSize) {
      setUploadError(`Datei zu groß. Maximal ${Math.round(maxSize / (1024 * 1024))}MB`)
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    setIsUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('folder', 'avatars')

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success && result.url) {
        onUploadComplete(result.url)
        URL.revokeObjectURL(objectUrl)
      } else {
        setUploadError(result.error || 'Upload fehlgeschlagen')
        setPreviewUrl(currentUrl || null)
      }
    } catch (error) {
      console.error('Upload error:', error)
      setUploadError('Upload fehlgeschlagen')
      setPreviewUrl(currentUrl || null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    onUploadComplete('')
    setUploadError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-vintage-primary text-white flex items-center justify-center">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- object URL preview + external Bunny CDN URLs, next/image adoption deferred (see migration plan problem #7)
            <img
              src={previewUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white font-medium text-2xl">
              {fallbackText}
            </span>
          )}
        </div>

        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}

        <button
          type="button"
          onClick={openFileDialog}
          disabled={isUploading}
          className="absolute bottom-0 right-0 bg-white border-2 border-gray-200 rounded-full p-2 shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Camera size={16} className="text-gray-600" />
        </button>
      </div>

      <div className="flex-1">
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={openFileDialog}
            disabled={isUploading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? 'Wird hochgeladen...' : 'Foto ändern'}
          </button>

          {previewUrl && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={isUploading}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <X size={16} className="inline mr-1" />
              Entfernen
            </button>
          )}
        </div>

        <p className="text-xs text-gray-500">
          JPG, PNG oder WebP. Max. {Math.round(maxSize / (1024 * 1024))}MB
        </p>

        {uploadError && (
          <p className="text-xs text-red-600 mt-1">{uploadError}</p>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
