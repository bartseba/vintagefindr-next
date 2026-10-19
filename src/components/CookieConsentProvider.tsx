'use client'

import { CookieConsent, ConsentWidget, type ConsentState } from "@/components/CookieConsent";

/**
 * Mounted once in the root layout so the consent banner shows on first
 * visit and the floating widget lets users reopen it afterwards. Was
 * ported from Remix's root.tsx but never actually wired into app/layout.tsx,
 * so the banner/modal never appeared on any page.
 */
export function CookieConsentProvider() {
  const handleConsentChange = (_consent: ConsentState) => {};

  return (
    <>
      <CookieConsent onConsentChange={handleConsentChange} />
      <ConsentWidget />
    </>
  );
}
