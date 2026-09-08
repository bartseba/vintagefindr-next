import { forwardRef } from 'react'
import { Upload, FileText } from 'lucide-react'

interface CSVUploadZoneProps {
  selectedFile: File | null
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export const CSVUploadZone = forwardRef<HTMLInputElement, CSVUploadZoneProps>(
  function CSVUploadZone({ selectedFile, onFileSelect }, ref) {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
      <input
        ref={ref}
        type="file"
        name="csvFile"
        accept=".csv"
        onChange={onFileSelect}
        className="hidden"
        id="csv-file-input"
        required
      />

      {!selectedFile ? (
        <label htmlFor="csv-file-input" className="cursor-pointer block">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            CSV-Datei auswählen
          </h3>
          <p className="text-gray-600 mb-4">
            Klicken Sie hier oder ziehen Sie eine CSV-Datei hierher
          </p>
          <span className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors">
            Datei auswählen
          </span>
        </label>
      ) : (
        <div className="space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {selectedFile.name}
            </h3>
            <p className="text-gray-600">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <label htmlFor="csv-file-input" className="inline-block cursor-pointer">
            <span className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors">
              Andere Datei wählen
            </span>
          </label>
        </div>
      )}
    </div>
  )
})
