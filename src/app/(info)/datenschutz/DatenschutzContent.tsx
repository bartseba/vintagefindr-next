/* eslint-disable react/no-unescaped-entities -- ported legal text, literal quote characters are part of the source content */
'use client'

import Link from "next/link";
import { Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { resetConsent } from "@/components/CookieConsent";
import { companyEmail, companyName } from "@/constant/routes";

export default function Datenschutz() {
  const [consentStatus, setConsentStatus] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe mount flag, ported as-is from the working Remix component
    setMounted(true);
    if (typeof window !== "undefined") {
      setConsentStatus(localStorage.getItem("posthog_consent"));
    }
  }, []);

  const handleRevokeConsent = () => {
    resetConsent();
  };

  const handleGrantConsent = () => {
    localStorage.setItem("posthog_consent", "accepted");
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        Datenschutzerklärung
      </h1>

      <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Datenschutz auf einen Blick</h2>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Allgemeine Hinweise</h3>
          <p>
            Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren
            personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können. Ausführliche Informationen zum Thema Datenschutz entnehmen Sie der unter diesem Text aufgeführten Datenschutzerklärung.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Datenerfassung auf dieser Website</h2>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Wer ist verantwortlich für die Datenerfassung auf dieser Website?</h3>
          <p className="mb-2">
            Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber:
          </p>
          <p className="mb-2">
            <strong>Sebastian Bartels</strong><br />
              Neuer Kamp 1<br />
              20359 Hamburg<br />
              Deutschland<br />
              <Link
                href="/kontakt"
                className="my-2 text-sm inline-flex items-center gap-2 px-2 py-2 bg-vintage-primary hover:bg-vintage-hover text-white font-semibold rounded-md transition-colors duration-200 shadow-sm hover:shadow-md"
              >
              <Mail className="w-5 h-5" />
              Zum Kontaktformular
            </Link><br />
              E-Mail: <a href="mailto:datenschutz@vintagefindr.de" className="text-vintage-primary hover:underline">{companyEmail}</a>
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">Datenschutzbeauftragter</h3>
          <p>
            Ein Datenschutzbeauftragter ist nicht bestellt.
          </p>
          <p className="text-sm text-gray-600 mt-2">
            (Art. 13 Abs. 1 lit. b DSGVO – nur „sofern vorhanden"; Negativ-Transparenz ist sauber.)
          </p>

          <p className="mt-4">
            Die vollständigen Kontaktdaten sowie die Anschrift können Sie dem Impressum dieser Website entnehmen. Der Verantwortliche entscheidet allein oder gemeinsam mit anderen über die Zwecke und Mittel der Verarbeitung von personenbezogenen Daten (Art. 4 Nr. 7 DSGVO).
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">Wie erfassen wir Ihre Daten?</h3>
          <p>
            Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen, z. B. bei der Registrierung eines Nutzerkontos oder als Vendor-Partner. Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z. B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">2a. Empfänger Ihrer Daten / Auftragsverarbeiter</h2>
          <p className="mb-4">
            Empfänger Ihrer personenbezogenen Daten sind insbesondere von uns eingesetzte Dienstleister für Hosting, Content-Auslieferung (CDN), Sicherheit & DDoS-Schutz (Cloudflare), Datenbank- und Authentifizierungsdienste, Suchfunktion, Webanalyse, E-Mail-Versand sowie Fehlerüberwachung. Diese Dienstleister verarbeiten personenbezogene Daten in unserem Auftrag auf Grundlage eines Vertrags zur Auftragsverarbeitung gemäß Art. 28 DSGVO.
          </p>
          <p>
            Darüber hinaus übermitteln wir personenbezogene Daten nur, wenn dies zur Erfüllung gesetzlicher Pflichten erforderlich ist oder zur Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen notwendig ist.
          </p>
          <p className="text-sm text-gray-600 mt-2">
            (Art. 13 Abs. 1 lit. e DSGVO; Art. 28 DSGVO)
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Hosting und Content Delivery Networks (CDN)</h2>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 Hosting (Railway.com)</h3>
          <p className="mb-2">
            Diese Website wird bei Railway.com gehostet. Die personenbezogenen Daten, die auf dieser Website erfasst werden, werden auf den Servern des Hosters gespeichert. Hierbei kann es sich v. a. um IP-Adressen, Meta- und Kommunikationsdaten, Webseitenzugriffe und sonstige Daten, die über eine Website generiert werden, handeln.
          </p>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">Anbieterinformationen</h4>
          <p className="mb-2">
            <strong>Railway Corporation</strong><br />
            Server-Standort: EU West (Europa)
          </p>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">Datenschutzmaßnahmen</h4>
          <ul className="list-disc list-inside space-y-1 mb-2">
            <li><strong>EU-Standort:</strong> Alle Server befinden sich in der Europäischen Union (EU West)</li>
            <li><strong>DSGVO-konform:</strong> Railway.com verarbeitet Daten DSGVO-konform</li>
            <li><strong>Auftragsverarbeitung:</strong> Vertrag über Auftragsverarbeitung (AVV) gemäß Art. 28 DSGVO</li>
          </ul>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">Rechtsgrundlage</h4>
          <p className="mb-4">
            Der Einsatz des Hosters erfolgt zum Zwecke der Vertragserfüllung gegenüber unseren potenziellen und bestehenden Kunden (Art. 6 Abs. 1 lit. b DSGVO) und im Interesse einer sicheren, schnellen und effizienten Bereitstellung unseres Online-Angebots durch einen professionellen Anbieter (Art. 6 Abs. 1 lit. f DSGVO).
          </p>

          <p className="mb-4">
            Weitere Informationen zum Datenschutz bei Railway.com finden Sie unter:{" "}
            <a href="https://railway.app/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-vintage-primary hover:underline">
              https://railway.app/legal/privacy
            </a>
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Content Delivery Network (Bunny CDN)</h3>
          <p className="mb-2">
            Wir nutzen das Content Delivery Network (CDN) von Bunny.net zur schnellen und sicheren Auslieferung von Bildinhalten (z. B. Produktfotos).
          </p>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">Zweck der Nutzung</h4>
          <p className="mb-2">
            Das CDN beschleunigt das Laden unserer Website und verbessert die Benutzererfahrung durch geografisch verteilte Server. Dies dient unserem berechtigten Interesse an einer optimalen Darstellung und Performance unserer Website.
          </p>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">Verarbeitete Daten</h4>
          <ul className="list-disc list-inside space-y-1 mb-2">
            <li>IP-Adresse (zur Auslieferung der Inhalte technisch erforderlich)</li>
            <li>Zeitpunkt des Abrufs</li>
            <li>Übertragene Datenmenge</li>
            <li>HTTP-Referrer</li>
            <li>User-Agent (Browser und Betriebssystem)</li>
          </ul>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">Anbieterinformationen</h4>
          <p className="mb-2">
            <strong>BunnyWay d.o.o.</strong><br />
            Cesta komandanta Staneta 4A<br />
            1215 Medvode<br />
            Slowenien (EU)
          </p>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">Datenschutzmaßnahmen</h4>
          <ul className="list-disc list-inside space-y-1 mb-2">
            <li><strong>EU-Standort:</strong> Alle Server befinden sich in der Europäischen Union</li>
            <li><strong>DSGVO-konform:</strong> Bunny.net ist DSGVO-konform und hat seinen Sitz in der EU</li>
            <li><strong>Kein Tracking:</strong> Das CDN dient ausschließlich der Inhaltsauslieferung, nicht dem Tracking</li>
            <li><strong>Kurze Speicherdauer:</strong> Server-Logs werden nur für technische Zwecke kurzzeitig gespeichert</li>
          </ul>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">Rechtsgrundlage</h4>
          <p className="mb-2">
            Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse). Unser berechtigtes Interesse liegt in der schnellen und sicheren Auslieferung unserer Website-Inhalte sowie der Optimierung der Performance.
          </p>

          <p className="mb-2">
            Weitere Informationen zum Datenschutz bei Bunny.net finden Sie unter:{" "}
            <a href="https://bunny.net/privacy/" target="_blank" rel="noopener noreferrer" className="text-vintage-primary hover:underline">
              https://bunny.net/privacy/
            </a>
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.3 Datenbank & Authentifizierung (Supabase)</h3>
          <p className="mb-2">
            Wir nutzen Supabase als Datenbank- und Authentifizierungsdienst für die Speicherung und Verwaltung von Nutzerdaten, Produktinformationen und Website-Funktionen.
          </p>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">Zweck der Nutzung</h4>
          <p className="mb-2">
            Supabase dient als zentrale Datenbank für unsere Plattform und ermöglicht die sichere Verwaltung von Nutzerkonten, Vendor-Profilen, Produktdaten sowie das Klick-Tracking für die Abrechnung.
          </p>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">Verarbeitete Daten</h4>
          <ul className="list-disc list-inside space-y-1 mb-2">
            <li><strong>Authentifizierungsdaten:</strong> E-Mail-Adresse, verschlüsselte Passwörter (Supabase Auth)</li>
            <li><strong>Nutzerprofildaten:</strong> Profilname und weitere Profilinformationen (nur, sofern freiwillig angegeben)</li>
            <li><strong>Vendor-Daten:</strong> Shop-Informationen, Kontaktdaten von Händlern</li>
            <li><strong>Produktdaten:</strong> Produktinformationen, Bilder-URLs, Kategorien</li>
            <li><strong>Klick-Tracking:</strong> Gehashte IP-Adressen (SHA-256), Timestamps, Referrer-Daten</li>
            <li><strong>Session-Daten:</strong> Login-Sessions zur Aufrechterhaltung der Anmeldung</li>
          </ul>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">Anbieterinformationen</h4>
          <p className="mb-2">
            <strong>Supabase, Inc.</strong><br />
            (Delaware Corporation)<br />
            65 Chulia Street #38-02/03, OCBC Centre<br />
            Singapore 049513<br />
            Server-Standort: EU-Central-1 (Frankfurt, Deutschland)
          </p>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">Datenschutzmaßnahmen</h4>
          <ul className="list-disc list-inside space-y-1 mb-2">
            <li><strong>EU-Server:</strong> Alle Daten werden ausschließlich in der EU (Frankfurt) gespeichert</li>
            <li><strong>Verschlüsselung:</strong> Daten werden verschlüsselt übertragen (SSL/TLS) und gespeichert</li>
            <li><strong>DSGVO-konform:</strong> Supabase ist DSGVO-konform und SOC 2 Type II zertifiziert</li>
            <li><strong>Passwort-Sicherheit:</strong> Passwörter werden mit bcrypt gehasht und niemals im Klartext gespeichert</li>
            <li><strong>Auftragsverarbeitung:</strong> Data Processing Addendum (DPA) gemäß Art. 28 DSGVO</li>
            <li><strong>IP-Schutz:</strong> Wir speichern IP-Adressen nicht im Klartext, sondern in gehashter Form (SHA-256 mit Salt). Dadurch wird eine unmittelbare Zuordnung erheblich erschwert.</li>
          </ul>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">Speicherdauer</h4>
          <ul className="list-disc list-inside space-y-1 mb-2">
            <li><strong>Nutzerkonten:</strong> Bis zur Löschung des Accounts durch den Nutzer</li>
            <li><strong>Klick-Tracking Daten:</strong> 12 Monate (zur nachvollziehbaren Abrechnung gegenüber Partnerhändlern, zur Bearbeitung von Rückfragen/Reklamationen sowie zur Aufklärung und Verhinderung von Missbrauch)</li>
            <li><strong>Session-Daten:</strong> Automatische Löschung nach Ablauf der Session</li>
          </ul>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">Rechtsgrundlage</h4>
          <ul className="list-disc list-inside space-y-1 mb-2">
            <li><strong>Nutzerkonten & Authentifizierung:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)</li>
            <li><strong>Klick-Tracking:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse zur Betrugsverhinderung)</li>
          </ul>

          <p className="mb-2">
            Weitere Informationen zum Datenschutz bei Supabase finden Sie unter:{" "}
            <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-vintage-primary hover:underline">
              https://supabase.com/privacy
            </a>
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.4 Produktsuche (Algolia)</h3>
          <p className="mb-2">
            Wir nutzen den Suchdienst Algolia zur Bereitstellung der Produktsuche und Autovervollständigung auf unserer Plattform. Bei der Nutzung der Suchfunktion werden Ihre Suchanfragen direkt an die Server von Algolia übermittelt.
          </p>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">Zweck der Nutzung</h4>
          <p className="mb-2">
            Algolia ermöglicht eine schnelle und relevante Produktsuche mit Filterfunktionen (z. B. nach Kategorie, Marke, Zustand). Dies dient der Bereitstellung der Kernfunktionalität unserer Plattform.
          </p>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">Verarbeitete Daten</h4>
          <ul className="list-disc list-inside space-y-1 mb-2">
            <li><strong>Suchanfragen:</strong> Eingegebene Suchbegriffe und gewählte Filter</li>
            <li><strong>IP-Adresse:</strong> Zur Auslieferung der Suchergebnisse technisch erforderlich</li>
            <li><strong>User-Agent:</strong> Browser und Betriebssystem</li>
            <li><strong>Zeitstempel:</strong> Datum und Uhrzeit der Suchanfrage</li>
          </ul>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">Anbieterinformationen</h4>
          <p className="mb-2">
            <strong>Algolia, Inc.</strong><br />
            301 Howard Street, Suite 300<br />
            San Francisco, CA 94105<br />
            USA
          </p>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">Datenschutzmaßnahmen & Drittlandtransfer</h4>
          <p className="mb-2">
            Algolia verarbeitet Daten auf Servern, die sich auch in den USA befinden können. Es findet daher eine Datenübermittlung in Drittländer statt.
          </p>
          <ul className="list-disc list-inside space-y-1 mb-2">
            <li><strong>Data Privacy Framework (DPF):</strong> Algolia ist nach dem EU-U.S. Data Privacy Framework zertifiziert. Der Datentransfer erfolgt auf Grundlage des DPF-Programms (Art. 45 DSGVO - Angemessenheitsbeschluss)</li>
            <li><strong>SOC 2 Type II zertifiziert:</strong> Algolia erfüllt strenge Sicherheitsstandards</li>
            <li><strong>Auftragsverarbeitung:</strong> Data Processing Addendum (DPA) gemäß Art. 28 DSGVO</li>
            <li><strong>Verschlüsselung:</strong> Alle Suchanfragen werden verschlüsselt übertragen (TLS)</li>
            <li><strong>Keine Profilbildung:</strong> Die Suchdaten werden nicht zur Erstellung von Nutzerprofilen verwendet</li>
          </ul>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">Speicherdauer</h4>
          <p className="mb-2">
            Such-Logs werden für maximal 90 Tage gespeichert und anschließend automatisch gelöscht.
          </p>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">Rechtsgrundlage</h4>
          <p className="mb-2">
            Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse). Unser berechtigtes Interesse liegt in der Bereitstellung einer funktionalen und performanten Produktsuche als Kernfunktion unserer Plattform.
          </p>

          <p className="mb-2">
            Weitere Informationen zum Datenschutz bei Algolia finden Sie unter:{" "}
            <a href="https://www.algolia.com/policies/privacy/" target="_blank" rel="noopener noreferrer" className="text-vintage-primary hover:underline">
              https://www.algolia.com/policies/privacy/
            </a>
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.5 Content Management (Directus)</h3>
          <p className="mb-2">
            Wir nutzen Directus als Content-Management-System (CMS) zur Verwaltung und Auslieferung redaktioneller Inhalte (z. B. Kategorien, Navigationsdaten, FAQ-Inhalte, Ratgeber).
          </p>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">Zweck der Nutzung</h4>
          <p className="mb-2">
            Directus dient der zentralen Verwaltung von Website-Inhalten und ermöglicht die dynamische Darstellung von Kategorien, Navigationsstrukturen und redaktionellen Inhalten.
          </p>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">Verarbeitete Daten</h4>
          <p className="mb-2">
            Beim Abruf von Inhalten werden folgende Daten technisch bedingt verarbeitet:
          </p>
          <ul className="list-disc list-inside space-y-1 mb-2">
            <li><strong>IP-Adresse:</strong> Zur Auslieferung der Inhalte technisch erforderlich</li>
            <li><strong>User-Agent:</strong> Browser und Betriebssystem</li>
            <li><strong>Zeitstempel:</strong> Datum und Uhrzeit des Abrufs</li>
          </ul>
          <p className="mb-2">
            <strong>Hinweis:</strong> Endnutzer interagieren nicht direkt mit Directus. Die Content-Abfragen erfolgen serverseitig. Es werden keine personenbezogenen Nutzerdaten in Directus gespeichert.
          </p>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">Anbieterinformationen</h4>
          <p className="mb-2">
            <strong>Monospace Inc. (Directus)</strong><br />
            Brooklyn, New York<br />
            USA
          </p>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">Datenschutzmaßnahmen & Drittlandtransfer</h4>
          <ul className="list-disc list-inside space-y-1 mb-2">
            <li><strong>Serverseitige Abfragen:</strong> Content-Abrufe erfolgen primär serverseitig, sodass IP-Adressen der Endnutzer in der Regel nicht an Directus übermittelt werden</li>
            <li><strong>Auftragsverarbeitung:</strong> Data Processing Agreement (DPA) gemäß Art. 28 DSGVO</li>
            <li><strong>Verschlüsselung:</strong> Alle Daten werden verschlüsselt übertragen (TLS)</li>
          </ul>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">Rechtsgrundlage</h4>
          <p className="mb-2">
            Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse). Unser berechtigtes Interesse liegt in der effizienten Verwaltung und Darstellung von Website-Inhalten.
          </p>

          <p className="mb-2">
            Weitere Informationen zum Datenschutz bei Directus finden Sie unter:{" "}
            <a href="https://directus.io/privacy" target="_blank" rel="noopener noreferrer" className="text-vintage-primary hover:underline">
              https://directus.io/privacy
            </a>
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.6 Shopify-Integration</h3>
          <p className="mb-2">
            Wir bieten Vendor-Partnern (gewerblichen Händlern) die Möglichkeit, ihren Shopify-Store mit {companyName} zu verbinden, um Produktdaten automatisch zu synchronisieren. Endkunden sind von dieser Datenverarbeitung nicht betroffen.
          </p>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">Zweck der Nutzung</h4>
          <p className="mb-2">
            Die Shopify-Integration ermöglicht die automatische Synchronisierung von Produktdaten (Titel, Beschreibung, Preis, Bilder, Bestand) zwischen dem Shopify-Store des Händlers und der {companyName}-Plattform. Nur Produkte, die im Shopify-Store mit dem Tag „vintagefindr" versehen sind, werden synchronisiert.
          </p>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">Verarbeitete Daten</h4>
          <ul className="list-disc list-inside space-y-1 mb-2">
            <li><strong>Shopify-Domain:</strong> Domain des verbundenen Shopify-Stores</li>
            <li><strong>OAuth Access Token:</strong> Verschlüsselt gespeichert (AES-256-GCM) zur Authentifizierung gegenüber der Shopify API</li>
            <li><strong>Produktdaten:</strong> Titel, Beschreibung, Marke, Preis, Bilder-URLs (max. 3), Bestandsmengen, Tags, Produkt-Handle</li>
          </ul>
          <p className="mb-2">
            <strong>Wichtig:</strong> Es werden <strong>keine Endkunden-Daten</strong> aus Shopify verarbeitet oder gespeichert – keine E-Mail-Adressen, Namen, Adressen oder Bestelldaten von Shopify-Kunden.
          </p>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">OAuth-Autorisierung</h4>
          <p className="mb-2">
            Händler autorisieren den Zugriff über Shopifys OAuth 2.0-Verfahren mit den minimalen Scopes: <strong>read_products</strong>, <strong>read_inventory</strong>, <strong>read_locations</strong> (ausschließlich Lese-Zugriff). Die Autorisierung ist jederzeit durch Deinstallation der App im Shopify-Store widerrufbar.
          </p>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">Bildverarbeitung</h4>
          <p className="mb-2">
            Produktbilder werden vom Shopify-CDN heruntergeladen und auf Bunny CDN (EU, Slowenien) hochgeladen, um eine einheitliche und performante Darstellung zu gewährleisten. Die Original-URLs werden durch CDN-URLs ersetzt. Details zur Datenverarbeitung durch Bunny CDN finden Sie unter Abschnitt 3.2.
          </p>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">Webhooks</h4>
          <p className="mb-2">
            Shopify sendet bei Produkt- und Bestandsänderungen automatisch Benachrichtigungen (Webhooks) an unsere Server. Alle Webhooks werden mittels HMAC-SHA256-Signatur verifiziert, um Manipulationen auszuschließen.
          </p>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">GDPR-Compliance Webhooks</h4>
          <p className="mb-2">
            Die App implementiert die von Shopify vorgeschriebenen GDPR-Webhooks:
          </p>
          <ul className="list-disc list-inside space-y-1 mb-2">
            <li><strong>customers/data_request:</strong> Keine Kundendaten gespeichert, daher keine Datenauskunft möglich</li>
            <li><strong>customers/redact:</strong> Keine Kundendaten zu löschen</li>
            <li><strong>shop/redact:</strong> Access Token wird gelöscht, alle Produkte werden deaktiviert</li>
          </ul>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">Anbieterinformationen</h4>
          <p className="mb-2">
            <strong>Shopify International Ltd.</strong><br />
            Irland (EU)
          </p>
          <p className="mb-2">
            <strong>Shopify Inc.</strong> (Hauptsitz)<br />
            151 O'Connor Street<br />
            Ottawa, Ontario, K2P 2L8<br />
            Kanada
          </p>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">Datenschutzmaßnahmen</h4>
          <ul className="list-disc list-inside space-y-1 mb-2">
            <li><strong>Verschlüsselte Token-Speicherung:</strong> Access Tokens werden mit AES-256-GCM verschlüsselt in unserer Datenbank gespeichert</li>
            <li><strong>Webhook-Verifizierung:</strong> Alle eingehenden Webhooks werden per HMAC-SHA256 verifiziert</li>
            <li><strong>Minimale Berechtigungen:</strong> Ausschließlich Lese-Zugriff (read-only) auf Produkt-, Bestands- und Standortdaten</li>
            <li><strong>Keine Endkunden-Daten:</strong> Die App fordert keinen Zugriff auf Kunden-, Bestell- oder Zahlungsdaten an</li>
            <li><strong>Token-Löschung:</strong> Bei Deinstallation der App wird der Access Token unwiderruflich gelöscht</li>
          </ul>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">Speicherdauer</h4>
          <ul className="list-disc list-inside space-y-1 mb-2">
            <li><strong>Produktdaten:</strong> Solange der Händler aktiv ist (Soft-Delete bei Deaktivierung)</li>
            <li><strong>Access Token:</strong> Bis zur Deinstallation der App (wird dann gelöscht)</li>
            <li><strong>Sync-Logs:</strong> 90 Tage</li>
          </ul>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">Rechtsgrundlage</h4>
          <p className="mb-2">
            Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) – Die Datenverarbeitung ist zur Erfüllung des Vertrags mit unseren Vendor-Partnern erforderlich.
          </p>

          <p className="mb-2">
            Weitere Informationen zum Datenschutz bei Shopify finden Sie unter:{" "}
            <a href="https://www.shopify.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-vintage-primary hover:underline">
              https://www.shopify.com/legal/privacy
            </a>
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.7 Cloudflare (CDN, DDoS-Schutz & Sicherheit)</h3>
          <p className="mb-2">
            Wir nutzen Cloudflare als Content Delivery Network (CDN), zur DDoS-Abwehr und zur Optimierung der Website-Sicherheit und Performance.
          </p>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">Zweck der Nutzung</h4>
          <p className="mb-2">
            Cloudflare fungiert als Reverse-Proxy zwischen Ihrem Browser und unseren Servern. Dies dient:
          </p>
          <ul className="list-disc list-inside space-y-1 mb-2">
            <li>Der Beschleunigung der Website-Auslieferung durch geographisch verteilte Server (CDN)</li>
            <li>Dem Schutz vor DDoS-Angriffen und bösartigem Traffic</li>
            <li>Der Bereitstellung von SSL/TLS-Verschlüsselung</li>
            <li>Der Optimierung der Performance durch Caching</li>
            <li>Der Abwehr von Bot-Traffic und Web-Angriffen (Web Application Firewall)</li>
          </ul>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">Verarbeitete Daten</h4>
          <p className="mb-2">
            Beim Besuch unserer Website werden folgende Daten durch Cloudflare verarbeitet:
          </p>
          <ul className="list-disc list-inside space-y-1 mb-2">
            <li><strong>IP-Adresse:</strong> Zur Auslieferung der Inhalte und zur Abwehr von Angriffen technisch erforderlich</li>
            <li><strong>HTTP-Anfrage:</strong> Aufgerufene URL, HTTP-Methode, Referrer</li>
            <li><strong>User-Agent:</strong> Browser und Betriebssystem</li>
            <li><strong>Zeitstempel:</strong> Datum und Uhrzeit des Zugriffs</li>
            <li><strong>Übertragene Datenmenge:</strong> Größe der übertragenen Daten</li>
            <li><strong>Cookies:</strong> Cloudflare kann technische Cookies setzen (z.B. "__cf_bm" für Bot-Management, "__cflb" für Load Balancing)</li>
          </ul>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">Anbieterinformationen</h4>
          <p className="mb-2">
            <strong>Cloudflare, Inc.</strong><br />
            101 Townsend Street<br />
            San Francisco, CA 94107<br />
            USA
          </p>
          <p className="mb-2">
            <strong>EU-Niederlassung:</strong><br />
            Cloudflare Portugal, Unipessoal Lda.<br />
            Largo Rafael Bordalo Pinheiro 29<br />
            1200-369 Lissabon<br />
            Portugal
          </p>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">Datenschutzmaßnahmen & Drittlandtransfer</h4>
          <p className="mb-2">
            Cloudflare verarbeitet Daten auf Servern weltweit, einschließlich in den USA. Es findet daher eine Datenübermittlung in Drittländer statt.
          </p>
          <ul className="list-disc list-inside space-y-1 mb-2">
            <li><strong>Data Privacy Framework (DPF):</strong> Cloudflare ist nach dem EU-U.S. Data Privacy Framework, der UK Extension sowie dem Swiss-U.S. Data Privacy Framework zertifiziert. Der Datentransfer erfolgt primär auf Grundlage des DPF-Programms (Art. 45 DSGVO - Angemessenheitsbeschluss)</li>
            <li><strong>Standardvertragsklauseln:</strong> Als zusätzlicher Schutzmechanismus gelten EU-Standardvertragsklauseln (Art. 46 DSGVO)</li>
            <li><strong>ISO/IEC 27001 zertifiziert:</strong> Cloudflare erfüllt internationale Sicherheitsstandards</li>
            <li><strong>SOC 2 Type II zertifiziert:</strong> Strenge Sicherheits- und Datenschutzstandards</li>
            <li><strong>PCI DSS Level 1 zertifiziert:</strong> Höchster Sicherheitsstandard für Zahlungsverkehr</li>
            <li><strong>Verschlüsselung:</strong> Alle Daten werden verschlüsselt übertragen (TLS 1.3)</li>
            <li><strong>Datenminimierung:</strong> Cloudflare verarbeitet nur die für die Bereitstellung der Dienste technisch notwendigen Daten</li>
            <li><strong>Kein Verkauf von Daten:</strong> Cloudflare verkauft keine personenbezogenen Daten an Dritte</li>
          </ul>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">Cloudflare Cookies</h4>
          <p className="mb-2">
            Cloudflare kann folgende technisch notwendige Cookies setzen:
          </p>
          <ul className="list-disc list-inside space-y-1 mb-2">
            <li><strong>__cf_bm:</strong> Bot-Management Cookie (Laufzeit: 30 Minuten) - Unterscheidet zwischen Menschen und Bots</li>
            <li><strong>__cflb:</strong> Load Balancing Cookie (Session-Cookie) - Optimiert die Lastverteilung</li>
            <li><strong>cf_clearance:</strong> Sicherheits-Challenge Cookie (bis zu 30 Tage) - Wird nur bei Sicherheitsprüfungen gesetzt</li>
          </ul>
          <p className="mb-2">
            Diese Cookies sind technisch erforderlich und benötigen gemäß § 25 Abs. 2 Nr. 2 TDDDG keine Einwilligung.
          </p>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">Speicherdauer</h4>
          <p className="mb-2">
            Cloudflare speichert Zugriffsstatistiken für maximal 30 Tage. Danach werden die Daten aggregiert und anonymisiert.
          </p>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">Rechtsgrundlage</h4>
          <p className="mb-2">
            Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse). Unser berechtigtes Interesse liegt in:
          </p>
          <ul className="list-disc list-inside space-y-1 mb-2">
            <li>Der Gewährleistung der Sicherheit, Stabilität und Performance unserer Website</li>
            <li>Dem Schutz vor DDoS-Angriffen, Bot-Traffic und anderen Sicherheitsbedrohungen</li>
            <li>Der Bereitstellung einer schnellen und zuverlässigen Website für alle Nutzer weltweit</li>
          </ul>

          <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-3">Widerspruchsrecht</h4>
          <p className="mb-2">
            Sie haben das Recht, der Datenverarbeitung durch Cloudflare zu widersprechen. Bitte beachten Sie jedoch, dass ein Widerspruch die Nutzung unserer Website erheblich beeinträchtigen oder unmöglich machen kann, da Cloudflare wesentliche Sicherheits- und Infrastrukturfunktionen bereitstellt.
          </p>

          <p className="mb-4">
            Weitere Informationen zum Datenschutz bei Cloudflare finden Sie unter:{" "}
            <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer" className="text-vintage-primary hover:underline">
              https://www.cloudflare.com/privacypolicy/
            </a>
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.8 Datenübermittlung in Drittländer</h3>
          <p className="mb-2">
            Soweit personenbezogene Daten an Empfänger außerhalb der Europäischen Union (EU) bzw. des Europäischen Wirtschaftsraums (EWR) übermittelt werden, erfolgt dies ausschließlich unter den Voraussetzungen der Art. 44 ff. DSGVO.
          </p>
          <p className="mb-2">
            Sofern für das jeweilige Drittland ein Angemessenheitsbeschluss besteht, stützen wir die Übermittlung auf Art. 45 DSGVO. Andernfalls verwenden wir geeignete Garantien, insbesondere Standarddatenschutzklauseln gemäß Art. 46 DSGVO.
          </p>
          <p className="mb-2">
            Informationen zu den im Einzelfall verwendeten Garantien können Sie unter den in dieser Datenschutzerklärung genannten Kontaktdaten anfordern.
          </p>
          <p className="text-sm text-gray-600 mt-2">
            (Art. 13 Abs. 1 lit. f DSGVO; Art. 44–46 DSGVO)
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Webanalyse mit PostHog</h2>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Umfang der Datenverarbeitung</h3>
          <p className="mb-2">
            Diese Website nutzt PostHog zur Analyse des Nutzerverhaltens. Die Verarbeitung erfolgt
            <strong> ausschließlich nach Ihrer ausdrücklichen Einwilligung</strong> (Art. 6 Abs. 1 lit. a DSGVO).
          </p>
          <p>
            Die Einwilligung erfolgt über ein Consent-Banner beim ersten Besuch der Website. Sie können Ihre Entscheidung jederzeit ändern (siehe Abschnitt 9).
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">4.2 Verarbeitete Daten</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Seitenaufrufe und Klickverhalten (nur manuell erfasste Events)</li>
            <li>Geräteinformationen (Browser, Betriebssystem, Bildschirmgröße)</li>
            <li>Verweildauer auf der Website</li>
            <li>Referrer (Quelle Ihres Besuchs)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">4.2a NICHT erfasste Daten</h3>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>IP-Adressen:</strong> Werden nicht erfasst oder gespeichert</li>
            <li><strong>Session-Aufzeichnungen:</strong> Keine Bildschirm- oder Mausaufzeichnungen</li>
            <li><strong>Autocapture:</strong> Keine automatische Erfassung von Formulareingaben oder Klicks</li>
            <li><strong>Sensible Daten:</strong> Passwörter, E-Mails, Telefonnummern werden gefiltert</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">4.3 Datenschutzmaßnahmen</h3>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Keine Cookies:</strong> Wir verwenden eine cookielose Analysemethode (Memory-Persistence)</li>
            <li><strong>EU-Server:</strong> Alle Daten werden ausschließlich auf EU-Servern (eu.i.posthog.com) gespeichert</li>
            <li><strong>Keine IP-Erfassung:</strong> IP-Adressen werden nicht erfasst oder gespeichert</li>
            <li><strong>Kein Autocapture:</strong> Nur manuell definierte Events werden erfasst</li>
            <li><strong>Keine Session-Aufzeichnungen:</strong> Bildschirm- und Mausaufzeichnungen sind deaktiviert</li>
            <li><strong>Property-Filterung:</strong> Sensible Daten werden automatisch gefiltert</li>
            <li><strong>DNT-Respekt:</strong> "Do Not Track"-Browser-Einstellungen werden respektiert</li>
            <li><strong>Speicherdauer:</strong> Daten werden nach 90 Tagen automatisch gelöscht</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">4.4 Anbieterinformationen</h3>
          <p className="mb-2">
            <strong>PostHog Inc.</strong><br />
            2261 Market Street #4008<br />
            San Francisco, CA 94114<br />
            USA
          </p>
          <p className="mb-2">
            <strong>Server-Standort:</strong> EU Cloud (eu.i.posthog.com)
          </p>
          <p className="mb-4">
            Obwohl der Hauptsitz des Anbieters in den USA liegt, werden alle Daten ausschließlich auf EU-Servern verarbeitet und gespeichert. Es findet grundsätzlich <strong>kein regulärer Drittlandtransfer</strong> statt.
          </p>
          <p className="mb-2">
            <strong>Zusätzliche Absicherung:</strong> PostHog ist nach dem EU-U.S. Data Privacy Framework, der UK Extension sowie dem Swiss-U.S. Data Privacy Framework zertifiziert. Für den Fall von technischem Support-Zugriff oder Wartungsarbeiten durch US-Mitarbeiter ist somit ein angemessenes Datenschutzniveau gewährleistet (Art. 45 DSGVO).
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">4.5 Zweck der Datenverarbeitung</h3>
          <p>
            Die Analyse dient der Verbesserung unseres Angebots und der Benutzerfreundlichkeit.
            Wir möchten verstehen, wie unsere Website genutzt wird, um sie optimal an Ihre Bedürfnisse anzupassen.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Klick-Tracking und Betrugsschutz</h2>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Zweck</h3>
          <p className="mb-4">
            Wenn Sie auf einen Partner-Shop-Link klicken, erfassen wir diesen Klick zur Abrechnung gegenüber Partnerhändlern und zur Verhinderung von Klickbetrug. Dies ist notwendig, um unsere Plattform zu finanzieren und faire Abrechnungen zu gewährleisten.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Verarbeitete Daten</h3>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li><strong>IP-Adresse:</strong> Wir speichern IP-Adressen nicht im Klartext, sondern in gehashter Form (SHA-256 mit Salt). Dadurch wird eine unmittelbare Zuordnung erheblich erschwert.</li>
            <li><strong>User-Agent:</strong> Browser und Betriebssystem (zur Bot-Erkennung)</li>
            <li><strong>Zeitstempel:</strong> Datum und Uhrzeit des Klicks</li>
            <li><strong>Referrer:</strong> Von welcher Seite Sie gekommen sind</li>
            <li><strong>Geklickter Shop:</strong> Welcher Partner-Shop aufgerufen wurde</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Speicherort</h3>
          <p className="mb-4">
            Die Klick-Tracking Daten werden in unserer Supabase-Datenbank (EU-Central-1, Frankfurt) gespeichert. Details zur Datenverarbeitung durch Supabase finden Sie unter Abschnitt 3.3.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Rechtsgrundlage</h3>
          <p className="mb-2">
            Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)
          </p>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li><strong>Unser berechtigtes Interesse:</strong> Schutz vor Missbrauch, korrekte Abrechnung mit Partnern, wirtschaftlicher Betrieb der Plattform</li>
            <li><strong>Ihre Interessen:</strong> IP-Adresse wird nicht im Klartext gespeichert, sondern nur als nicht rückverfolgbarer Hash. Es erfolgt keine personenbezogene Auswertung.</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Speicherdauer</h3>
          <p className="mb-4">
            12 Monate (zur nachvollziehbaren Abrechnung gegenüber Partnerhändlern, zur Bearbeitung von Rückfragen/Reklamationen sowie zur Aufklärung und Verhinderung von Missbrauch)
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Ihre Rechte</h3>
          <p>
            Sie haben ein Widerspruchsrecht nach Art. 21 DSGVO. Im Falle eines Widerspruchs prüfen wir, ob zwingende schutzwürdige Gründe für die Verarbeitung vorliegen, die Ihre Interessen überwiegen.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">6.0 Kontaktaufnahme (z. B. Kontaktformular, E-Mail)</h2>
          <p className="mb-4">
            Wenn Sie uns kontaktieren, verarbeiten wir die von Ihnen übermittelten Angaben (z. B. Name, E-Mail-Adresse, Inhalt der Nachricht), um Ihre Anfrage zu bearbeiten und zu beantworten.
          </p>
          <p className="mb-4">
            <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO, sofern die Anfrage auf den Abschluss oder die Durchführung eines Vertrags gerichtet ist; im Übrigen Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer sachgerechten Bearbeitung von Anfragen).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. E-Mail-Versand (Resend)</h2>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Zweck</h3>
          <p className="mb-4">
            Wir nutzen den E-Mail-Dienst Resend für den Versand von transaktionalen E-Mails und Benachrichtigungen. Dies umfasst:
          </p>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li>Kontaktformular-Anfragen (Weiterleitung von Nachrichten, die über unser Kontaktformular versendet werden)</li>
            <li>Transaktionale E-Mails (z. B. Passwort-Reset, E-Mail-Verifizierung, Registrierungsbestätigung)</li>
            <li>Benachrichtigungen an Vendor-Partner (z. B. Account-Freischaltung, neue Klicks, Shop-Informationen)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Verarbeitete Daten</h3>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li><strong>E-Mail-Adresse:</strong> Empfänger-Adresse</li>
            <li><strong>Name:</strong> Anrede und Name des Empfängers (falls angegeben)</li>
            <li><strong>E-Mail-Inhalt:</strong> Nachrichtentext mit ggf. personenbezogenen Daten</li>
            <li><strong>Metadaten:</strong> Zeitstempel, Zustellstatus, Öffnungs- und Klickraten (technisch erforderlich)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Anbieterinformationen</h3>
          <p className="mb-2">
            <strong>Resend, Inc.</strong><br />
            2261 Market Street #4990<br />
            San Francisco, CA 94114<br />
            USA
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Datenschutzmaßnahmen & Drittlandtransfer</h3>
          <p className="mb-2">
            Resend nutzt AWS-Server, die sich auch außerhalb der EU befinden können. Es findet daher eine Datenübermittlung in Drittländer (USA) statt.
          </p>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li><strong>GDPR-konform:</strong> Resend ist GDPR-compliant und hat entsprechende Zertifizierungen</li>
            <li><strong>Data Privacy Framework (DPF):</strong> Resend ist seit März 2025 nach dem EU-U.S. Data Privacy Framework sowie der UK Extension zertifiziert. Der Datentransfer erfolgt primär auf Grundlage des DPF-Programms (Art. 45 DSGVO - Angemessenheitsbeschluss)</li>
            <li><strong>Auftragsverarbeitung:</strong> Abschluss eines Data Processing Agreement (DPA) gemäß Art. 28 DSGVO</li>
            <li><strong>Standardvertragsklauseln:</strong> Als zusätzlicher Schutzmechanismus gelten EU-Standardvertragsklauseln (Art. 46 DSGVO)</li>
            <li><strong>Verschlüsselung:</strong> E-Mails werden verschlüsselt übertragen (TLS)</li>
            <li><strong>Minimierung:</strong> Es werden nur die für den Versand notwendigen Daten übermittelt</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Speicherdauer</h3>
          <p className="mb-4">
            E-Mail-Logs und Metadaten werden bei Resend für maximal 30 Tage gespeichert und anschließend automatisch gelöscht.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Rechtsgrundlage</h3>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li><strong>Kontaktformular-Anfragen:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an zuverlässigem E-Mail-Versand und Bearbeitung von Kontaktanfragen)</li>
            <li><strong>Transaktionale E-Mails:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) - notwendig zur Bereitstellung unserer Dienste</li>
            <li><strong>Benachrichtigungen an Vendors:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung mit Partnern)</li>
          </ul>

          <p className="mb-2">
            Weitere Informationen zum Datenschutz bei Resend finden Sie unter:{" "}
            <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-vintage-primary hover:underline">
              https://resend.com/legal/privacy-policy
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Zahlungsabwicklung für Vendor-Partner (Stripe)</h2>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Zweck</h3>
          <p className="mb-2">
            Wir nutzen Stripe zur Abwicklung von Zahlungen für <strong>Vendor-Partner</strong> (Händler), die auf unserer Plattform Klick-Pakete erwerben. Endkunden haben keine direkte Interaktion mit Stripe.
          </p>
          <p className="mb-4">
            <strong>Hinweis:</strong> Dieser Abschnitt betrifft ausschließlich Vendors (gewerbliche Partner), die Klick-Pakete kaufen, um ihre Produkte auf unserer Plattform zu bewerben.
          </p>
          <p className="mb-4">
            Es handelt sich um <strong>einmalige Zahlungen</strong> (One-Time Payments), nicht um Abonnements. Nicht genutzte Klicks verfallen nach Ablauf der Gültigkeitsdauer (derzeit 12 Monate / 365 Tage ab Kauf, siehe AGB § 9 Abs. 4).
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Verarbeitete Daten</h3>
          <p className="mb-2">
            Beim Kauf eines Klick-Pakets werden folgende Daten an Stripe übermittelt:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li><strong>E-Mail-Adresse:</strong> Ihre Vendor-E-Mail-Adresse</li>
            <li><strong>Benutzer-ID:</strong> Ihre eindeutige User-ID (als Stripe Customer Metadata)</li>
            <li><strong>Zahlungsinformationen:</strong> Kreditkartendaten (werden direkt von Stripe verarbeitet, nicht von uns gespeichert)</li>
            <li><strong>Transaktionsdaten:</strong> Paket-Auswahl, Betrag, Währung (EUR), Zeitstempel</li>
            <li><strong>Rechnungsdaten:</strong> Paket-Name, Anzahl Klicks, Rechnungsbetrag</li>
          </ul>
          <p className="mb-4">
            <strong>Wichtig:</strong> Zahlungsdaten (Kreditkartennummern) werden direkt von Stripe verarbeitet und niemals auf unseren Servern gespeichert.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Stripe Billing Portal</h3>
          <p className="mb-4">
            Vendors haben Zugriff auf das Stripe Billing Portal, wo sie:
          </p>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li>Rechnungen als PDF herunterladen können</li>
            <li>Zahlungshistorie einsehen können</li>
            <li>Zahlungsmethoden verwalten können</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Ablauf der Zahlungsabwicklung</h3>
          <ol className="list-decimal list-inside space-y-2 mb-4">
            <li>Vendor wählt ein Klick-Paket aus</li>
            <li>Weiterleitung zur Stripe Checkout-Seite (gehostet von Stripe)</li>
            <li>Eingabe der Zahlungsdaten auf der sicheren Stripe-Plattform</li>
            <li>Nach erfolgreicher Zahlung: Webhook-Benachrichtigung an unsere Server</li>
            <li>Aktivierung des Klick-Pakets in der Vendor-Datenbank (Supabase)</li>
            <li>Automatische Rechnungserstellung durch Stripe</li>
            <li>Rechnungs-Download im Billing Portal verfügbar</li>
          </ol>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Anbieterinformationen</h3>
          <p className="mb-2">
            <strong>Stripe Payments Europe, Ltd.</strong><br />
            Block 4, Harcourt Centre<br />
            Harcourt Road, Dublin 2<br />
            Irland (EU)
          </p>
          <p className="mb-4">
            <strong>Stripe, Inc.</strong> (Hauptsitz)<br />
            510 Townsend Street<br />
            San Francisco, CA 94103<br />
            USA
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Datenschutzmaßnahmen & Drittlandtransfer</h3>
          <p className="mb-2">
            Obwohl Stripe einen EU-Sitz in Irland hat, kann eine Übermittlung von Daten in die USA (Hauptsitz) nicht gänzlich ausgeschlossen werden.
          </p>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li><strong>PCI-DSS zertifiziert:</strong> Höchster Sicherheitsstandard für Kartenzahlungen</li>
            <li><strong>Verschlüsselung:</strong> Alle Zahlungsdaten werden verschlüsselt übertragen (TLS 1.2+)</li>
            <li><strong>DSGVO-konform:</strong> Stripe ist DSGVO-konform und erfüllt EU-Datenschutzstandards</li>
            <li><strong>Data Privacy Framework (DPF):</strong> Stripe ist nach dem EU-U.S. Data Privacy Framework, der UK Extension sowie dem Swiss-U.S. Data Privacy Framework zertifiziert. Der Datentransfer erfolgt primär auf Grundlage des DPF-Programms (Art. 45 DSGVO - Angemessenheitsbeschluss)</li>
            <li><strong>Auftragsverarbeitung:</strong> Abschluss eines Data Processing Agreement (DPA) gemäß Art. 28 DSGVO</li>
            <li><strong>Standardvertragsklauseln:</strong> Als zusätzlicher Schutzmechanismus gelten EU-Standardvertragsklauseln (Art. 46 DSGVO)</li>
            <li><strong>Datenminimierung:</strong> Wir übermitteln nur die für die Zahlung notwendigen Daten</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Speicherdauer</h3>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li><strong>Transaktionsdaten:</strong> Gespeichert für die Dauer der gesetzlichen Aufbewahrungspflicht (10 Jahre nach HGB/AO)</li>
            <li><strong>Stripe Customer-Profil:</strong> Solange Sie als Vendor aktiv sind</li>
            <li><strong>Zahlungsmethoden:</strong> Bis zur manuellen Löschung durch Sie im Billing Portal</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Rechtsgrundlage</h3>
          <p className="mb-4">
            Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) - Die Zahlungsabwicklung ist zur Erfüllung des Vertrags mit unseren Vendor-Partnern erforderlich.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Ihre Rechte als Vendor</h3>
          <p className="mb-2">
            Als Vendor haben Sie zusätzliche Rechte:
          </p>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li>Zugriff auf alle Rechnungen im Stripe Billing Portal</li>
            <li>Verwaltung und Löschung von Zahlungsmethoden</li>
            <li>Einsicht in die vollständige Zahlungshistorie</li>
            <li>Widerspruchsrecht gemäß Art. 21 DSGVO (beachten Sie jedoch die gesetzlichen Aufbewahrungspflichten)</li>
          </ul>

          <p className="mb-2">
            Weitere Informationen zum Datenschutz bei Stripe finden Sie unter:{" "}
            <a href="https://stripe.com/de/privacy" target="_blank" rel="noopener noreferrer" className="text-vintage-primary hover:underline">
              https://stripe.com/de/privacy
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Fehlerüberwachung (Sentry)</h2>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Zweck</h3>
          <p className="mb-4">
            Wir nutzen Sentry zur Überwachung und Behebung von technischen Fehlern auf unserer Website. Dies dient der Verbesserung der Stabilität und Benutzerfreundlichkeit unserer Plattform.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Verarbeitete Daten</h3>
          <p className="mb-2">
            Bei einem technischen Fehler werden folgende Daten erfasst:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li><strong>Fehlermeldung:</strong> Art und Beschreibung des aufgetretenen Fehlers</li>
            <li><strong>Stack Trace:</strong> Technische Informationen zur Fehlerursache</li>
            <li><strong>Browser & Betriebssystem:</strong> Zur Reproduktion des Fehlers</li>
            <li><strong>URL:</strong> Seite, auf der der Fehler aufgetreten ist</li>
            <li><strong>Zeitstempel:</strong> Datum und Uhrzeit des Fehlers</li>
            <li><strong>Performance-Daten:</strong> Ladezeiten und Transaktions-Traces (zur Optimierung)</li>
          </ul>
          <p className="mb-4">
            <strong>Nicht erfasst werden:</strong> Passwörter, Zahlungsdaten, E-Mail-Adressen oder andere personenbezogene Daten. Sensible Daten werden automatisch gefiltert.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Anbieterinformationen</h3>
          <p className="mb-2">
            <strong>Functional Software, Inc. (Sentry)</strong><br />
            45 Fremont Street, 8th Floor<br />
            San Francisco, CA 94105<br />
            USA
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Datenschutzmaßnahmen & Drittlandtransfer</h3>
          <p className="mb-2">
            Sentry verarbeitet Daten auf Servern in den USA. Es findet daher eine Datenübermittlung in Drittländer statt.
          </p>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li><strong>Data Privacy Framework (DPF):</strong> Sentry ist nach dem EU-U.S. Data Privacy Framework zertifiziert. Der Datentransfer erfolgt auf Grundlage des DPF-Programms (Art. 45 DSGVO - Angemessenheitsbeschluss)</li>
            <li><strong>SOC 2 Type II zertifiziert:</strong> Sentry erfüllt strenge Sicherheitsstandards</li>
            <li><strong>Auftragsverarbeitung:</strong> Data Processing Addendum (DPA) gemäß Art. 28 DSGVO</li>
            <li><strong>Standardvertragsklauseln:</strong> Als zusätzlicher Schutzmechanismus gelten EU-Standardvertragsklauseln (Art. 46 DSGVO)</li>
            <li><strong>Datenminimierung:</strong> Es werden nur technisch notwendige Daten zur Fehleranalyse erfasst</li>
            <li><strong>Automatische Filterung:</strong> Sensible Daten werden automatisch entfernt</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Speicherdauer</h3>
          <p className="mb-4">
            Fehlerdaten werden für maximal 90 Tage gespeichert und anschließend automatisch gelöscht.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Rechtsgrundlage</h3>
          <p className="mb-4">
            Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse). Unser berechtigtes Interesse liegt in der Gewährleistung eines stabilen und fehlerfreien Betriebs unserer Website sowie der schnellen Behebung technischer Probleme.
          </p>

          <p className="mb-2">
            Weitere Informationen zum Datenschutz bei Sentry finden Sie unter:{" "}
            <a href="https://sentry.io/privacy/" target="_blank" rel="noopener noreferrer" className="text-vintage-primary hover:underline">
              https://sentry.io/privacy/
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Cookies und lokaler Speicher (localStorage)</h2>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Verwendung von localStorage</h3>
          <p className="mb-4">
            Wir verwenden keine Tracking-Cookies. Für bestimmte Funktionen nutzen wir jedoch technisch notwendige Speichertechnologien (z. B. localStorage für die Speicherung Ihrer Einwilligungsentscheidung und Session-Cookies für Login-/Authentifizierungszwecke).
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Gespeicherte Daten im localStorage</h3>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>
              <strong>posthog_consent:</strong> Speichert Ihre Entscheidung zur Webanalyse ("accepted" oder "rejected")
              <ul className="list-disc list-inside ml-6 mt-1">
                <li>Zweck: Speicherung Ihrer Einwilligung für PostHog Analytics</li>
                <li>Speicherdauer: Dauerhaft (bis zur manuellen Löschung oder Browser-Cache-Reset)</li>
                <li>Rechtsgrundlage: Die Speicherung der Einwilligung im localStorage erfolgt gemäß § 25 Abs. 1 TDDDG in Verbindung mit Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)</li>
              </ul>
            </li>
            <li>
              <strong>Zuletzt angesehen:</strong> Speichert die IDs kürzlich besuchter Produkte zur Anzeige einer „Zuletzt angesehen"-Übersicht
              <ul className="list-disc list-inside ml-6 mt-1">
                <li>Zweck: Verbesserung der Nutzererfahrung durch schnellen Zugriff auf kürzlich betrachtete Produkte</li>
                <li>Speicherdauer: 30 Tage (automatische Löschung abgelaufener Einträge)</li>
                <li>Verarbeitung: Die Daten verbleiben ausschließlich auf Ihrem Gerät und werden nicht an unsere Server oder Dritte übermittelt</li>
                <li>Rechtsgrundlage: § 25 Abs. 2 Nr. 2 TDDDG (technisch erforderlich zur Bereitstellung der vom Nutzer gewünschten Funktion)</li>
              </ul>
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Technisch notwendige Cookies</h3>
          <p className="mb-2">
            Unsere Website verwendet technisch notwendige Cookies, die für die Funktion der Website erforderlich sind:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-2">
            <li><strong>Session-Cookies (Authentifizierung):</strong> Werden nur für die Authentifizierung (Login) verwendet. Diese Session-Cookies enthalten keine Tracking-Informationen und dienen ausschließlich der sicheren Bereitstellung der Login-Funktion. Sie werden automatisch gelöscht, wenn Sie Ihren Browser schließen oder sich ausloggen.</li>
            <li><strong>Cloudflare-Cookies (Sicherheit & Performance):</strong> Cloudflare setzt technisch notwendige Cookies zur Sicherstellung der Website-Sicherheit und Performance (siehe Abschnitt 3.7). Diese Cookies dienen der Bot-Erkennung, Load Balancing und DDoS-Abwehr.</li>
          </ul>
          <p className="mb-4">
            <strong>Rechtsgrundlage:</strong> § 25 Abs. 2 Nr. 2 TDDDG - Technisch notwendige Cookies benötigen keine Einwilligung.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Verwaltung & Löschung</h3>
          <p className="mb-2">
            Sie können die im localStorage gespeicherten Daten jederzeit selbst löschen:
          </p>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li>Über die Browser-Einstellungen (Cache/Cookies löschen)</li>
            <li>Über den Button "Einwilligung widerrufen" auf dieser Seite (siehe unten)</li>
            <li>Durch Nutzung des Browser-Inkognito-Modus (keine dauerhafte Speicherung)</li>
          </ul>
        </section>

        <section className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Ihre Einwilligung verwalten</h2>

          {mounted && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="font-medium">Aktueller Status:</span>
                {consentStatus === "accepted" && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Einwilligung erteilt
                  </span>
                )}
                {consentStatus === "rejected" && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    Einwilligung abgelehnt
                  </span>
                )}
                {!consentStatus && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    Noch nicht entschieden
                  </span>
                )}
              </div>

              <div className="flex gap-3">
                {consentStatus === "accepted" && (
                  <button
                    onClick={handleRevokeConsent}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
                  >
                    Einwilligung widerrufen
                  </button>
                )}
                {consentStatus === "rejected" && (
                  <button
                    onClick={handleGrantConsent}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                  >
                    Einwilligung erteilen
                  </button>
                )}
                {!consentStatus && (
                  <p className="text-sm text-gray-600">
                    Das Consent-Banner wird beim nächsten Seitenaufruf angezeigt.
                  </p>
                )}
              </div>

              <p className="text-sm text-gray-600">
                <strong>Hinweis:</strong> Nach dem Widerruf wird die Webanalyse sofort deaktiviert.
                Bereits erhobene Daten bleiben für die festgelegte Speicherdauer gespeichert,
                es werden jedoch keine neuen Daten mehr erfasst.
              </p>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">10a. Pflicht zur Bereitstellung von Daten</h2>
          <p className="mb-4">
            Die Bereitstellung bestimmter personenbezogener Daten ist für die Nutzung unserer Plattform erforderlich.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Nutzerkonto (Endnutzer)</h3>
          <p className="mb-4">
            Für die Erstellung und Nutzung eines Nutzerkontos sind insbesondere die Authentifizierungsdaten (z. B. E-Mail-Adresse und Login-/Session-Daten) erforderlich. Ohne diese Daten kann kein Nutzerkonto bereitgestellt und kein Login ermöglicht werden.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Profilangaben</h3>
          <p className="mb-4">
            Angaben wie ein Profilname oder weitere Profilinformationen sind – soweit angeboten – freiwillig. Wenn Sie diese Daten nicht bereitstellen, können Sie das Nutzerkonto grundsätzlich weiterhin nutzen; lediglich die jeweiligen Komfort-/Profilfunktionen sind ggf. eingeschränkt.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Vendor-Konto (Partnerhändler)</h3>
          <p className="mb-4">
            Für die Anlage und Nutzung eines Vendor-Kontos sowie für die technische Anbindung (z. B. Shopify-Integration) sind die hierfür notwendigen Händler-/Shop- und Kontaktdaten erforderlich. Ohne diese Daten können Vendor-Funktionen nicht bereitgestellt werden.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Zahlungsabwicklung (Vendor, Stripe)</h3>
          <p className="mb-2">
            Für den Erwerb von Klick-Paketen sind die für den Zahlungsvorgang erforderlichen Daten notwendig. Ohne diese Daten kann der Kauf nicht durchgeführt werden.
          </p>
          <p className="text-sm text-gray-600 mt-2">
            (Art. 13 Abs. 2 lit. e DSGVO)
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">10b. Automatisierte Entscheidungen / Profiling</h2>
          <p className="mb-2">
            Eine automatisierte Entscheidungsfindung einschließlich Profiling im Sinne von Art. 22 DSGVO, die Ihnen gegenüber rechtliche Wirkung entfaltet oder Sie in ähnlicher Weise erheblich beeinträchtigt, findet nicht statt.
          </p>
          <p className="text-sm text-gray-600 mt-2">
            (Art. 13 Abs. 2 lit. f DSGVO; Art. 22 DSGVO)
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Ihre Rechte als betroffene Person</h2>
          <p className="mb-3">Sie haben gegenüber uns folgende Rechte hinsichtlich der Sie betreffenden personenbezogenen Daten:</p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Auskunftsrecht (Art. 15 DSGVO):</strong> Sie können Informationen über Ihre von uns verarbeiteten Daten verlangen.</li>
            <li><strong>Berichtigungsrecht (Art. 16 DSGVO):</strong> Sie können die Korrektur unrichtiger Daten verlangen.</li>
            <li><strong>Löschungsrecht (Art. 17 DSGVO):</strong> Sie können unter bestimmten Bedingungen die Löschung Ihrer Daten fordern.</li>
            <li><strong>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO):</strong> Sie können unter bestimmten Voraussetzungen die Einschränkung der Verarbeitung Ihrer Daten verlangen, z. B. wenn Sie die Richtigkeit der Daten bestreiten.</li>
            <li><strong>Recht auf Datenübertragbarkeit (Art. 20 DSGVO):</strong> Sie haben das Recht, die Sie betreffenden personenbezogenen Daten, die Sie uns bereitgestellt haben, in einem strukturierten, gängigen und maschinenlesbaren Format zu erhalten und diese Daten einem anderen Verantwortlichen zu übermitteln.</li>
            <li><strong>Widerspruchsrecht gegen die Verarbeitung (Art. 21 DSGVO):</strong> SOFERN DIE DATENVERARBEITUNG AUF GRUNDLAGE VON ART. 6 ABS. 1 LIT. F DSGVO ERFOLGT, HABEN SIE JEDERZEIT DAS RECHT, AUS GRÜNDEN, DIE SICH AUS IHRER BESONDEREN SITUATION ERGEBEN, GEGEN DIE VERARBEITUNG WIDERSPRUCH EINZULEGEN.</li>
            <li><strong>Widerruf der Einwilligung (Art. 7 Abs. 3 DSGVO):</strong> Erteilte Einwilligungen können Sie jederzeit mit Wirkung für die Zukunft widerrufen.</li>
          </ul>
          <p className="mt-4">
            Zur Ausübung Ihrer Rechte wenden Sie sich bitte an: <a href="mailto:datenschutz@vintagefindr.de" className="text-vintage-primary hover:underline">datenschutz@vintagefindr.de</a>
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Bitte beachten Sie, dass wir zur Bearbeitung Ihrer Anfrage Ihre Identität überprüfen müssen, um die Auskunft an die richtige Person zu geben.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Beschwerderecht bei der Aufsichtsbehörde</h2>
          <p className="mb-4">
            Wenn Sie der Ansicht sind, dass die Verarbeitung Ihrer Daten gegen Datenschutzrecht verstößt,
            haben Sie das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren (Art. 77 DSGVO).
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Zuständige Aufsichtsbehörde</h3>
          <p className="mb-2">
            <strong>Der Hamburgische Beauftragte für Datenschutz und Informationsfreiheit (HmbBfDI)</strong><br />
            Ludwig-Erhard-Straße 22, 7. OG<br />
            20459 Hamburg
          </p>
          <p className="mb-2">
            Telefon: 040 / 428 54 - 4040<br />
            Fax: 040 / 428 54 - 4000<br />
            E-Mail: <a href="mailto:mailbox@datenschutz.hamburg.de" className="text-vintage-primary hover:underline">mailbox@datenschutz.hamburg.de</a><br />
            Website: <a href="https://datenschutz-hamburg.de" target="_blank" rel="noopener noreferrer" className="text-vintage-primary hover:underline">https://datenschutz-hamburg.de</a>
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. SSL- bzw. TLS-Verschlüsselung</h2>
          <p>
            Diese Seite nutzt aus Sicherheitsgründen eine SSL- bzw. TLS-Verschlüsselung. Dies schützt die Übertragung Ihrer Daten (z. B. Login-Daten, Zahlungsinformationen) vor dem Mitlesen durch Dritte. Sie erkennen dies am "https://" und dem Schloss-Symbol in der Browserzeile.
          </p>
        </section>

        <p className="text-sm text-gray-500 mt-8">
          Stand: März 2026
        </p>
      </div>
    </div>
  )
}
