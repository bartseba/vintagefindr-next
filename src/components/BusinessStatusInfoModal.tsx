'use client'

import { X, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'

interface BusinessStatusInfoModalProps {
  isOpen: boolean
  onClose: () => void
}

export function BusinessStatusInfoModal({ isOpen, onClose }: BusinessStatusInfoModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-vintage-secondary">
            Wer darf sich bei VintageFindr registrieren?
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Schließen"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-amber-900 mb-1">Wichtig:</p>
                <p className="text-amber-800">
                  VintageFindr ist eine Plattform ausschließlich für <strong>gewerbliche Händler</strong>.
                  Privatverkäufer können sich nicht registrieren.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-vintage-secondary mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Du kannst dich registrieren, wenn:
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Du einen <strong>gewerblichen Vintage-Shop</strong> betreibst (online oder offline)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Du als <strong>Unternehmer im Sinne des §14 BGB</strong> handelst</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Du ein <strong>Gewerbe angemeldet</strong> hast</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Du regelmäßig und gewerbsmäßig Vintage-Kleidung anbietest</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-vintage-secondary mb-3 flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Registrierung nicht möglich für:
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <span><strong>Privatverkäufer</strong>, die gelegentlich Kleidung weiterverkaufen</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <span>Personen ohne <strong>angemeldetes Gewerbe</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <span>Einzelpersonen, die nur <strong>ihren eigenen Kleiderschrank</strong> ausmisten</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Was bedeutet &quot;Unternehmer im Sinne des §14 BGB&quot;?</h4>
            <p className="text-sm text-gray-700 mb-2">
              Nach dem Bürgerlichen Gesetzbuch (BGB) ist ein Unternehmer eine Person oder Gesellschaft, die:
            </p>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>• gewerblich oder selbstständig tätig ist</li>
              <li>• beim Abschluss von Verträgen in Ausübung ihrer Tätigkeit handelt</li>
              <li>• nicht als Verbraucher (Privatperson) agiert</li>
            </ul>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-900 mb-2">⚠️ Falsche Angaben führen zur Ablehnung</h4>
            <p className="text-sm text-red-800">
              Wenn du dich als Unternehmer registrierst, aber tatsächlich als Privatperson handelst,
              wird dein Account nach Prüfung <strong>abgelehnt und deaktiviert</strong>.
              Wir behalten uns vor, die Angaben zu überprüfen.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Du bist Privatverkäufer?</h4>
            <p className="text-sm text-blue-800">
              Dann nutze bitte Plattformen wie <strong>Vinted, Kleinanzeigen oder eBay</strong>,
              die auf Privatverkäufer ausgerichtet sind. VintageFindr konzentriert sich auf professionelle Händler.
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-vintage-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-vintage-secondary transition-colors"
          >
            Verstanden
          </button>
        </div>
      </div>
    </div>
  )
}
