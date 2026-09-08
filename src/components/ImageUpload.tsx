'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Button } from './ui/Button'

interface ImageUploadProps {
  name: string
  label: string
  value?: string
  onChange: (url: string) => void
  onRemove?: () => void
  accept?: string
  maxSize?: number
  className?: string
  hint?: string
  required?: boolean
  error?: string
}

export function ImageUpload({
  name,
  label,
  value,
  onChange,
  onRemove,
  accept = 'image/jpeg,image/jpg,image/png,image/webp',
  maxSize = 5 * 1024 * 1024,
  className = '',
  hint,
  required = false,
  error,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [imageLoadError, setImageLoadError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (!file) return

    const allowedTypes = accept.split(',').map(type => type.trim())
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Only JPEG, PNG, and WebP are allowed.')
      return
    }

    if (file.size > maxSize) {
      setUploadError(`File too large. Maximum size is ${Math.round(maxSize / (1024 * 1024))}MB.`)
      return
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setImageLoadError(false)
        onChange(result.url)
      } else {
        setUploadError(result.error || 'Failed to upload image')
      }
    } catch {
      setUploadError('Failed to upload image')
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleRemove = () => {
    onChange('')
    onRemove?.()
    setUploadError(null)
    setImageLoadError(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {value ? (
        <div className="relative group">
          <div className="w-full h-[400px] bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
            {imageLoadError ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <ImageIcon className="w-12 h-12 mb-2" />
                <p className="text-sm">Bild konnte nicht geladen werden</p>
                <p className="text-xs mt-1">URL: {`${value}`}</p>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- vendor-supplied remote CDN image, matches AvatarUpload's existing plain-<img> approach
              <img
                src={`${value}?class=thumbnail`}
                alt="Uploaded image"
                className="w-full h-full object-cover"
                onError={() => {
                  setImageLoadError(true)
                }}
                onLoad={() => {
                  setImageLoadError(false)
                }}
              />
            )}
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={openFileDialog}
                className="bg-white"
              >
                <Upload size={16} className="mr-1" />
                Ändern
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleRemove}
                className="bg-white text-red-600 hover:text-red-700"
              >
                <X size={16} className="mr-1" />
                Entfernen
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-amber-400 bg-amber-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${isUploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-amber-600 animate-spin mb-2" />
              <p className="text-sm text-gray-600">Wird hochgeladen...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                <ImageIcon className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                Bild hochladen
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Klicken oder Datei hierher ziehen
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, WebP bis zu {Math.round(maxSize / (1024 * 1024))}MB
              </p>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      <input type="hidden" name={name} value={value || ''} />

      {hint && !uploadError && !error && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}

      {uploadError && (
        <p className="text-xs text-red-600">{uploadError}</p>
      )}

      {error && !uploadError && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}
