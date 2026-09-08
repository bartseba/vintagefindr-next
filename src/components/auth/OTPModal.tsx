'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Mail, RefreshCw } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

interface OTPModalProps {
  isOpen: boolean
  onClose: () => void
  email: string
  onSuccess: () => void
  type: 'signup' | 'login'
  isVendor?: boolean
}

export function OTPModal({ isOpen, onClose, email, onSuccess, type }: OTPModalProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [canResend, setCanResend] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [isResending, setIsResending] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    if (isOpen) {
      inputRefs.current[0]?.focus()
      document.body.style.overflow = 'hidden'

      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setCanResend(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => {
        clearInterval(timer)
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen, onClose])

  const verifyOtp = async (code: string) => {
    setIsVerifying(true)
    setError(null)

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
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
      } else if (data.session) {
        onSuccess()
      } else {
        setError('Verifizierung fehlgeschlagen')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pastedCode = value.replace(/\D/g, '').slice(0, 6)
      const newOtp = pastedCode.split('').concat(Array(6 - pastedCode.length).fill(''))
      setOtp(newOtp)

      const lastFilledIndex = Math.min(pastedCode.length, 5)
      inputRefs.current[lastFilledIndex]?.focus()

      if (pastedCode.length === 6) {
        verifyOtp(pastedCode)
      }
      return
    }

    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError(null)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      verifyOtp(newOtp.join(''))
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    const pastedCode = pastedData.replace(/\D/g, '').slice(0, 6)

    if (pastedCode.length > 0) {
      const newOtp = pastedCode.split('').concat(Array(6 - pastedCode.length).fill(''))
      setOtp(newOtp)
      setError(null)

      const lastFilledIndex = Math.min(pastedCode.length - 1, 5)
      inputRefs.current[lastFilledIndex]?.focus()

      if (pastedCode.length === 6) {
        verifyOtp(pastedCode)
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

  const handleResend = async () => {
    setIsResending(true)
    setError(null)

    try {
      const { error: resendError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: type === 'signup',
        },
      })

      if (resendError) {
        setError('Fehler beim Senden des Codes: ' + resendError.message)
      } else {
        setCanResend(false)
        setCountdown(60)
        setOtp(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setIsResending(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[200] backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-0 z-[201] overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-vintage-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Code eingeben
              </h2>
              <p className="text-gray-600 text-sm">
                Wir haben einen 6-stelligen Code an
              </p>
              <p className="font-medium text-gray-900 mt-1">{email}</p>
              <p className="text-gray-600 text-sm mt-1">gesendet</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-vintage-primary focus:ring-2 focus:ring-vintage-primary/20 outline-none transition-all"
                    disabled={isVerifying}
                  />
                ))}
              </div>

              {isVerifying && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-vintage-primary"></div>
                    Code wird überprüft...
                  </div>
                </div>
              )}

              <div className="text-center">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending}
                    className="inline-flex items-center gap-2 text-sm text-vintage-primary hover:text-amber-700 font-medium disabled:opacity-50"
                  >
                    {isResending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-vintage-primary"></div>
                        Wird gesendet...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={16} />
                        Code erneut senden
                      </>
                    )}
                  </button>
                ) : (
                  <p className="text-sm text-gray-600">
                    Code erneut senden in {countdown}s
                  </p>
                )}
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-xs text-gray-600 text-center">
                  Der Code ist 10 Minuten gültig. Überprüfen Sie auch Ihren Spam-Ordner.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
