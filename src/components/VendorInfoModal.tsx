'use client'

import { X, Store, ShoppingBag, RefreshCw, AlertCircle, Truck } from 'lucide-react'
import { createPortal } from 'react-dom'

interface VendorInfoModalProps {
  isOpen: boolean
  onClose: () => void
  vendorName?: string
  productId?: string
}

export function VendorInfoModal({ isOpen, onClose, vendorName, productId }: VendorInfoModalProps) {
  if (!isOpen) return null

  const displayName = vendorName || 'der Händler'

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
          <h2 className="text-xl font-semibold text-vintage-secondary flex items-center gap-2">
            <Store className="h-5 w-5" />
            Händlerinformation
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
          {/* Vertragspartner */}
          {vendorName && (
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Vertragspartner</p>
              <p className="text-base font-semibold text-gray-900">{vendorName}</p>
            </div>
          )}

          {/* Versandkosten */}
          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
            <Truck className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">Versandkosten</p>
              <p className="text-sm text-gray-700">
                Die Versandkosten werden von {displayName} festgelegt. Details finden Sie im Shop des Händlers.
              </p>
            </div>
          </div>

          {/* Kauf, Zahlung & Versand */}
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <ShoppingBag className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">Kauf, Zahlung & Versand</p>
              <p className="text-sm text-gray-700">
                erfolgen im Shop von {displayName}
              </p>
            </div>
          </div>

          {/* Widerruf, Rückgabe & Gewährleistung */}
          <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
            <RefreshCw className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">Widerruf, Rückgabe & Gewährleistung</p>
              <p className="text-sm text-gray-700 mb-2">
                bestehen – soweit anwendbar – ausschließlich gegenüber {displayName}
              </p>
              <p className="text-sm text-gray-700">
                VintageFindr ist nicht bevollmächtigt, Widerrufe, Rücktrittserklärungen oder Mängelanzeigen im Namen des Händlers entgegenzunehmen.
              </p>
            </div>
          </div>

          {/* Hinweis */}
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <AlertCircle className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong>Hinweis:</strong> Preise und Verfügbarkeit können sich bis zum Besuch des Shops ändern.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex gap-3">
            {/* Secondary: Abbrechen */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Abbrechen
            </button>

            {/* Primary: Zum Shop (nur wenn productId vorhanden) */}
            {productId && (
              <a
                href={`/go/${productId}`}
                target="_blank"
                rel="nofollow sponsored noopener"
                onClick={(e) => {
                  e.stopPropagation()
                  onClose()
                }}
                className="flex-1 px-4 py-2 bg-vintage-primary text-white rounded-lg hover:bg-vintage-hover transition-colors font-medium text-center"
              >
                Zum Shop (externer Link)
              </a>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
