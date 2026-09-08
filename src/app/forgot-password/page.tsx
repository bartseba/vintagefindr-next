import { redirect } from 'next/navigation'

/**
 * Ported from `app/routes/forgot-password.tsx` (also headless, UI rendered
 * as a global modal) — see `/login/page.tsx` for why this redirects to the
 * homepage with the modal query param instead of rendering a blank page.
 */
export default function ForgotPasswordPage() {
  redirect('/?modal=forgot-password')
}
