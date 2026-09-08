'use client'

import { useState, useEffect, useCallback } from 'react'
import { AlertTriangle, Clock, Calendar, CheckCircle, XCircle, Info } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ExtensionEligibility {
  eligible: boolean
  reason?: string
  days_until_eligible?: number
}

interface ExtensionRequestRow {
  status: 'pending' | 'approved' | 'rejected'
  requested_at: string
  extended_until?: string
  admin_notes?: string | null
}

interface ExtensionStatusResponse {
  eligibility?: ExtensionEligibility
  request?: ExtensionRequestRow | null
  error?: string
}

interface ExtensionRequestButtonProps {
  packageId: string
  packageName: string
  validUntil: string
}

export function ExtensionRequestButton({ packageId, packageName, validUntil }: ExtensionRequestButtonProps) {
  const [extensionStatus, setExtensionStatus] = useState<ExtensionStatusResponse | null>(null)
  const [isRequesting, setIsRequesting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchExtensionStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/extension-status?packageId=${packageId}`)
      const data = await response.json()
      setExtensionStatus(data)
    } catch (error) {
      console.error('Error fetching extension status:', error)
    } finally {
      setIsLoading(false)
    }
  }, [packageId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount-time fetch of extension eligibility, matching the pattern already established for AutocompleteSearch/MegaMenu mount-effect data loads
    fetchExtensionStatus()
  }, [fetchExtensionStatus])

  const handleRequestExtension = async () => {
    if (!confirm(`Möchten Sie eine Verlängerung für das ${packageName} Paket beantragen?\n\nBei Genehmigung wird Ihr Paket um 6 Monate ab dem Genehmigungsdatum verlängert.`)) {
      return
    }

    setIsRequesting(true)
    try {
      const response = await fetch('/api/request-extension', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packageId }),
      })

      const data = await response.json()

      if (data.success) {
        alert('Verlängerungsantrag erfolgreich eingereicht! Sie werden benachrichtigt, sobald Ihr Antrag bearbeitet wurde.')
        await fetchExtensionStatus()
      } else {
        alert('Fehler: ' + (data.error || 'Unbekannter Fehler'))
      }
    } catch (error) {
      console.error('Error requesting extension:', error)
      alert('Fehler beim Beantragen der Verlängerung')
    } finally {
      setIsRequesting(false)
    }
  }

  if (isLoading) {
    return null
  }

  // eslint-disable-next-line react-hooks/purity -- countdown display is inherently time-dependent, matching the localStorage-helper precedent from sub-phase 2.3
  const daysUntilExpiry = Math.ceil((new Date(validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  if (extensionStatus?.request) {
    const request = extensionStatus.request

    if (request.status === 'pending') {
      return (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
          <Clock size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-yellow-800">Verlängerungsantrag wird geprüft</p>
            <p className="text-xs text-yellow-700 mt-1">
              Beantragt am {new Date(request.requested_at).toLocaleDateString('de-DE')}
            </p>
          </div>
        </div>
      )
    }

    if (request.status === 'approved') {
      return (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
          <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-green-800">Verlängerung genehmigt</p>
            <p className="text-xs text-green-700 mt-1">
              Neues Ablaufdatum: {request.extended_until ? new Date(request.extended_until).toLocaleDateString('de-DE') : ''}
            </p>
          </div>
        </div>
      )
    }

    if (request.status === 'rejected') {
      return (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2 mb-2">
            <XCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-red-800">Verlängerung abgelehnt</p>
            </div>
          </div>
          {request.admin_notes && (
            <div className="mt-2 p-2 bg-white rounded border border-red-200">
              <p className="text-xs text-gray-700">{request.admin_notes}</p>
            </div>
          )}
        </div>
      )
    }
  }

  const isEligible = extensionStatus?.eligibility?.eligible

  if (daysUntilExpiry > 30) {
    return (
      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
        <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-blue-800">Verlängerungsmöglichkeit</p>
          <p className="text-xs text-blue-700 mt-1">
            Verlängerung um 6 Monate möglich ab: {new Date(new Date(validUntil).getTime() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE')}
          </p>
        </div>
      </div>
    )
  }

  if (isEligible && daysUntilExpiry >= 0 && daysUntilExpiry <= 30) {
    return (
      <div className="mt-3">
        <Button
          onClick={handleRequestExtension}
          disabled={isRequesting}
          size="sm"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Calendar size={14} className="mr-2" />
          {isRequesting ? 'Wird beantragt...' : 'Verlängerung beantragen'}
        </Button>
        <p className="text-xs text-gray-600 mt-2 text-center">
          Bei Genehmigung: +6 Monate ab Genehmigungsdatum
        </p>
      </div>
    )
  }

  if (daysUntilExpiry < 0) {
    return (
      <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-start gap-2">
        <AlertTriangle size={16} className="text-gray-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-800">Paket abgelaufen</p>
          <p className="text-xs text-gray-700 mt-1">
            Bitte buchen Sie ein neues Paket
          </p>
        </div>
      </div>
    )
  }

  return null
}
