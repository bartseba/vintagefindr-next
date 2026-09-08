import { CheckCircle, AlertCircle, FileText, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import ButtonPrimary from '@/components/ui/ButtonPrimary'

export interface ImportHistoryItem {
  id: string
  filename: string
  date: string
  rows: number
  successful: number
  errors: number
  status: 'completed' | 'completed_with_errors' | 'failed'
}

interface ImportHistoryProps {
  history: ImportHistoryItem[]
}

export function ImportHistory({ history }: ImportHistoryProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Letzte Aktivitäten</h2>
        <ButtonPrimary size={'SMALL'} text={'Alle anzeigen'} href={'/vendor/activities'} />
      </div>

      <div className="space-y-4">
        {history.length > 0 ? history.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                item.status === 'completed' ? 'bg-green-100' :
                item.status === 'completed_with_errors' ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                {item.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className={`w-5 h-5 ${
                    item.status === 'completed_with_errors' ? 'text-yellow-600' : 'text-red-600'
                  }`} />
                )}
              </div>

              <div>
                <h3 className="font-medium text-gray-900">{item.filename}</h3>
                <p className="text-sm text-gray-600">{item.date}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {item.rows} Zeilen • {item.successful} erfolgreich • {item.errors} Fehler
                </p>
              </div>

              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">Noch keine Imports</p>
            <p className="text-gray-400 text-sm">
              Ihre Import-Historie wird hier angezeigt
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
