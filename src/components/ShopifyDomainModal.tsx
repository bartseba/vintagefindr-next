'use client'

import { useState, useEffect } from 'react'
import { X, Store } from 'lucide-react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'

interface ShopifyDomainModalProps {
  isOpen: boolean
  onClose: () => void
  currentDomain?: string | null
  onSave: (domain: string) => Promise<void>
}

export function ShopifyDomainModal({ isOpen, onClose, currentDomain, onSave }: ShopifyDomainModalProps) {
  const [domain, setDomain] = useState(currentDomain || '')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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

  const normalizeDomain = (input: string): string => {
    let normalized = input.trim().toLowerCase()
    normalized = normalized.replace(/^https?:\/\//, '')
    normalized = normalized.replace(/\/$/, '')
    return normalized
  }

  const validateDomain = (input: string): boolean => {
    if (!input || input.trim() === '') {
      setError('Bitte geben Sie eine Domain ein')
      return false
    }

    const normalized = normalizeDomain(input)
    const shopifyPattern = /^[a-z0-9][a-z0-9-]*\.(myshopify\.com|shopifypreview\.com)$/i

    if (!shopifyPattern.test(normalized)) {
      setError('Bitte verwenden Sie Ihre .myshopify.com oder .shopifypreview.com Domain')
      return false
    }

    setError('')
    return true
  }

  const handleSave = async () => {
    if (!validateDomain(domain)) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const normalizedDomain = normalizeDomain(domain)
      await onSave(normalizedDomain)
      onClose()
    } catch {
      setError('Fehler beim Speichern der Domain. Bitte versuchen Sie es erneut.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setDomain(currentDomain || '')
    setError('')
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[200] backdrop-blur-sm"
        onClick={(e) => { e.stopPropagation(); handleClose() }}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="inset-0 overflow-y-auto">
        <div className="flex fixed z-[201] top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 items-center justify-center p-4">
          <div
            className="w-[calc(100vw_-_50px)] sm:max-w-[450px] relative bg-white rounded-2xl shadow-2xl p-8 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-vintage-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Shopify-Domain pflegen
              </h2>
              <p className="text-gray-600 text-sm">
                Verbinden Sie Ihren Shopify-Shop
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Form */}
            <div className="space-y-4">
              <div>
                <Input
                  id="shopify-domain"
                  type="text"
                  label="Shopify-Domain"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="shop-name.myshopify.com"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800 mb-2">
                  Für die Shopify App Integration benötigen Sie Ihre originale Shopify Domain, nicht Ihre Custom Domain.
                </p>
                <div className="bg-white border border-blue-300 rounded p-2 mb-2">
                  <p className="text-xs font-mono text-green-700">✓ Richtig: ihr-shop.myshopify.com</p>
                  <p className="text-xs font-mono text-green-700">✓ Richtig (Test): d6a1t3-q1.shopifypreview.com</p>
                  <p className="text-xs font-mono text-red-700">✗ Falsch: meinshop.de</p>
                  <p className="text-xs font-mono text-red-700">✗ Falsch: https://shop.myshopify.com/</p>
                </div>
                <p className="text-xs text-blue-700">
                  Sie finden Ihre Shopify Domain in Ihrem Shopify Admin unter Einstellungen → Domains.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Abbrechen
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  isLoading={isLoading}
                  className="flex-1"
                >
                  Speichern
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
