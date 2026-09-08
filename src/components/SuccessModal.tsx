'use client'

import { useEffect } from 'react'
import { CheckCircle, X } from 'lucide-react'

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message?: string
}

export function SuccessModal({
  isOpen,
  onClose,
  title = "Nachricht erfolgreich versendet",
  message = "Wir melden uns innerhalb von 48 Stunden bei Ihnen."
}: SuccessModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Schließen"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {title}
          </h2>

          <p className="text-gray-600 mb-6">
            {message}
          </p>

          <button
            onClick={onClose}
            className="w-full bg-vintage-primary hover:bg-vintage-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  )
}
