'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, X, ArrowLeft, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { reviewSuggestion } from '@/app/admin/suggestions/actions'

export interface SuggestionItem {
  id: string
  label: string
  createdAt: string
  reviewedAt: string | null
  vendorStoreName: string | null
  vendorEmail: string | null
}

interface AdminSuggestionsViewProps {
  brandSuggestions: SuggestionItem[]
  categorySuggestions: SuggestionItem[]
  sizeSuggestions: SuggestionItem[]
  currentStatus: string
  counts: { pending: number; approved: number; rejected: number }
}

const statusLabels: Record<string, string> = {
  pending: 'Ausstehend',
  approved: 'Akzeptiert',
  rejected: 'Abgelehnt',
}

const statusLabelsLower: Record<string, string> = {
  pending: 'ausstehend',
  approved: 'akzeptiert',
  rejected: 'abgelehnt',
}

const formatDateTime = (value: string) =>
  `${new Date(value).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}, ${new Date(value).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`

export function AdminSuggestionsView({
  brandSuggestions,
  categorySuggestions,
  sizeSuggestions,
  currentStatus,
  counts,
}: AdminSuggestionsViewProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const totalCurrent = brandSuggestions.length + categorySuggestions.length + sizeSuggestions.length

  const handleReview = (suggestionId: string, type: 'brand' | 'category' | 'size', decision: 'approve' | 'reject') => {
    startTransition(async () => {
      await reviewSuggestion(suggestionId, type, decision)
      router.refresh()
    })
  }

  const renderSection = (title: string, type: 'brand' | 'category' | 'size', suggestions: SuggestionItem[]) => {
    if (suggestions.length === 0) return null

    return (
      <div key={type} className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600 mt-1">{suggestions.length} {statusLabelsLower[currentStatus]}</p>
        </div>
        <div className="divide-y divide-gray-100">
          {suggestions.map((suggestion) => {
            const isRowPending = currentStatus === 'pending'
            return (
              <div key={suggestion.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-medium text-gray-900">
                        {suggestion.label}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                        {type === 'brand' ? 'Marke' : type === 'category' ? 'Kategorie' : 'Größe'}
                      </span>
                      {!isRowPending && (
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          currentStatus === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {currentStatus === 'approved' ? 'Akzeptiert' : 'Abgelehnt'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>
                        <span className="font-medium">Shop:</span> {suggestion.vendorStoreName}
                      </span>
                      <span>•</span>
                      <span>
                        <span className="font-medium">Email:</span> {suggestion.vendorEmail}
                      </span>
                      <span>•</span>
                      <span>
                        <span className="font-medium">Eingereicht:</span> {formatDateTime(suggestion.createdAt)}
                      </span>
                    </div>
                    {!isRowPending && suggestion.reviewedAt && (
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span>
                          <span className="font-medium">Geprüft:</span> {formatDateTime(suggestion.reviewedAt)}
                        </span>
                      </div>
                    )}
                  </div>

                  {isRowPending && (
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isPending}
                        onClick={() => handleReview(suggestion.id, type, 'approve')}
                        className="border-green-200 text-green-700 hover:bg-green-50"
                      >
                        <Check size={16} className="mr-1" />
                        Akzeptieren
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isPending}
                        onClick={() => handleReview(suggestion.id, type, 'reject')}
                        className="border-red-200 text-red-700 hover:bg-red-50"
                      >
                        <X size={16} className="mr-1" />
                        Ablehnen
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft size={20} />
                <span>Zurück</span>
              </Link>
              <div className="border-l border-gray-300 h-6" />
              <h1 className="text-xl font-semibold text-gray-900">Vorschläge prüfen</h1>
            </div>
            {counts.pending > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                <AlertCircle size={16} />
                {counts.pending} ausstehend
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-1 inline-flex">
          <Link
            href="/admin/suggestions?status=pending"
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentStatus === 'pending' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Ausstehend
            {counts.pending > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                currentStatus === 'pending' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
              }`}>
                {counts.pending}
              </span>
            )}
          </Link>
          <Link
            href="/admin/suggestions?status=approved"
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentStatus === 'approved' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Akzeptiert
            {counts.approved > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                currentStatus === 'approved' ? 'bg-white/20 text-white' : 'bg-green-100 text-green-800'
              }`}>
                {counts.approved}
              </span>
            )}
          </Link>
          <Link
            href="/admin/suggestions?status=rejected"
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentStatus === 'rejected' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Abgelehnt
            {counts.rejected > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                currentStatus === 'rejected' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-800'
              }`}>
                {counts.rejected}
              </span>
            )}
          </Link>
        </div>

        {totalCurrent === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Keine Vorschläge</h2>
            <p className="text-gray-600">Es gibt keine {statusLabels[currentStatus].toLowerCase()} Vorschläge.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {renderSection('Marken-Vorschläge', 'brand', brandSuggestions)}
            {renderSection('Kategorie-Vorschläge', 'category', categorySuggestions)}
            {renderSection('Größen-Vorschläge', 'size', sizeSuggestions)}
          </div>
        )}
      </div>
    </div>
  )
}
