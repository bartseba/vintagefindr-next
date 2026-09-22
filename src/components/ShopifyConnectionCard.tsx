'use client'

import { useState } from 'react'
import { Link2, Link2Off, RefreshCw, ExternalLink, Package, CheckCircle, AlertCircle, Loader2, Unlink } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ShopifyConnectionProps {
  connected: boolean
  shopDomain: string | null
  installedAt: string | null
  syncStatus: string | null
  syncedProducts: number
}

export function ShopifyConnectionCard({
  connected,
  shopDomain,
  installedAt,
  syncStatus,
  syncedProducts,
}: ShopifyConnectionProps) {
  const [isResyncing, setIsResyncing] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false)
  const [resyncMessage, setResyncMessage] = useState<string | null>(null)

  const handleResync = async () => {
    setIsResyncing(true)
    setResyncMessage(null)
    try {
      const response = await fetch(`/api/shopify-resync`, { method: 'POST' })
      const data = await response.json()
      if (response.ok) {
        setResyncMessage('Synchronisierung gestartet. Dies kann einige Minuten dauern.')
      } else {
        setResyncMessage(data.error || 'Fehler beim Starten der Synchronisierung')
      }
    } catch {
      setResyncMessage('Verbindungsfehler. Bitte versuche es erneut.')
    } finally {
      setIsResyncing(false)
    }
  }

  const handleDisconnect = async () => {
    setIsDisconnecting(true)
    setResyncMessage(null)
    try {
      const response = await fetch('/api/shopify-disconnect', { method: 'POST' })
      const data = await response.json()
      if (response.ok) {
        window.location.reload()
      } else {
        setResyncMessage(data.error || 'Fehler beim Trennen der Verbindung')
        setShowDisconnectConfirm(false)
      }
    } catch {
      setResyncMessage('Verbindungsfehler. Bitte versuche es erneut.')
      setShowDisconnectConfirm(false)
    } finally {
      setIsDisconnecting(false)
    }
  }

  const syncStatusLabel: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    synced: { label: 'Synchronisiert', color: 'text-green-700', icon: <CheckCircle size={14} className="text-green-600" /> },
    syncing: { label: 'Wird synchronisiert...', color: 'text-blue-700', icon: <Loader2 size={14} className="text-blue-600 animate-spin" /> },
    error: { label: 'Sync-Fehler', color: 'text-red-700', icon: <AlertCircle size={14} className="text-red-600" /> },
    none: { label: 'Nicht verbunden', color: 'text-gray-500', icon: <Link2Off size={14} className="text-gray-400" /> },
    uninstalled: { label: 'App deinstalliert', color: 'text-orange-700', icon: <AlertCircle size={14} className="text-orange-600" /> },
  }

  const currentStatus = syncStatusLabel[syncStatus || 'none'] || syncStatusLabel.none

  if (!connected) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Link2Off className="w-6 h-6 text-gray-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Shopify Verbindung</h3>
            <p className="text-sm text-gray-600 mb-2">
              Verbinde deinen Shopify Store, um Produkte automatisch zu synchronisieren.
              Nur Produkte mit dem Tag &quot;vintagefindr&quot; werden importiert.
            </p>

            <p className="text-sm text-gray-600">
              Installiere VintageFindr direkt aus dem{' '}
              <a
                href="https://apps.shopify.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Shopify App Store
              </a>{' '}
              — verwende dabei die E-Mail-Adresse deines VintageFindr-Accounts als
              Shop-Kontakt-E-Mail, dann wird dein Shop automatisch zugeordnet.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Link2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Shopify verbunden</h3>
            <p className="text-sm text-gray-600">{shopDomain}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {currentStatus.icon}
          <span className={`text-sm font-medium ${currentStatus.color}`}>
            {currentStatus.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Package size={14} className="text-gray-500" />
            <span className="text-xs text-gray-500 font-medium">Produkte</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{syncedProducts}</p>
        </div>

        {installedAt && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={14} className="text-gray-500" />
              <span className="text-xs text-gray-500 font-medium">Installiert</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {new Date(installedAt).toLocaleDateString('de-DE')}
            </p>
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <ExternalLink size={14} className="text-gray-500" />
            <span className="text-xs text-gray-500 font-medium">Shop</span>
          </div>
          <a
            href={`https://${shopDomain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 truncate block"
          >
            Zum Shop
          </a>
        </div>
      </div>

      {resyncMessage && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">{resyncMessage}</p>
        </div>
      )}

      {showDisconnectConfirm && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 font-medium mb-2">
            Shopify-Verbindung wirklich trennen?
          </p>
          <p className="text-sm text-red-700 mb-3">
            Alle {syncedProducts} Shopify-Produkte und deren Bilder werden unwiderruflich gelöscht.
            Manuell angelegte Produkte bleiben erhalten.
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="danger"
              size="sm"
              onClick={handleDisconnect}
              disabled={isDisconnecting}
            >
              {isDisconnecting ? 'Wird getrennt...' : 'Ja, Verbindung trennen'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDisconnectConfirm(false)}
              disabled={isDisconnecting}
            >
              Abbrechen
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleResync}
          disabled={isResyncing || syncStatus === 'syncing' || isDisconnecting}
        >
          <RefreshCw size={14} className={`mr-2 ${isResyncing ? 'animate-spin' : ''}`} />
          {isResyncing ? 'Wird gestartet...' : 'Neu synchronisieren'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDisconnectConfirm(true)}
          disabled={isResyncing || isDisconnecting || showDisconnectConfirm}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          <Unlink size={14} className="mr-2" />
          Verbindung trennen
        </Button>
      </div>
    </div>
  )
}
