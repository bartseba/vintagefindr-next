'use server'

export interface ContactPageFormState {
  errors?: {
    name?: string
    email?: string
    subject?: string
    message?: string
  }
  success?: boolean
  message?: string
}

/**
 * Ported from `_info.contact.tsx`'s Remix `action` — validates and returns
 * success, but (in the original too) never actually sends anything. The
 * Remix source's own comment says as much ("In a real app, you would send
 * the email here"). This is a separate, older/duplicate page from
 * `/kontakt` (which does send, via a Supabase Edge Function) — preserved
 * as-is rather than wired up, since making it actually send would be a new
 * feature, not a port.
 */
export async function submitContactPageForm(_prevState: ContactPageFormState, formData: FormData): Promise<ContactPageFormState> {
  const data = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    subject: formData.get('subject') as string,
    message: formData.get('message') as string,
  }

  const errors: ContactPageFormState['errors'] = {}

  if (!data.name) errors.name = 'Name ist erforderlich'
  if (!data.email) errors.email = 'E-Mail ist erforderlich'
  if (!data.subject) errors.subject = 'Betreff ist erforderlich'
  if (!data.message) errors.message = 'Nachricht ist erforderlich'

  if (Object.keys(errors).length > 0) {
    return { errors }
  }

  return { success: true, message: 'Ihre Nachricht wurde erfolgreich gesendet!' }
}
