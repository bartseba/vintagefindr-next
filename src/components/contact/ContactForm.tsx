'use client'

import { useActionState } from 'react'
import { Send } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { submitContactPageForm, type ContactPageFormState } from '@/app/(info)/contact/actions'

const initialState: ContactPageFormState = {}

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactPageForm, initialState)

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          name="name"
          label="Name"
          placeholder="Ihr vollständiger Name"
          error={state?.errors?.name}
          required
        />

        <Input
          name="email"
          type="email"
          label="E-Mail"
          placeholder="ihre.email@example.com"
          error={state?.errors?.email}
          required
        />
      </div>

      <Input
        name="subject"
        label="Betreff"
        placeholder="Worum geht es?"
        error={state?.errors?.subject}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nachricht *
        </label>
        <textarea
          name="message"
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          placeholder="Ihre Nachricht..."
          required
        />
        {state?.errors?.message && (
          <p className="text-xs text-red-600 mt-1">{state.errors.message}</p>
        )}
      </div>

      {state?.success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-700 text-sm font-medium">{state.message}</p>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        isLoading={isPending}
      >
        <Send size={16} className="mr-2" />
        {isPending ? 'Wird gesendet...' : 'Nachricht senden'}
      </Button>
    </form>
  )
}
