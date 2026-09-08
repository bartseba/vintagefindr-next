'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Shopify-Domain pflegen
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="shopify-domain" className="block text-sm font-medium text-gray-700 mb-2">
              Shopify-Domain
            </label>
            <Input
              id="shopify-domain"
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="shop-name.myshopify.com"
              className={error ? 'border-red-500' : ''}
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              Wichtig: Shopify Domain verwenden
            </h3>
            <p className="text-sm text-blue-800 mb-2">
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
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-200">
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
  )
}
