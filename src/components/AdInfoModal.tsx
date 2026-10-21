'use client'

import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

interface AdInfoModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AdInfoModal({ isOpen, onClose }: AdInfoModalProps) {
  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={(e) => {
        e.stopPropagation()
        onClose()
      }}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-vintage-secondary">
            Gesponserte Produkte
          </h2>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Schließen"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-700">
            Wir arbeiten mit Markenpartnern zusammen, um dir Inhalte zu präsentieren, die für dich relevant und interessant sein könnten.
          </p>
          <p className="text-sm text-gray-700">
            Diese Produktplatzierung ist Teil einer bezahlten Kooperation mit unseren Partnermarken und -shops.
          </p>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
