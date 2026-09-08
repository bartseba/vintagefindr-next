import { CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

interface ImportResult {
  success: boolean
  imported: number
  drafts: number
  pendingSuggestions: number
  skipped: number
  message: string
}

interface ImportSuccessMessageProps {
  importResult: ImportResult
}

export function ImportSuccessMessage({ importResult }: ImportSuccessMessageProps) {
  return (
    <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <CheckCircle className="w-6 h-6 text-green-600" />
        <div>
          <h3 className="font-medium text-green-900">
            {importResult.message}
          </h3>
          <div className="text-sm text-green-800 space-y-1">
            <p>
              {importResult.imported || 0} Produkte veröffentlicht
            </p>
            {importResult.drafts > 0 && (
              <p>
                {importResult.drafts} Produkte als Entwurf gespeichert (mit Fehlern)
              </p>
            )}
            {importResult.skipped > 0 && (
              <p>
                {importResult.skipped} Zeilen übersprungen
              </p>
            )}
          </div>
          {importResult.drafts > 0 && (
            <div className="mt-3">
              <Link href="/vendor/products?status=draft">
                <Button size="sm" variant="outline">
                  {importResult.drafts} Entwürfe überarbeiten
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
