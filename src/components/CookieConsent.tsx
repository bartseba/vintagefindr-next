/* eslint-disable react/no-unescaped-entities -- ported UI copy, literal quote characters are part of the source content */
'use client'

import { useState, useEffect } from "react";
import Link from "next/link";

const POSTHOG_CONSENT_KEY = "posthog_consent";
const AWIN_CONSENT_KEY = "awin_consent";

export type ConsentStatus = "pending" | "accepted" | "rejected";

export interface ConsentState {
  posthog: ConsentStatus;
  awin: ConsentStatus;
}

interface CookieConsentProps {
  onConsentChange: (consent: ConsentState) => void;
}

function readConsent(): ConsentState {
  return {
    posthog: (localStorage.getItem(POSTHOG_CONSENT_KEY) as ConsentStatus) || "pending",
    awin: (localStorage.getItem(AWIN_CONSENT_KEY) as ConsentStatus) || "pending",
  };
}

export function CookieConsent({ onConsentChange }: CookieConsentProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [mounted, setMounted] = useState(false);
  // Default to "rejected", not "pending": GDPR requires that a category
  // the user never actively toggles is saved as no-consent, not as a
  // dangling "pending" value written to localStorage by "Auswahl speichern".
  const [draftPosthog, setDraftPosthog] = useState<ConsentStatus>("rejected");
  const [draftAwin, setDraftAwin] = useState<ConsentStatus>("rejected");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe mount flag, ported as-is from the working Remix component
    setMounted(true);

    if (typeof window === "undefined") return;

    const posthogConsent = localStorage.getItem(POSTHOG_CONSENT_KEY);
    const awinConsent = localStorage.getItem(AWIN_CONSENT_KEY);

    if (!posthogConsent || !awinConsent) {
      setShowBanner(true);
      setDraftPosthog(posthogConsent === "accepted" ? "accepted" : "rejected");
      setDraftAwin(awinConsent === "accepted" ? "accepted" : "rejected");
      onConsentChange(readConsent());
    } else {
      onConsentChange(readConsent());
    }
  }, [onConsentChange]);

  // Don't render anything on server
  if (!mounted) return null;

  const applyConsent = (posthog: ConsentStatus, awin: ConsentStatus) => {
    localStorage.setItem(POSTHOG_CONSENT_KEY, posthog);
    localStorage.setItem(AWIN_CONSENT_KEY, awin);
    setShowBanner(false);
    onConsentChange({ posthog, awin });
  };

  const handleAcceptAll = () => applyConsent("accepted", "accepted");
  const handleRejectAll = () => applyConsent("rejected", "rejected");
  const handleSaveSelection = () => applyConsent(draftPosthog, draftAwin);

  if (!showBanner) return null;

  return (
    <div className="max-w-[768px] mx-auto fixed bottom-10 left-0 right-0 z-[9999] rounded-md bg-white border-t border-gray-200 shadow-xl">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Datenschutz-Einstellungen
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Wir nutzen PostHog zur Analyse der Website-Nutzung (<strong>Ihre Einwilligung erforderlich</strong>).
              Dabei werden <strong>keine Cookies</strong> gesetzt. Es werden pseudonymisierte Daten
              (Seitenaufrufe, Klicks, Geräteinformationen) auf EU-Servern gespeichert.
            </p>
            <p className="text-sm text-gray-600 mb-3">
              Bei mit „Werbung" gekennzeichneten Produkten kann unser Partnernetzwerk Awin beim Klick
              ein Tracking-Cookie setzen, um Käufe unserer Provision zuzuordnen (<strong>Ihre Einwilligung erforderlich</strong>).
              Ohne Einwilligung werden Sie weiterhin zum Händler weitergeleitet, nur ohne dass Awin dabei ein Cookie setzt.
            </p>
            <p className="text-sm text-gray-600 mb-3">
              Weitere Informationen finden Sie in unserer{" "}
              <Link
                href="/datenschutz"
                className="text-black underline hover:text-gray-700 font-medium mr-2"
              >
                Datenschutzerklärung
              </Link>
              und
              <Link
                href="/impressum"
                className="text-black underline hover:text-gray-700 font-medium ml-2"
              >
                Impressum
              </Link>.
            </p>
          </div>

          {showDetails && (
            <div className="bg-gray-50 p-4 rounded-md text-sm">
              <p className="text-sm text-gray-600 mb-2">
              Unabhängig von Ihrer Einwilligung erfassen wir Produktklicks zur Abrechnung
              mit unseren Händlern auf Grundlage unseres <strong>berechtigten Interesses</strong> (Art. 6 Abs. 1 lit. f DSGVO).
              Dabei werden IP-Adressen nur als nicht rückverfolgbarer Hash gespeichert.
            </p>
              <h4 className="font-semibold mb-2">Details zur Datenverarbeitung:</h4>
              <p className="mb-3">
                <strong>Session-Aufzeichnungen und IP-Adressen werden nicht erfasst.</strong>
                <br />
                <strong>Hinweis:</strong> Ihre Einwilligung wird in Ihrem Browser (LocalStorage) gespeichert.
                Die Funktion "Zuletzt angesehen" speichert besuchte Produkte lokal für 30 Tage.
                Diese Daten bleiben auf Ihrem Gerät und werden nicht übertragen.
              </p>

              <div className="border border-gray-200 rounded-md p-3 mb-4 bg-white">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <h5 className="font-semibold">PostHog (Analyse)</h5>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setDraftPosthog("rejected")}
                      aria-pressed={draftPosthog === "rejected"}
                      className={`px-3 py-1 text-xs font-medium rounded-md border-2 border-black transition-colors ${draftPosthog === "rejected" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-50"}`}
                    >
                      Aus
                    </button>
                    <button
                      type="button"
                      onClick={() => setDraftPosthog("accepted")}
                      aria-pressed={draftPosthog === "accepted"}
                      className={`px-3 py-1 text-xs font-medium rounded-md border-2 border-black transition-colors ${draftPosthog === "accepted" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-50"}`}
                    >
                      An
                    </button>
                  </div>
                </div>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Anbieter: PostHog Inc.</li>
                  <li>Zweck: Analyse der Website-Nutzung zur Verbesserung</li>
                  <li>Verarbeitete Daten: Seitenaufrufe, Klicks, Geräteinformationen (pseudonymisiert)</li>
                  <li>NICHT erfasst: IP-Adressen, Session-Aufzeichnungen, Autocapture von Formularen</li>
                  <li>Speicherort: EU-Server (eu.i.posthog.com)</li>
                  <li>Speicherdauer: 90 Tage</li>
                  <li>Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung erforderlich)</li>
                  <li>Keine Weitergabe an Dritte</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-md p-3 mb-3 bg-white">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <h5 className="font-semibold">Awin (Affiliate-Tracking)</h5>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setDraftAwin("rejected")}
                      aria-pressed={draftAwin === "rejected"}
                      className={`px-3 py-1 text-xs font-medium rounded-md border-2 border-black transition-colors ${draftAwin === "rejected" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-50"}`}
                    >
                      Aus
                    </button>
                    <button
                      type="button"
                      onClick={() => setDraftAwin("accepted")}
                      aria-pressed={draftAwin === "accepted"}
                      className={`px-3 py-1 text-xs font-medium rounded-md border-2 border-black transition-colors ${draftAwin === "accepted" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-50"}`}
                    >
                      An
                    </button>
                  </div>
                </div>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Anbieter: Awin AG, Otto-Ostrowski-Straße 1A, 10249 Berlin</li>
                  <li>Zweck: Zuordnung eines Klicks auf ein "Werbung"-Produkt zu einem späteren Kauf, zur Berechnung unserer Provision</li>
                  <li>Verarbeitete Daten: IP-Adresse, Browser-/Geräteinformationen, Referrer, Zeitpunkt des Klicks, Affiliate-/Klickkennung</li>
                  <li>Speicherort/Cookie-Domain: awin1.com</li>
                  <li>Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO i.V.m. § 25 TDDDG (Einwilligung erforderlich)</li>
                  <li>Ohne Einwilligung: Weiterleitung erfolgt weiterhin über Awin zum Händler, aber ohne Awin-Cookie und ohne Übermittlung einer Klick-ID (Awin „Consent Signals Framework", Parameter cons=0)</li>
                </ul>
              </div>

              <p className="mt-2 text-gray-600">
                Sie können Ihre Einwilligung jederzeit in den Datenschutz-Einstellungen widerrufen.
                Weitere Informationen finden Sie in unserer{" "}
                <Link
                  href="/datenschutz"
                  className="text-black underline hover:text-gray-700 font-medium"
                >
                  Datenschutzerklärung
                </Link>.
              </p>

              <h4 className="font-semibold mb-2 mt-4">Klick-Tracking (kein Einverständnis erforderlich):</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Zweck: Abrechnung mit Händlern, Betrugsschutz</li>
                <li>Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)</li>
                <li>Verarbeitete Daten: IP-Hash (SHA-256 mit Salt, nicht rückverfolgbar), User-Agent, Zeitstempel, Referrer</li>
                <li>Speicherort: EU-Datenbank (Supabase Frankfurt)</li>
                <li>Speicherdauer: 12 Monate</li>
                <li>Sie haben ein Widerspruchsrecht gemäß Art. 21 DSGVO</li>
              </ul>

              <div className="flex justify-end mt-4">
                <button
                  onClick={handleSaveSelection}
                  className="px-6 py-2 text-sm font-medium text-black bg-white border-2 border-black rounded-md hover:bg-gray-50 transition-colors"
                >
                  Auswahl speichern
                </button>
              </div>
            </div>
          )}
          <div className="flex gap-3 ">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-6 flex-1 py-2 text-sm font-medium text-black bg-white border-2 border-black rounded-md hover:bg-gray-50 transition-colors"
            >
              {showDetails ? "Details ausblenden" : "Mehr erfahren"}
            </button>
            <button
              onClick={handleRejectAll}
              className="px-6 flex-1 py-2 text-sm font-medium text-black bg-white border-2 border-black rounded-md hover:bg-gray-50 transition-colors"
            >
              Alle ablehnen
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-6 py-2 flex-1 text-sm font-medium text-white bg-black border-2 border-black rounded-md hover:bg-gray-800 transition-colors"
            >
              Alle akzeptieren
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Persistent widget shown after user has made a consent decision.
 * Allows easy revocation of consent as required by GDPR.
 */
export function ConsentWidget() {
  const [showWidget, setShowWidget] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe mount flag, ported as-is from the working Remix component
    setMounted(true);
    if (typeof window === "undefined") return;

    // Show widget if at least one consent decision has been made
    const hasDecision = !!localStorage.getItem(POSTHOG_CONSENT_KEY) || !!localStorage.getItem(AWIN_CONSENT_KEY);
    setShowWidget(hasDecision);
  }, []);

  if (!mounted || !showWidget) return null;

  const handleOpenSettings = () => {
    resetConsent();
  };

  return (
    <button
      onClick={handleOpenSettings}
      aria-label="Cookie-Einstellungen öffnen"
      className="fixed bottom-4 right-4 z-[9998] bg-black text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
      title="Cookie-Einstellungen"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    </button>
  );
}

export function resetConsent() {
  localStorage.removeItem(POSTHOG_CONSENT_KEY);
  localStorage.removeItem(AWIN_CONSENT_KEY);
  window.location.reload();
}
