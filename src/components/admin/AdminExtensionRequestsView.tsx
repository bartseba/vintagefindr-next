'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Store,
  Calendar,
  MousePointerClick,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

export interface ExtensionRequestItem {
  id: string
  packageId: string
  vendorId: string
  requestedAt: string
  status: string
  processedAt: string | null
  adminNotes: string | null
  extendedUntil: string | null
  vendor: {
    storeName: string
    firstName: string
    lastName: string
    email: string
  }
  package: {
    packageName: string
    clicksTotal: number
    clicksRemaining: number
    clicksUsed: number
    validUntil: string
    status: string
  }
}

interface AdminExtensionRequestsViewProps {
  extensionRequests: ExtensionRequestItem[]
  stats: { total: number; pending: number; approved: number; rejected: number }
  filters: { status: string }
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })

const formatDateTime = (value: string) =>
  `${formatDate(value)} ${new Date(value).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`

export function AdminExtensionRequestsView({ extensionRequests, stats, filters }: AdminExtensionRequestsViewProps) {
  const router = useRouter()
  const [selectedRequest, setSelectedRequest] = useState<ExtensionRequestItem | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFilterChange = (status: string) => {
    router.push(status === 'all' ? '/admin/extension-requests' : `/admin/extension-requests?status=${status}`)
  }

  const handleApprove = async (request: ExtensionRequestItem) => {
    // eslint-disable-next-line react-hooks/purity -- confirmation dialog text computed at click-time, not during render; matches the ExtensionRequestButton precedent from sub-phase 6.2
    const newExpiryLabel = formatDate(new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString())
    if (!confirm(`Verlängerung für ${request.vendor.storeName} genehmigen?\n\nNeues Ablaufdatum: ${newExpiryLabel}`)) {
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch('/api/approve-extension', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: request.id }),
      })

      const data = await response.json()

      if (data.success) {
        alert('Verlängerung erfolgreich genehmigt')
        router.refresh()
      } else {
        alert('Fehler: ' + (data.error || 'Unbekannter Fehler'))
      }
    } catch (error) {
      console.error('Error approving extension:', error)
      alert('Fehler beim Genehmigen der Verlängerung')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedRequest) return

    if (!rejectReason.trim()) {
      alert('Bitte geben Sie eine Begründung ein')
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch('/api/reject-extension', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: selectedRequest.id, reason: rejectReason }),
      })

      const data = await response.json()

      if (data.success) {
        alert('Verlängerung erfolgreich abgelehnt')
        setShowRejectModal(false)
        setSelectedRequest(null)
        setRejectReason('')
        router.refresh()
      } else {
        alert('Fehler: ' + (data.error || 'Unbekannter Fehler'))
      }
    } catch (error) {
      console.error('Error rejecting extension:', error)
      alert('Fehler beim Ablehnen der Verlängerung')
    } finally {
      setIsProcessing(false)
    }
  }

  const openRejectModal = (request: ExtensionRequestItem) => {
    setSelectedRequest(request)
    setRejectReason('')
    setShowRejectModal(true)
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    }
    const labels: Record<string, string> = {
      pending: 'Ausstehend',
      approved: 'Genehmigt',
      rejected: 'Abgelehnt',
    }
    const icons: Record<string, React.ReactNode> = {
      pending: <Clock size={14} />,
      approved: <CheckCircle size={14} />,
      rejected: <XCircle size={14} />,
    }

    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${styles[status] || ''}`}>
        {icons[status]}
        {labels[status] || status}
      </span>
    )
  }

  const getFilterButtonClass = (filter: string) => {
    const isActive = filters.status === filter
    return `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
      ? 'bg-gray-900 text-white'
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
              >
                <ArrowLeft size={20} />
                <span className="font-medium">Verlängerungsanträge</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Paket-Verlängerungen</h1>
          <p className="text-gray-600">Verwalten Sie Verlängerungsanträge für Vendor-Pakete</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</div>
            <div className="text-sm text-gray-600">Gesamt</div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="text-3xl font-bold text-yellow-600 mb-1">{stats.pending}</div>
            <div className="text-sm text-gray-600">Ausstehend</div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="text-3xl font-bold text-green-600 mb-1">{stats.approved}</div>
            <div className="text-sm text-gray-600">Genehmigt</div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="text-3xl font-bold text-red-600 mb-1">{stats.rejected}</div>
            <div className="text-sm text-gray-600">Abgelehnt</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Status filtern:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => handleFilterChange('all')} className={getFilterButtonClass('all')}>
              Alle
            </button>
            <button onClick={() => handleFilterChange('pending')} className={getFilterButtonClass('pending')}>
              Ausstehend ({stats.pending})
            </button>
            <button onClick={() => handleFilterChange('approved')} className={getFilterButtonClass('approved')}>
              Genehmigt ({stats.approved})
            </button>
            <button onClick={() => handleFilterChange('rejected')} className={getFilterButtonClass('rejected')}>
              Abgelehnt ({stats.rejected})
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {extensionRequests.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Keine Verlängerungsanträge gefunden</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paket
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Klicks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aktuelles Ablaufdatum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Antragsdatum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {extensionRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                            <Store size={16} className="text-gray-400" />
                            {request.vendor.storeName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.vendor.firstName} {request.vendor.lastName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Package size={16} className="text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{request.package.packageName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="flex items-center gap-2 text-gray-900">
                            <MousePointerClick size={14} className="text-gray-400" />
                            <span className="font-medium">{request.package.clicksRemaining}</span>
                            <span className="text-gray-500">/ {request.package.clicksTotal}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {request.package.clicksUsed} verbraucht
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {formatDate(request.package.validUntil)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDateTime(request.requestedAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                        {request.status === 'approved' && request.extendedUntil && (
                          <div className="text-xs text-gray-500 mt-1">
                            Bis: {formatDate(request.extendedUntil)}
                          </div>
                        )}
                        {request.status === 'rejected' && request.adminNotes && (
                          <div className="text-xs text-red-600 mt-1 max-w-xs">
                            {request.adminNotes}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {request.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(request)}
                              disabled={isProcessing}
                              className="text-green-600 border-green-600 hover:bg-green-50"
                            >
                              <CheckCircle size={14} className="mr-1" />
                              Genehmigen
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openRejectModal(request)}
                              disabled={isProcessing}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              <XCircle size={14} className="mr-1" />
                              Ablehnen
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle size={24} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Verlängerung ablehnen</h3>
                <p className="text-sm text-gray-600">{selectedRequest.vendor.storeName}</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Begründung <span className="text-red-600">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows={4}
                placeholder="Bitte geben Sie eine Begründung für die Ablehnung ein..."
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectModal(false)
                  setSelectedRequest(null)
                  setRejectReason('')
                }}
                disabled={isProcessing}
                className="flex-1"
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleReject}
                disabled={isProcessing || !rejectReason.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {isProcessing ? 'Wird abgelehnt...' : 'Ablehnen'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
