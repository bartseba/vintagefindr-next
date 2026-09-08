'use client'

import { useActionState, useEffect, useState } from 'react'
import Link from 'next/link'
import { Shield, AlertCircle, CheckCircle2 } from 'lucide-react'
import { submitDsaReport, type DsaMeldungState } from '@/app/(info)/dsa-meldung/actions'

const initialState: DsaMeldungState = {}

export function DsaMeldungForm() {
  const [state, formAction, isPending] = useActionState(submitDsaReport, initialState)
  const [formSubmitted, setFormSubmitted] = useState(false)

  useEffect(() => {
    if (state?.success) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reacts to a Server Action result, ported as-is from the working Remix component
      setFormSubmitted(true)
    }
  }, [state])

  if (formSubmitted) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Vielen Dank für Ihre Meldung
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Ihre Meldung wurde erfolgreich übermittelt und wird von unserem Team geprüft.
            Wir werden uns bei Bedarf per E-Mail bei Ihnen melden.
          </p>
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center rounded-md bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800"
            >
              Zur Startseite
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-gray-900" />
          <h1 className="text-3xl font-bold text-gray-900">
            DSA-Meldung rechtswidriger Inhalte
          </h1>
        </div>
      </div>

      <div className="mb-8 rounded-lg bg-gray-50 p-6">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          Rechtlicher Hinweis
        </h2>
        <p className="text-sm leading-relaxed text-gray-700">
          Gemäß Artikel 16 des Digital Services Act (Verordnung (EU) 2022/2065) bieten wir Ihnen
          die Möglichkeit, rechtswidrige Inhalte auf unserer Plattform zu melden. Ihre Meldung wird
          von unserem Team sorgfältig geprüft. Bitte beachten Sie, dass Meldungen nur bearbeitet
          werden können, wenn sie ausreichend begründet sind und alle erforderlichen Informationen enthalten.
        </p>
      </div>

      {state?.error && (
        <div className="mb-6 flex items-start gap-3 rounded-lg bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
          <p className="text-sm text-red-800">{state.error}</p>
        </div>
      )}

      <form action={formAction} className="space-y-6">
        <div>
          <label htmlFor="content_url" className="block text-sm font-medium text-gray-900">
            URL oder Kennzeichnung des gemeldeten Inhalts <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="content_url"
            name="content_url"
            required
            placeholder="https://vintagefindr.de/..."
            className="mt-2 block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            aria-required="true"
          />
          <p className="mt-2 text-sm text-gray-600">
            Bitte geben Sie die vollständige URL oder eine eindeutige Beschreibung des Inhalts an.
          </p>
        </div>

        <div>
          <label htmlFor="violation_type" className="block text-sm font-medium text-gray-900">
            Art des mutmaßlichen Rechtsverstoßes <span className="text-red-600">*</span>
          </label>
          <select
            id="violation_type"
            name="violation_type"
            required
            className="mt-2 block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            aria-required="true"
          >
            <option value="">Bitte wählen...</option>
            <option value="copyright">Urheberrechtsverletzung</option>
            <option value="trademark">Markenrechtsverletzung</option>
            <option value="fraud">Betrug oder Täuschung</option>
            <option value="counterfeit">Fälschung</option>
            <option value="privacy">Datenschutz- oder Persönlichkeitsrechtsverletzung</option>
            <option value="illegal_content">Illegale Inhalte</option>
            <option value="other">Sonstiger Rechtsverstoß</option>
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-900">
            Begründung <span className="text-red-600">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={6}
            placeholder="Bitte beschreiben Sie ausführlich, warum Sie den Inhalt für rechtswidrig halten..."
            className="mt-2 block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            aria-required="true"
          />
          <p className="mt-2 text-sm text-gray-600">
            Je detaillierter Ihre Begründung, desto schneller können wir Ihre Meldung bearbeiten.
          </p>
        </div>

        <div>
          <label htmlFor="reporter_name" className="block text-sm font-medium text-gray-900">
            Ihr vollständiger Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="reporter_name"
            name="reporter_name"
            required
            placeholder="Max Mustermann"
            className="mt-2 block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            aria-required="true"
          />
        </div>

        <div>
          <label htmlFor="reporter_email" className="block text-sm font-medium text-gray-900">
            Ihre E-Mail-Adresse <span className="text-red-600">*</span>
          </label>
          <input
            type="email"
            id="reporter_email"
            name="reporter_email"
            required
            placeholder="max@example.com"
            className="mt-2 block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            aria-required="true"
          />
          <p className="mt-2 text-sm text-gray-600">
            Wir benötigen Ihre E-Mail-Adresse, um Sie bei Rückfragen kontaktieren zu können.
          </p>
        </div>

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="confirmed"
            name="confirmed"
            required
            className="mt-1 h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
            aria-required="true"
          />
          <label htmlFor="confirmed" className="text-sm text-gray-700">
            <span className="text-red-600">*</span> Ich bestätige, dass diese Meldung nach bestem Wissen
            und Gewissen erfolgt und alle Angaben korrekt und wahrheitsgemäß sind.
          </label>
        </div>

        <div className="rounded-lg bg-blue-50 p-4">
          <h3 className="mb-2 text-sm font-semibold text-gray-900">Datenschutz-Hinweis</h3>
          <p className="text-sm text-gray-700">
            Die von Ihnen übermittelten Daten werden ausschließlich zur Bearbeitung Ihrer Meldung verwendet
            und nicht an Dritte weitergegeben. Weitere Informationen finden Sie in unserer{' '}
            <a href="/datenschutz" className="font-medium text-black underline hover:no-underline">
              Datenschutzerklärung
            </a>
            .
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 rounded-md bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? 'Wird gesendet...' : 'Meldung absenden'}
          </button>
          <Link
            href="/"
            className="rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            Abbrechen
          </Link>
        </div>
      </form>
    </div>
  )
}
