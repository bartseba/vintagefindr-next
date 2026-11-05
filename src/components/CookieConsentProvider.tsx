'use client'

import { CookieConsent, ConsentWidget, type ConsentState } from "@/components/CookieConsent";
import { setPosthogConsent } from "@/lib/posthog";

/**
 * Mounted once in the root layout so the consent banner shows on first
 * visit and the floating widget lets users reopen it afterwards. PostHog
 * itself is initialized earlier, in src/instrumentation-client.ts.
 */
export function CookieConsentProvider() {
  const handleConsentChange = (consent: ConsentState) => {
    setPosthogConsent(consent.posthog === "accepted");
  };

  return (
    <>
      <CookieConsent onConsentChange={handleConsentChange} />
      <ConsentWidget />
    </>
  );
}
