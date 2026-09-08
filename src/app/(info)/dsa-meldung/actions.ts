'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'

export interface DsaMeldungState {
  success?: boolean
  error?: string
}

/**
 * Ported from `_info.dsa-meldung.tsx`'s Remix `action` — inserts into the
 * `dsa_reports` table via the cookie-bound Supabase server client (same one
 * built in Phase 0 for authenticated reads; works for anonymous inserts too
 * as long as RLS allows it, matching the original's anonymous-submission
 * behavior).
 */
export async function submitDsaReport(_prevState: DsaMeldungState, formData: FormData): Promise<DsaMeldungState> {
  const contentUrl = formData.get('content_url') as string
  const violationType = formData.get('violation_type') as string
  const description = formData.get('description') as string
  const reporterName = formData.get('reporter_name') as string
  const reporterEmail = formData.get('reporter_email') as string
  const confirmed = formData.get('confirmed') as string

  if (!contentUrl || !violationType || !description || !reporterName || !reporterEmail || confirmed !== 'on') {
    return { error: 'Bitte füllen Sie alle Pflichtfelder aus und bestätigen Sie die Richtigkeit Ihrer Angaben.' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(reporterEmail)) {
    return { error: 'Bitte geben Sie eine gültige E-Mail-Adresse an.' }
  }

  try {
    const supabase = await createSupabaseServerClient()

    const { error } = await supabase
      .from('dsa_reports')
      .insert({
        content_url: contentUrl,
        violation_type: violationType,
        description: description,
        reporter_name: reporterName,
        reporter_email: reporterEmail,
        status: 'new',
      })

    if (error) {
      console.error('Error inserting DSA report:', error)
      return { error: 'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error submitting DSA report:', error)
    return { error: 'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.' }
  }
}
