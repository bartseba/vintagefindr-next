'use client'

import { X, AlertTriangle, Mail } from 'lucide-react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { useState, useRef } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  vendorEmail: string
}

export function DeleteAccountModal({ isOpen, onClose, onConfirm, vendorEmail }: DeleteAccountModalProps) {
  const [step, setStep] = useState<'confirm' | 'otp'>('confirm')
  const [confirmText, setConfirmText] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const supabase = createSupabaseBrowserClient()

  if (!isOpen) return null

  const handleSendOtp = async () => {
    if (step === 'confirm' && confirmText !== 'LÖSCHEN') {
      setError('Bitte geben Sie "LÖSCHEN" ein, um zu bestätigen')
      return
    }

    setIsSendingOtp(true)
    setError('')

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: vendorEmail,
        options: {
          shouldCreateUser: false,
        },
      })

      if (otpError) {
        setError('Fehler beim Senden des Codes: ' + otpError.message)
      } else {
        setStep('otp')
        setOtp(['', '', '', '', '', ''])
        setTimeout(() => inputRefs.current[0]?.focus(), 100)
      }
    } catch {
      setError('Ein Fehler ist aufgetreten')
    } finally {
      setIsSendingOtp(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pastedCode = value.replace(/\D/g, '').slice(0, 6)
      const newOtp = pastedCode.split('').concat(Array(6 - pastedCode.length).fill(''))
      setOtp(newOtp)

      const lastFilledIndex = Math.min(pastedCode.length, 5)
      inputRefs.current[lastFilledIndex]?.focus()

      if (pastedCode.length === 6) {
        handleVerifyOtp(pastedCode)
      }
      return
    }

    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError('')

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleVerifyOtp(newOtp.join(''))
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    const pastedCode = pastedData.replace(/\D/g, '').slice(0, 6)

    if (pastedCode.length > 0) {
      const newOtp = pastedCode.split('').concat(Array(6 - pastedCode.length).fill(''))
      setOtp(newOtp)
      setError('')

      const lastFilledIndex = Math.min(pastedCode.length - 1, 5)
      inputRefs.current[lastFilledIndex]?.focus()

      if (pastedCode.length === 6) {
        handleVerifyOtp(pastedCode)
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleVerifyOtp = async (code: string) => {
    setIsSubmitting(true)
    setError('')

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: vendorEmail,
        token: code,
        type: 'email',
      })

      if (verifyError) {
        if (verifyError.message.includes('expired')) {
          setError('Der Code ist abgelaufen. Bitte fordern Sie einen neuen an')
        } else if (verifyError.message.includes('invalid')) {
          setError('Der eingegebene Code ist ungültig')
        } else {
          setError(verifyError.message)
        }
        setOtp(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      } else {
        await onConfirm()
        handleClose()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setStep('confirm')
    setConfirmText('')
    setOtp(['', '', '', '', '', ''])
    setError('')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-red-100 bg-red-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              {step === 'confirm' ? (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              ) : (
                <Mail className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-red-900">
                {step === 'confirm' ? 'Account löschen' : 'Code eingeben'}
              </h2>
              <p className="text-sm text-red-700">
                {step === 'confirm'
                  ? 'Diese Aktion kann nicht rückgängig gemacht werden'
                  : 'Bestätigung per E-Mail'
                }
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {step === 'confirm' ? (
            <>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                <p className="text-red-900 font-medium text-sm">
                  Warnung: Diese Aktion wird permanent:
                </p>
                <ul className="text-red-700 text-sm space-y-1 list-disc list-inside">
                  <li>Ihren Account löschen</li>
                  <li>Alle Daten &amp; Produkte löschen</li>
                  <li>Gebuchte Pakete können nicht erstattet werden.</li>
                  <li>Alle Analytics-Daten löschen</li>
                  <li>Ihre Favoriten und Einstellungen löschen</li>
                </ul>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700 text-sm">
                  <strong>Hinweis zu gesetzlichen Aufbewahrungspflichten:</strong> Rechnungen und Zahlungsdaten
                  unterliegen gesetzlichen Aufbewahrungsfristen (§ 257 HGB, § 147 AO) und werden für bis zu
                  10 Jahre aufbewahrt. Diese Daten können nicht vorzeitig gelöscht werden. Klick-Tracking-Daten
                  werden nach Ablauf der regulären Speicherfrist von 12 Monaten automatisch gelöscht.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bestätigung erforderlich
                </label>
                <p className="text-sm text-gray-600 mb-2">
                  Geben Sie <span className="font-semibold">LÖSCHEN</span> ein, um zu bestätigen:
                </p>
                <Input
                  type="text"
                  placeholder="LÖSCHEN"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  required
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  Nach der Bestätigung erhalten Sie einen 6-stelligen Code per E-Mail.
                </p>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep('otp')
                    setTimeout(() => inputRefs.current[0]?.focus(), 100)
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  Bereits einen Code erhalten? Code eingeben
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Abbrechen
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleSendOtp}
                  isLoading={isSendingOtp}
                  disabled={confirmText !== 'LÖSCHEN'}
                  className="flex-1"
                >
                  {isSendingOtp ? 'Code wird gesendet...' : 'Code anfordern'}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-4">
                <p className="text-gray-600 text-sm">
                  Wir haben einen 6-stelligen Code an
                </p>
                <p className="font-medium text-gray-900 mt-1">{vendorEmail}</p>
                <p className="text-gray-600 text-sm mt-1">gesendet</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                    disabled={isSubmitting}
                  />
                ))}
              </div>

              {isSubmitting && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    Code wird überprüft...
                  </div>
                </div>
              )}

              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs text-red-800 text-center">
                  Nach erfolgreicher Verifizierung wird Ihr Account unwiderruflich gelöscht.
                </p>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp || isSubmitting}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSendingOtp ? 'Code wird gesendet...' : 'Code erneut senden'}
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('confirm')}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Zurück
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
