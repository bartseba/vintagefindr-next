'use server'

export interface ContactFormState {
  success?: boolean
  error?: string
}

/**
 * Ported from `_info.kontakt.tsx`'s Remix `action` — posts to the same
 * Supabase Edge Function (`send-contact-email`). Remix's `Form`+`action`+
 * `useActionData` maps to Next's `useActionState`+Server Action here.
 */
export async function submitContactForm(_prevState: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const category = formData.get('category') as string
  const subject = formData.get('subject') as string
  const message = formData.get('message') as string
  const website = formData.get('website') as string

  if (!name || !email || !category || !subject || !message) {
    return { error: 'Alle Felder müssen ausgefüllt werden' }
  }

  if (website && website.trim() !== '') {
    return { error: 'Ungültige Anfrage' }
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration missing')
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/send-contact-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ name, email, category, subject, message, website }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Edge function error:', errorData)
      throw new Error(errorData.error || 'E-Mail konnte nicht gesendet werden')
    }

    return { success: true }
  } catch (error) {
    console.error('Contact form error:', error)
    return { error: error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten' }
  }
}
