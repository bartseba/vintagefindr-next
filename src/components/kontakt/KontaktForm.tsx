'use client'

import { Send } from 'lucide-react'
import { useActionState, useEffect, useState } from 'react'
import { SuccessModal } from '@/components/SuccessModal'
import { Input } from '@/components/ui/Input'
import { submitContactForm, type ContactFormState } from '@/app/(info)/kontakt/actions'

const CATEGORIES = [
  { value: 'support', label: 'Support (Allgemeine Fragen)' },
  { value: 'vendor', label: 'Händler-Anfrage (Interesse am Verkauf)' },
  { value: 'partnership', label: 'Partnerschaft (Kooperationsanfragen)' },
  { value: 'technical', label: 'Technisches Problem (Bugs, Fehler)' },
  { value: 'feedback', label: 'Feedback (Verbesserungsvorschläge)' },
  { value: 'other', label: 'Sonstiges' },
]

const initialState: ContactFormState = {}

export function KontaktForm() {
  const [state, formAction, isPending] = useActionState(submitContactForm, initialState)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  useEffect(() => {
    if (state?.success) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reacts to a Server Action result, ported as-is from the working Remix component
      setShowSuccessModal(true)
    }
  }, [state])

  const handleCloseModal = () => {
    setShowSuccessModal(false)
    window.location.href = '/kontakt'
  }

  return (
    <>
      {state?.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{state.error}</p>
        </div>
      )}

      <form action={formAction} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              Name *
            </label>
            <Input
              type="text"
              id="name"
              name="name"
              required
              maxLength={100}
              placeholder="Ihr Name"
              disabled={isPending}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              E-Mail *
            </label>
            <Input
              type="email"
              id="email"
              name="email"
              required
              maxLength={255}
              placeholder="ihre@email.de"
              disabled={isPending}
              className="w-full"
            />
          </div>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
            Kategorie *
          </label>
          <select
            id="category"
            name="category"
            required
            disabled={isPending}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Bitte wählen...</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
            Betreff *
          </label>
          <Input
            type="text"
            id="subject"
            name="subject"
            required
            maxLength={200}
            placeholder="Worum geht es?"
            disabled={isPending}
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
            Nachricht *
          </label>
          <textarea
            id="message"
            name="message"
            required
            maxLength={5000}
            rows={6}
            placeholder="Ihre Nachricht..."
            disabled={isPending}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">Maximal 5000 Zeichen</p>
        </div>

        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          style={{
            position: 'absolute',
            left: '-9999px',
            height: '1px',
            width: '1px',
            opacity: 0
          }}
          aria-hidden="true"
        />

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-vintage-primary hover:bg-vintage-darkGray disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Wird gesendet...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Nachricht senden
            </>
          )}
        </button>
      </form>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseModal}
        title="Nachricht erfolgreich versendet"
        message="Wir melden uns innerhalb von 48 Stunden bei Ihnen."
      />
    </>
  )
}
