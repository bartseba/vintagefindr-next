/* eslint-disable react/no-unescaped-entities -- ported legal text, literal quote characters are part of the source content */
import type { Metadata } from "next";
import { companyName } from "@/constant/routes";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        Nutzungsbedingungen
      </h1>

      <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 1 Geltungsbereich</h2>
            <p className="mb-2">
              (1) Diese Nutzungsbedingungen gelten für die Nutzung der Online-Plattform {companyName} durch private Nutzer und Besucher (nachfolgend „Nutzer").
            </p>
            <p className="mb-2">
              (2) Abweichende Bedingungen der Nutzer finden keine Anwendung.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 2 Gegenstand der Plattform und Vermittlerrolle</h2>
            <p className="mb-2">
              (1) {companyName} ist eine Aggregator-Plattform, die Vintage-Produkte verschiedener Online-Händler durchsuchbar macht und Nutzer mit diesen Händlern verbindet.
            </p>
            <p className="mb-2">
              (2) Die Plattform dient ausschließlich der Präsentation von Händlerangeboten, der Auffindbarkeit von Produkten durch Such- und Filterfunktionen sowie der Weiterleitung von Nutzern auf externe Händlerseiten.
            </p>
            <p className="mb-2">
              (3) Kaufverträge kommen ausschließlich zwischen dem jeweiligen Händler und dem Nutzer zustande. Der Betreiber von {companyName} wird nicht Vertragspartei, Verkäufer oder Anbieter der dargestellten Waren.
            </p>
            <p className="mb-2">
              (4) Der Betreiber stellt lediglich die technische Infrastruktur zur Verfügung. Eine vorab durchgeführte Prüfung der Händlerangebote auf Rechtmäßigkeit oder Richtigkeit findet nicht statt. Bei Kenntniserlangung von rechtswidrigen Inhalten ergreift der Betreiber Maßnahmen gemäß seinem Melde- und Abhilfeverfahren (§ 7). Im Übrigen richtet sich die Verantwortlichkeit des Betreibers nach den allgemeinen gesetzlichen Bestimmungen, insbesondere der Verordnung (EU) 2022/2065 (DSA).
            </p>
            <p className="mb-2">
              (5) <strong>Widerruf/Rückgabe.</strong> Etwaige gesetzliche Widerrufsrechte sowie Rückgabe- oder Gewährleistungsrechte bestehen – soweit anwendbar – ausschließlich gegenüber dem jeweiligen Händler, der Vertragspartner des Nutzers wird. VintageFindr nimmt keine Widerrufe oder Rücksendungen entgegen und erstattet keine Kaufpreise. Maßgeblich sind die Informationen und Bedingungen auf der Website des Händlers. VintageFindr ist nicht bevollmächtigt, Widerrufe, Rücktrittserklärungen, Mängelanzeigen oder sonstige rechtsgeschäftliche Erklärungen im Namen des Händlers entgegenzunehmen.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 2a Geschäftsmodell, Vergütung und Ranking</h2>
            <p className="mb-2">
              (1) {companyName} finanziert sich durch kostenpflichtige Weiterleitungen zu Partnerhändlern. Händler buchen Klick-Pakete beim Betreiber, um ihre Produkte auf der Plattform zu präsentieren.
            </p>
            <p className="mb-2">
              (2) Die Vergütung durch Händler beeinflusst nicht die Auswahl oder Sortierung der Produkte. Das Ranking der Suchergebnisse basiert primär auf der Relevanz (Übereinstimmung mit dem Suchbegriff), der Aktualität des Angebots sowie ggf. gewählten Filtereinstellungen des Nutzers. Es erfolgt keine bevorzugte Platzierung allein aufgrund der Zahlung von Entgelten.
            </p>
            <p className="mb-2">
              (3) Durch die Nutzung der Plattform entstehen dem Nutzer keine Kosten gegenüber {companyName}.
            </p>
            <p className="mb-2">
              (4) Zur Verhinderung von Missbrauch (Klick-Betrug) setzt der Betreiber technische Maßnahmen ein (Deduplizierung, Bot-Erkennung, Rate-Limiting). Hierbei werden IP-Adressen zur Wahrung berechtigter Interessen (Art. 6 Abs. 1 lit. f DSGVO) pseudonymisiert (als nicht-reversibler Hash) verarbeitet. Details zur Datenverarbeitung finden sich in der Datenschutzerklärung.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 2b Produktbilder und -informationen</h2>
            <p className="mb-2">
              (1) Alle dargestellten Produktinformationen stammen von den Partnerhändlern und werden automatisiert aggregiert.
            </p>
            <p className="mb-2">
              (2) Der Betreiber übernimmt keine Gewähr für die Vollständigkeit, Richtigkeit oder Verfügbarkeit dieser Informationen. Maßgeblich sind die Angaben auf den Webseiten der Händler.
            </p>
            <p className="mb-2">
              (3) Urheberrechte an Bildern verbleiben bei den Händlern. Der Betreiber kategorisiert diese Daten lediglich zur besseren Auffindbarkeit.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 3 Nutzung der Plattform</h2>
            <p className="mb-2">
              (1) Die Suche und Ansicht von Produkten ist registrierungsfrei möglich.
            </p>
            <p className="mb-2">
              (2) Ein Anspruch auf ununterbrochene Verfügbarkeit der Plattform oder bestimmter Funktionen besteht nicht. Der Betreiber bemüht sich um eine hohe Verfügbarkeit; erforderliche Wartungsarbeiten, Sicherheitsgründe oder Ereignisse außerhalb des Einflussbereichs (z. B. Störungen öffentlicher Netze) können zu vorübergehenden Einschränkungen führen.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 4 Registrierung und Nutzerkonto</h2>
            <p className="mb-2">
              (1) Bei Registrierung sind wahre Angaben zu machen. Zugangsdaten sind vertraulich zu behandeln.
            </p>
            <p className="mb-2">
              (2) Der Nutzer hat Zugangsdaten durch geeignete Maßnahmen vor dem Zugriff Dritter zu schützen und den Betreiber bei Verdacht einer unbefugten Nutzung unverzüglich zu informieren. Der Nutzer haftet für Aktivitäten über sein Konto nur, soweit er die missbräuchliche Nutzung zu vertreten hat.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 5 Pflichten der Nutzer; unzulässige Nutzung; Durchsetzung</h2>
            <p className="mb-2">
              (1) <strong>Zulässige Nutzung.</strong> Nutzer dürfen {companyName} ausschließlich zu privaten Informations- und Suchzwecken nutzen.
            </p>
            <p className="mb-2">
              (2) <strong>Unzulässige Nutzung.</strong> Untersagt ist insbesondere,
            </p>
            <ul className="list-disc ml-6 mb-4">
              <li>die Plattform in rechtswidriger Weise zu nutzen,</li>
              <li>automatisierte Systeme (z. B. Bots, Scraper, Crawling-Tools) einzusetzen, um Inhalte, Daten oder Strukturen der Plattform auszulesen, zu kopieren oder zu überwachen, insbesondere wenn dies die Plattformleistung beeinträchtigt oder Schutzmaßnahmen umgeht, soweit nicht gesetzlich zulässig oder ausdrücklich durch den Betreiber gestattet,</li>
              <li>technische Schutzmaßnahmen des Betreibers zu umgehen oder zu beeinträchtigen (z. B. durch Umgehung von Rate-Limits oder Missbrauch von Schnittstellen),</li>
              <li>Klickzahlen oder Weiterleitungen zu manipulieren, insbesondere durch systematisches Anklicken ohne reales Interesse, koordinierte Klick-Aktionen oder sonstige Handlungen, die auf eine künstliche Erhöhung von Kennzahlen gerichtet sind.</li>
            </ul>
            <p className="mb-2">
              (3) <strong>Maßnahmen bei Verstößen (Maßnahmenkatalog).</strong> Bei Anhaltspunkten für Verstöße gegen diese Nutzungsbedingungen oder bei rechtswidrigen Inhalten kann der Betreiber – unter Berücksichtigung der Schwere, Häufigkeit und Offensichtlichkeit – insbesondere folgende Maßnahmen ergreifen:
            </p>
            <ul className="list-disc ml-6 mb-4">
              <li>Hinweis/Warnung an den Nutzer,</li>
              <li>vorübergehende Einschränkung einzelner Funktionen (z. B. Rate-Limiting),</li>
              <li>vorübergehende Sperrung,</li>
              <li>dauerhafte Sperrung,</li>
              <li>sonstige technisch erforderliche Schutzmaßnahmen zur Missbrauchsabwehr.</li>
            </ul>
            <p className="mb-2">
              (4) <strong>Verhältnismäßigkeit; sofortige Maßnahmen.</strong> Eine sofortige Sperrung ohne vorherige Warnung bleibt vorbehalten, wenn (i) ein schwerwiegender Verstoß vorliegt, (ii) eine Wiederholungsgefahr besteht oder (iii) die sofortige Maßnahme erforderlich ist, um Schäden, Rechtsverletzungen oder eine Beeinträchtigung der Plattformintegrität zu verhindern.
            </p>
            <p className="mb-2">
              (5) <strong>Keine Beweislastumkehr.</strong> Die vorstehenden Regelungen enthalten keine Beweislastumkehr zu Lasten des Nutzers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 6 Haftung des Betreibers</h2>
            <p className="mb-2">
              (1) Der Betreiber haftet unbeschränkt bei Vorsatz, grober Fahrlässigkeit sowie bei Verletzung von Leben, Körper oder Gesundheit.
            </p>
            <p className="mb-2">
              (2) Bei leicht fahrlässiger Verletzung wesentlicher Vertragspflichten (Kardinalpflichten) ist die Haftung auf den vertragstypischen, vorhersehbaren Schaden begrenzt.
            </p>
            <p className="mb-2">
              (3) {companyName} ist nicht Verkäufer und schuldet keine Lieferung/Leistung aus den zwischen Nutzer und Händler geschlossenen Verträgen. Für Pflichtverletzungen des Händlers haftet VintageFindr nicht. Unberührt bleibt die Haftung von VintageFindr nach § 6 (1) und (2) für eigene Pflichtverletzungen im Rahmen der Plattformbereitstellung/Vermittlung.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 7 Meldung rechtswidriger Inhalte („Notice-and-Action") und Abhilfe</h2>
            <p className="mb-2">
              (1) <strong>Meldemöglichkeit.</strong> Nutzer können Inhalte, die über {companyName} abrufbar sind und die sie für rechtswidrig halten (z. B. offensichtlich rechtsverletzende Produktbilder, Marken- oder Urheberrechtsverletzungen, verbotene Warenangebote), dem Betreiber melden.
            </p>
            <p className="mb-2">
              (2) <strong>Meldewege.</strong> Meldungen können eingereicht werden über:
            </p>
            <ul className="list-disc ml-6 mb-4">
              <li>E-Mail: <a href="mailto:abuse@vintagefindr.de" className="text-vintage-primary hover:underline">abuse@vintagefindr.de</a>, oder</li>
              <li>das Kontakt-/Meldeformular auf der Webseite.</li>
            </ul>
            <p className="mb-2">
              (3) <strong>Erforderliche Angaben.</strong> Damit der Betreiber die Meldung effizient prüfen kann, soll eine Meldung mindestens enthalten:
            </p>
            <ul className="list-disc ml-6 mb-4">
              <li>eine hinreichend genaue Angabe, welcher Inhalt beanstandet wird (z. B. Produktlink/Produkt-ID/Screenshot),</li>
              <li>eine Beschreibung, weshalb der Inhalt rechtswidrig sein soll (einschließlich der betroffenen Rechte oder Normen, soweit bekannt),</li>
              <li>soweit vorhanden, Nachweise oder zusätzliche Informationen, die die Prüfung ermöglichen (z. B. Rechteinhaberschaft, Aktenzeichen/Beleg, Originalquelle),</li>
              <li>eine Kontaktmöglichkeit für Rückfragen (z. B. E-Mail-Adresse).</li>
            </ul>
            <p className="mb-2">
              (4) <strong>Prüfung und Abhilfe.</strong> Der Betreiber prüft Meldungen in angemessener Zeit und trifft bei hinreichenden Anhaltspunkten geeignete Maßnahmen. Geeignete Maßnahmen können insbesondere sein: (i) Entfernung oder Deaktivierung des Inhalts auf VintageFindr, (ii) Entfernung/Deaktivierung der Verlinkung oder (iii) sonstige Einschränkungen der Sichtbarkeit.
            </p>
            <p className="mb-2">
              (5) <strong>Missbräuchliche Meldungen.</strong> Offensichtlich missbräuchliche oder bewusst unwahre Meldungen können unbeachtet bleiben; weitergehende Rechte des Betreibers bleiben unberührt.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 7a Information über Moderationsentscheidungen (Begründung)</h2>
            <p className="mb-2">
              (1) <strong>Grundsatz.</strong> Soweit der Betreiber Inhalte entfernt, deaktiviert oder deren Sichtbarkeit einschränkt oder Nutzer nach diesen Nutzungsbedingungen sperrt, informiert der Betreiber den betroffenen Nutzer – soweit möglich und zumutbar – über die wesentlichen Gründe der Entscheidung.
            </p>
            <p className="mb-2">
              (2) <strong>Inhalt der Information.</strong> Die Information soll insbesondere enthalten:
            </p>
            <ul className="list-disc ml-6 mb-4">
              <li>welche Maßnahme ergriffen wurde (z. B. Entfernung eines Inhalts, Einschränkung, Sperre),</li>
              <li>die wesentlichen tatsächlichen Gründe,</li>
              <li>die herangezogene Grundlage (z. B. Verstoß gegen diese Nutzungsbedingungen oder Rechtswidrigkeit),</li>
              <li>soweit vorgesehen, Hinweise auf Möglichkeiten der Überprüfung/Beanstandung der Entscheidung (z. B. Beschwerde nach § 7b).</li>
            </ul>
            <p className="mb-2">
              (3) <strong>Ausnahmen.</strong> Eine Information kann unterbleiben, soweit und solange dies erforderlich ist, um Rechtsverstöße zu verhindern oder zu verfolgen oder sofern gesetzliche Vorgaben entgegenstehen.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 7b Internes Beschwerdeverfahren</h2>
            <p className="mb-2">
              (1) <strong>Beschwerdemöglichkeit.</strong> Betroffene können eine Entscheidung nach § 7 oder § 7a (z. B. Entfernung/Deaktivierung eines Inhalts oder Sperrung) innerhalb von 6 Monaten ab Zugang der Information beanstanden.
            </p>
            <p className="mb-2">
              (2) <strong>Einreichung.</strong> Beschwerden sind per E-Mail an <a href="mailto:abuse@vintagefindr.de" className="text-vintage-primary hover:underline">abuse@vintagefindr.de</a> oder über das dafür vorgesehene Formular einzureichen und sollen die betroffene Entscheidung (z. B. Produkt-ID/Datum) bezeichnen sowie kurz begründen.
            </p>
            <p className="mb-2">
              (3) <strong>Prüfung.</strong> Der Betreiber prüft die Beschwerde in angemessener Zeit und teilt das Ergebnis mit.
            </p>
            <p className="mb-2">
              (4) <strong>Unberührt.</strong> Gesetzliche Rechte, insbesondere gerichtliche Geltendmachung, bleiben unberührt.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 8 Sperrung und Ausschluss</h2>
            <p className="mb-2">
              (1) <strong>Voraussetzungen.</strong> Der Betreiber kann Nutzer sperren oder ausschließen, wenn der Nutzer gegen diese Nutzungsbedingungen verstößt und die Maßnahme unter Berücksichtigung der Schwere, Häufigkeit und Umstände des Verstoßes erforderlich ist.
            </p>
            <p className="mb-2">
              (2) <strong>Arten der Sperrung.</strong> Sperrungen können vorübergehend oder dauerhaft erfolgen.
            </p>
            <p className="mb-2">
              (3) <strong>Wiederholte Verstöße.</strong> Bei wiederholten Verstößen oder schwerwiegendem Missbrauch kann eine dauerhafte Sperrung erfolgen.
            </p>
            <p className="mb-2">
              (4) <strong>Information.</strong> Soweit möglich informiert der Betreiber den Nutzer über die Sperre und deren wesentliche Gründe gemäß § 7a.
            </p>
            <p className="mb-2">
              (5) <strong>Kein Anspruch auf Wiederherstellung.</strong> Ein Anspruch auf Wiederherstellung besteht nicht, wenn die Sperre aufgrund schwerwiegenden oder wiederholten Missbrauchs gerechtfertigt ist.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 9 Datenschutz</h2>
            <p className="mb-2">
              Die Verarbeitung personenbezogener Daten erfolgt gemäß der gesonderten Datenschutzerklärung unter Einhaltung der DSGVO.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 10 Änderungen der Nutzungsbedingungen</h2>
            <p className="mb-2">
              (1) <strong>Nicht wesentliche Änderungen (Opt-out).</strong> Der Betreiber kann diese Nutzungsbedingungen ändern, soweit die Änderung erforderlich ist (z. B. Gesetzesänderung, höchstrichterliche Rechtsprechung, Sicherheits-/Missbrauchsabwehr, technische Anpassungen ohne Auswirkungen auf Hauptleistungspflichten, Schließung von Regelungslücken) oder die Änderung rein vorteilhaft für Nutzer ist, und soweit die Änderung die Nutzer nicht unangemessen benachteiligt. Nicht wesentlich sind insbesondere Änderungen, die den Kern der Plattformleistung (Produktsuche und Weiterleitung) nicht verändern und keine neuen wesentlichen Pflichten für Nutzer begründen.
            </p>
            <p className="mb-2">
              (2) <strong>Information und Widerspruch.</strong> Registrierte Nutzer werden mindestens vier Wochen vor Inkrafttreten per E-Mail über die Änderungen informiert. Die Änderungsmitteilung enthält eine Zusammenfassung der Änderungen und einen Hinweis auf das Kündigungsrecht des Nutzers. Die Änderungen gelten als angenommen, wenn der Nutzer nicht innerhalb dieser Frist widerspricht; hierauf wird in der Änderungsmitteilung gesondert hingewiesen.
            </p>
            <p className="mb-2">
              (3) <strong>Wesentliche Änderungen (Opt-in).</strong> Wesentliche Änderungen, insbesondere solche, die neue wesentliche Pflichten begründen oder den Kern der Leistung verändern, werden nur wirksam, wenn der Nutzer ihnen ausdrücklich zustimmt.
            </p>
            <p className="mb-2">
              (4) <strong>Widerspruch und Kündigung.</strong> Im Falle eines Widerspruchs gegen nicht wesentliche Änderungen kann der Betreiber das Nutzungsverhältnis mit angemessener Frist kündigen, wenn (i) die Änderung zur Anpassung an zwingendes Recht oder zur Abwehr erheblicher Sicherheits-/Missbrauchsrisiken erforderlich ist und (ii) dem Betreiber das Festhalten am Vertrag ohne die Änderung nicht zumutbar ist.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 11 Streitbeilegung</h2>
            <p className="mb-2">
              Der Betreiber ist nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle gemäß § 36 VSBG teilzunehmen.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 12 Kontaktstellen</h2>
            <p className="mb-2">
              (1) <strong>Kontaktstelle für Nutzer.</strong> Nutzer können den Betreiber elektronisch kontaktieren unter <a href="mailto:kontakt@vintagefindr.de" className="text-vintage-primary hover:underline">kontakt@vintagefindr.de</a> (Betreff: „Nutzeranfrage").
            </p>
            <p className="mb-2">
              (2) <strong>Kontaktstelle für Behörden.</strong> Zuständige Behörden können den Betreiber elektronisch kontaktieren unter <a href="mailto:kontakt@vintagefindr.de" className="text-vintage-primary hover:underline">kontakt@vintagefindr.de</a> (Betreff: „Behördenanfrage").
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 13 Schlussbestimmungen</h2>
            <p className="mb-2">
              (1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.
            </p>
            <p className="mb-2">
              (2) Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt (§ 306 BGB).
            </p>
          </section>

        <p className="text-sm text-gray-500 mt-8">
          Stand: März 2026
        </p>
      </div>
    </div>
  )
}
