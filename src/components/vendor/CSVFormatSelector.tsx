import { Download } from 'lucide-react'

interface CSVFormatSelectorProps {
  csvFormat: 'standard' | 'shopify'
  onFormatChange: (format: 'standard' | 'shopify') => void
  onDownloadSample: (format: 'standard' | 'shopify') => void
}

export function CSVFormatSelector({
  csvFormat,
  onFormatChange,
  onDownloadSample,
}: CSVFormatSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">CSV Format</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-amber-300 transition-colors">
          <label className="flex items-center p-4 cursor-pointer">
            <input
              type="radio"
              name="csvFormat"
              value="standard"
              checked={csvFormat === 'standard'}
              onChange={(e) => onFormatChange(e.target.value as 'standard' | 'shopify')}
              className="mr-3"
            />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Standard CSV</h4>
              <p className="text-sm text-gray-600">Unser Standard-Format mit deutschen Spaltennamen</p>
            </div>
          </label>
          <div className="px-4 pb-4">
            <button
              type="button"
              onClick={() => onDownloadSample('standard')}
              className="flex items-center gap-2 text-sm text-amber-700 hover:text-amber-800 font-medium"
            >
              <Download className="w-4 h-4" />
              Beispiel-CSV herunterladen
            </button>
          </div>
        </div>

        <div className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-amber-300 transition-colors">
          <label className="flex items-center p-4 cursor-pointer">
            <input
              type="radio"
              name="csvFormat"
              value="shopify"
              checked={csvFormat === 'shopify'}
              onChange={(e) => onFormatChange(e.target.value as 'standard' | 'shopify')}
              className="mr-3"
            />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Shopify CSV</h4>
              <p className="text-sm text-gray-600">Direkt aus Shopify exportierte CSV-Datei</p>
            </div>
          </label>
          <div className="px-4 pb-4">
            <button
              type="button"
              onClick={() => onDownloadSample('shopify')}
              className="flex items-center gap-2 text-sm text-amber-700 hover:text-amber-800 font-medium"
            >
              <Download className="w-4 h-4" />
              Beispiel-CSV herunterladen
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
