import posthog from 'posthog-js'

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST

/**
 * Called synchronously from `src/instrumentation-client.ts` (runs before
 * hydration, per Next.js' client instrumentation convention) — inits opted
 * out by default, CookieConsentProvider calls setPosthogConsent() once the
 * stored `posthog_consent` value is known, so no event ever leaves the
 * browser before the user has actually consented. The explicit options
 * below override the `defaults` preset and mirror the promises made in the
 * consent banner/`/datenschutz` (no cookies, no session recordings, EU host).
 */
export function initPosthog() {
  if (!POSTHOG_KEY || !POSTHOG_HOST) return

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    defaults: '2026-08-30',
    person_profiles: 'identified_only',
    persistence: 'localStorage',
    disable_session_recording: true,
    opt_out_capturing_by_default: true,
    capture_pageview: true,
  })
}

export function setPosthogConsent(accepted: boolean) {
  if (typeof window === 'undefined' || !POSTHOG_KEY) return
  if (accepted) {
    posthog.opt_in_capturing()
  } else {
    posthog.opt_out_capturing()
  }
}
