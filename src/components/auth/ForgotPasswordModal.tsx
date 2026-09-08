'use client'

import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Mail, X, KeyRound, Wand2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [method, setMethod] = useState<'reset' | 'magic'>('reset')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string

    if (!email) {
      setMessage({ type: 'error', text: 'E-Mail Adresse ist erforderlich' })
      setIsLoading(false)
      return
    }

    try {
      if (method === 'magic') {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            shouldCreateUser: false,
          },
        })

        if (error) {
          setMessage({ type: 'error', text: error.message })
        } else {
          setMessage({
            type: 'success',
            text: 'Magic Link wurde an Ihre E-Mail gesendet. Bitte überprüfen Sie Ihr Postfach.'
          })
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        })

        if (error) {
          setMessage({ type: 'error', text: error.message })
        } else {
          setMessage({
            type: 'success',
            text: 'Passwort-Reset-Link wurde an Ihre E-Mail gesendet. Bitte überprüfen Sie Ihr Postfach.'
          })
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten' })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[200] backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[201] overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Passwort vergessen?
              </h1>
              <p className="text-gray-600 text-sm">
                Wählen Sie, wie Sie sich anmelden möchten
              </p>
            </div>

            {message && (
              <div className={`mb-4 p-3 border rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <p className={`text-sm ${
                  message.type === 'success' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {message.text}
                </p>
              </div>
            )}

            {/* Method Selection */}
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => setMethod('reset')}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  method === 'reset'
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <KeyRound className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs font-medium">Passwort zurücksetzen</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod('magic')}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  method === 'magic'
                    ? 'border-purple-600 bg-purple-50 text-purple-600'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <Wand2 className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs font-medium">Magic Link</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  name="email"
                  type="email"
                  label="E-Mail Adresse"
                  placeholder="ihre.email@example.com"
                  required
                  className="pl-10"
                />
                <Mail className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
              </div>

              {method === 'reset' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    Sie erhalten eine E-Mail mit einem Link zum Zurücksetzen Ihres Passworts.
                  </p>
                </div>
              )}

              {method === 'magic' && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-xs text-purple-800">
                    Sie erhalten einen magischen Link per E-Mail, mit dem Sie sich direkt ohne Passwort anmelden können.
                  </p>
                  <p className="text-xs text-purple-600 mt-2">
                    ⚠️ Der Link ist 1 Stunde gültig und kann nur einmal verwendet werden.
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Wird gesendet...' : method === 'reset' ? 'Reset-Link senden' : 'Magic Link senden'}
              </Button>
            </form>

            {/* Back to Login */}
            <div className="text-center mt-6">
              <button
                type="button"
                onClick={onClose}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Zurück zur Anmeldung
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
