import { CheckCircle } from 'lucide-react'
import type { ImportError } from '@/lib/csv'

interface DryRunData {
  validRows: number
  errors: ImportError[]
  filename: string
  format: string
  totalRows: number
}

interface ImportDryRunResultsProps {
  dryRun: DryRunData
}

export function ImportDryRunResults({ dryRun }: ImportDryRunResultsProps) {
  const actualErrors = dryRun.errors.filter((e) => !e.type || e.type === 'error')
  const warnings = dryRun.errors.filter((e) => e.type === 'warning')
  const infos = dryRun.errors.filter((e) => e.type === 'info')

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center gap-3">
        <CheckCircle className="w-6 h-6 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Validierung abgeschlossen ({dryRun.format === 'shopify' ? 'Shopify' : 'Standard'} Format)
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-2xl font-bold text-slate-600">
            {dryRun.totalRows || 0}
          </p>
          <p className="text-sm text-slate-800">Zeilen gesamt</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-2xl font-bold text-green-600">
            {dryRun.validRows || 0}
          </p>
          <p className="text-sm text-green-800">Gültige Zeilen</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <p className="text-2xl font-bold text-red-600">
            {actualErrors.length}
          </p>
          <p className="text-sm text-red-800">Fehler</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-2xl font-bold text-blue-600">
            {infos.length}
          </p>
          <p className="text-sm text-blue-800">Info</p>
        </div>
      </div>

      {dryRun.errors.length > 0 && (
        <div className="space-y-4">
          {actualErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-900 mb-3">Fehler ({actualErrors.length}):</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {actualErrors.map((error, index) => (
                  <div key={index} className="text-sm text-red-800">
                    <span className="font-medium">Zeile {error.row}:</span>
                    <span className="text-red-600"> {error.field}</span> - {error.message}
                    {error.value && (
                      <span className="text-red-500 ml-2">(&quot;{error.value}&quot;)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-3">Warnungen ({warnings.length}):</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {warnings.map((warning, index) => (
                  <div key={index} className="text-sm text-yellow-800">
                    <span className="font-medium">Zeile {warning.row}:</span>
                    <span className="text-yellow-600"> {warning.field}</span> - {warning.message}
                    {warning.value && (
                      <span className="text-yellow-500 ml-2">(&quot;{warning.value}&quot;)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {infos.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3">Informationen ({infos.length}):</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {infos.map((info, index) => (
                  <div key={index} className="text-sm text-blue-800">
                    <span className="font-medium">Zeile {info.row}:</span>
                    <span className="text-blue-600"> {info.field}</span> - {info.message}
                    {info.value && (
                      <span className="text-blue-500 ml-2">(&quot;{info.value}&quot;)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {dryRun.errors.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h4 className="font-medium text-green-900">Validierung erfolgreich!</h4>
              <p className="text-sm text-green-800">
                Alle {dryRun.validRows || 0} Zeilen sind gültig und können importiert werden.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
