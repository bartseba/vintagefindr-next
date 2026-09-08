/* eslint-disable react/no-unescaped-entities -- ported legal text, literal quote characters are part of the source content */
import type { Metadata } from "next";
import { companyName } from "@/constant/routes";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AGB() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        Allgemeine Geschäftsbedingungen
      </h1>

      <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 1 Geltungsbereich</h2>
          <p>
            Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der Plattform {companyName}. {companyName} ist ein Marktplatz, der Vintage-Händler und Käufer zusammenbringt.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 2 Leistungen</h2>
          <p>
            {companyName} stellt eine technische Online-Infrastruktur zur Verfügung, auf der registrierte Händler ihre Vintage-Produkte präsentieren können. Die Kaufverträge kommen ausschließlich zwischen den Händlern und den Käufern zustande. Der Betreiber wird nicht Vertragspartei der zwischen Nutzern und Händlern geschlossenen Kaufverträge.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 3 Registrierung</h2>
          <p>
            Die Nutzung der Plattform erfordert eine Registrierung. Bei der Registrierung sind wahrheitsgemäße und vollständige Angaben zu machen. Der Händler ist verpflichtet, seine Zugangsdaten vertraulich zu behandeln und vor dem Zugriff unbefugter Dritter zu schützen.
          </p>
          <p className="mb-2">
            (2) Nach erfolgreicher Registrierung auf der Plattform kann der Händler seinen Shopify-Store mit {companyName} verbinden. Dabei autorisiert der Händler über Shopifys OAuth-Verfahren den Zugriff auf Produktdaten, Bestandsdaten und Standortdaten seines Shopify-Stores (OAuth-Scopes: read_products, read_inventory, read_locations). Ein Zugriff auf Kundendaten (Bestellhistorie, Adressen, Namen) erfolgt ausdrücklich nicht. Die Verbindung kann jederzeit durch Deinstallation der App im Shopify-Store aufgehoben werden.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 4 Pflichten der Händler</h2>
          <p className="mb-2">
            (1) Händler verpflichten sich, nur authentische Vintage-Produkte anzubieten und diese wahrheitsgemäß zu beschreiben.
          </p>
          <p className="mb-2">
            (2) Der Händler ist verpflichtet, alle geltenden gesetzlichen Bestimmungen einzuhalten (Verbraucherschutz, Wettbewerbsrecht, Impressumspflicht, Preisangabenverordnung).
          </p>
          <p className="mb-2">
            (3) Produktbilder und Beschreibungen müssen den tatsächlichen Zustand der Ware widerspiegeln. Mängel sind deutlich zu kennzeichnen.
          </p>
          <p className="mb-2">
            (4) Listings sind aktuell zu halten; nicht verfügbare Artikel müssen zeitnah entfernt werden.
          </p>
          <p className="mb-2">
            (5) Der Händler stellt sicher, dass er über alle erforderlichen Rechte an den Inhalten (Texte, Bilder, Marken) verfügt und keine Rechte Dritter verletzt.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 5 Vertragsgegenstand</h2>
          <p className="mb-2">
            (1) Der Betreiber stellt dem Händler technische Funktionen zur Verfügung, insbesondere die Anlage eines Händlerkontos, das Einstellen von Listings sowie die Weiterleitung von Nutzern über externe Links auf die Shops der Händler.
          </p>
          <p className="mb-2">
            (2) Der Betreiber stellt zudem Statistiken über die generierten Klickzahlen im Händler-Dashboard bereit.
          </p>
          <p className="mb-2">
            (3) Für Händler mit verbundenem Shopify-Store stellt der Betreiber zusätzlich eine automatische Produktsynchronisierung bereit. Produkte, die im Shopify-Store mit dem Tag „vintagefindr" versehen sind, werden automatisch auf der Plattform eingestellt und bei Änderungen (Preis, Bestand, Beschreibung, Bilder) aktualisiert. Der Händler steuert die Sichtbarkeit seiner Produkte auf {companyName} ausschließlich über das Setzen oder Entfernen dieses Tags in Shopify.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 6 Registrierung und Vertragsschluss</h2>
          <p className="mb-2">
            (1) Die Registrierung ist nur für Unternehmer im Sinne des § 14 BGB zulässig.
          </p>
          <p className="mb-2">
            (2) Mit dem Absenden des Registrierungsformulars gibt der Händler ein Angebot auf Abschluss eines Nutzungsvertrags ab. Der Vertrag kommt zustande, wenn der Betreiber das Konto freischaltet oder bestätigt.
          </p>
          <p className="mb-2">
            (3) Ein Anspruch auf Zulassung zur Plattform besteht nicht.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 7 Leistungen des Betreibers und Koppelung an das Klickkontingent</h2>
          <p className="mb-2">
            (1) Der Betreiber stellt den Zugang zur Plattform im Rahmen des jeweils gebuchten Pakets zur Verfügung. Der Umfang der Leistungen, insbesondere die öffentliche Sichtbarkeit der Produktlistings und die Funktionsfähigkeit der Weiterleitungslinks, richtet sich zwingend nach dem jeweils aktuell verfügbaren Klickkontingent aus den vom Händler erworbenen Prepaid-Klickpaketen.
          </p>
          <p className="mb-2">
            (2) Der Betreiber bemüht sich um eine hohe Verfügbarkeit, übernimmt jedoch keine Garantie für eine unterbrechungsfreie Nutzung.
          </p>
          <p className="mb-2">
            (3) Der Betreiber schuldet keinem Händler eine bestimmte Platzierung (Ranking) oder eine Mindestanzahl an Klicks.
          </p>
          <p className="mb-2">
            <strong>Ranking-Parameter (Art. 5 P2B-VO):</strong><br />
            Die Platzierung der Produktlistings richtet sich nach folgenden Hauptparametern:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-2 ml-4">
            <li>
              <strong>(a) Verfügbarkeit eines aktiven Klickpakets:</strong> Produkte von Händlern ohne aktives oder verbrauchtes Klickguthaben werden nicht öffentlich angezeigt (siehe § 7 Abs. 4, No-Credit-Sperre).
            </li>
            <li>
              <strong>(b) Chronologische Sortierung:</strong> Die standardmäßige Anzeige erfolgt chronologisch nach dem Zeitpunkt der Einstellung bzw. letzten Aktualisierung des Produkts (neueste zuerst).
            </li>
            <li>
              <strong>(c) Nutzerseitige Filterung:</strong> Nutzer können die Darstellung durch Auswahl von Kategorien (z. B. Jacken, Streetwear), Marken oder andere Filteroptionen einschränken. Die chronologische Sortierung bleibt innerhalb der gefilterten Ergebnisse bestehen.
            </li>
            <li>
              <strong>(d) Spezielle Bereiche:</strong> In gesonderten Bereichen der Plattform (z. B. "Neuester Drop") kann eine abweichende Sortierung nach Aktualität oder kuratierten Auswahlkriterien erfolgen.
            </li>
          </ul>
          <p className="mb-2">
            Eine bevorzugte Platzierung einzelner Händler gegen Entgelt oder eine Personalisierung basierend auf Nutzerverhalten (Favoriten, Browserverlauf) findet nicht statt.
          </p>
          <p className="mb-2">
            (3a) <strong>Keine differenzierte Behandlung (Art. 7 P2B-VO):</strong> Der Betreiber bietet auf der Plattform keine eigenen Produkte an und vertreibt auch keine Produkte über verbundene Unternehmen. Eine differenzierte Behandlung einzelner Händler (z. B. durch bevorzugte Sichtbarkeit oder abweichende Zugangsbedingungen) findet nicht statt, sofern nicht sachliche Gründe (z. B. Sicherheitsmaßnahmen, Missbrauchsvermeidung oder Qualitätsanforderungen) eine unterschiedliche Behandlung erfordern.
          </p>
          <p className="mb-2">
            (4) <strong>Abhängigkeit der Sichtbarkeit (No-Credit-Sperre):</strong> Verfügt das Händlerkonto über kein aktives oder ein verbrauchtes Klickkontingent (0 Klicks), ist der Betreiber berechtigt, sämtliche Produktlistings des Händlers für die öffentliche Ansicht zu sperren oder die Weiterleitungsfunktionen zu deaktivieren. In diesem Fall bleibt das Händlerkonto als Verwaltungseinheit (Backend) bestehen, die Produkte werden jedoch nicht mehr öffentlich auf der Plattform angezeigt. Die Sichtbarkeit wird nach Erwerb und Gutschrift eines neuen Prepaid-Klickpakets wiederhergestellt.
          </p>
          <p className="mb-2">
            (5) <strong>Shopify-Integration:</strong> Der Betreiber synchronisiert ausschließlich im Shopify-Store hinterlegte Produktdaten (Titel, Beschreibung, Bilder, Preise, Lagerbestand). Es findet keine Übertragung oder Verarbeitung von Endkundendaten (Bestelldaten, Käuferinformationen) statt. Die Verantwortung für die Richtigkeit der im Shopify-Store hinterlegten Daten verbleibt beim Händler. Bei Nutzung der Shopify-Integration werden Produktbilder vom Shopify-CDN auf das Content Delivery Network des Betreibers (Bunny CDN) übertragen, um eine einheitliche und performante Darstellung zu gewährleisten. Bestandsänderungen werden in Echtzeit über Webhooks synchronisiert. Bei Deinstallation der Shopify-App werden sämtliche Produktlistings des Händlers deaktiviert und der gespeicherte Zugriffstoken unwiderruflich gelöscht.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 8 Sperrung von Inhalten, Sanktionen und vorübergehende Leistungseinschränkung</h2>
          <p className="mb-2">
            (1) Der Betreiber ist berechtigt, vom Händler eingestellte Inhalte ganz oder teilweise zu löschen oder die Sichtbarkeit der Listings einzuschränken, wenn Anhaltspunkte für Verstöße gegen Gesetze, Rechte Dritter oder diese AGB vorliegen.
          </p>
          <p className="mb-2">
            (1a) <strong>Konkrete Sperrgründe (Art. 4 P2B-VO):</strong><br />
            Die Sperrung kann insbesondere erfolgen bei:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-2 ml-4">
            <li>
              <strong>(a) Verstoß gegen Produktpflichten (§ 4):</strong> Angebot nicht-authentischer Produkte (§ 4 Abs. 1), falsche oder irreführende Produktbeschreibungen (§ 4 Abs. 3), nicht-aktualisierte veraltete oder verkaufte Artikel (§ 4 Abs. 4), fehlende Kennzeichnung von Mängeln (§ 4 Abs. 3)
            </li>
            <li>
              <strong>(b) Rechtsverletzungen:</strong> Verletzung von Urheberrechten, Markenrechten oder sonstigen Rechten Dritter (§ 4 Abs. 5), Verstöße gegen Verbraucherschutzrecht, Wettbewerbsrecht oder Impressumspflicht (§ 4 Abs. 2)
            </li>
            <li>
              <strong>(c) Technische Manipulationen:</strong> Klickbetrug oder Manipulation des Tracking-Systems (§ 11), Umgehung technischer Schutzmaßnahmen
            </li>
            <li>
              <strong>(d) Vertragsbruch:</strong> Wiederholte Verstöße gegen diese AGB, Zahlungsverzug bei kostenpflichtigen Features (falls zukünftig eingeführt)
            </li>
            <li>
              <strong>(e) Qualitätsmängel & Beschwerden:</strong> Wiederholte begründete Beschwerden von Käufern, systematische Qualitätsmängel der Listings
            </li>
          </ul>
          <p className="mb-2 text-sm">
            <em>Hinweis:</em> Die Aufzählung ist nicht abschließend. Der Betreiber behält sich das Recht vor, bei sonstigen schwerwiegenden Verstößen gegen Gesetze oder diese AGB zu handeln.
          </p>
          <p className="mb-2">
            (2) <strong>Abgrenzung zur Beendigung:</strong> Die Sperrung gemäß diesem Paragrafen ist eine vorübergehende, funktionsbezogene Maßnahme zur Sicherung des Plattformbetriebs. Sie stellt keine endgültige Kündigung des Vertragsverhältnisses dar. Eine dauerhafte Beendigung der Geschäftsbeziehung richtet sich ausschließlich nach § 13 (Laufzeit und Kündigung).
          </p>
          <p className="mb-2">
            (3) <strong>Mitteilungspflicht (Art. 4 P2B-VO):</strong> Der Betreiber teilt dem Händler die Gründe für eine Sperrung unverzüglich in Textform mit. Die Mitteilung enthält den konkreten Sperrgrund, die betroffenen Inhalte oder das betroffene Verhalten, die Rechtsgrundlage (Verweis auf AGB-Paragraph) sowie Hinweise auf Abhilfemöglichkeiten (falls zutreffend). Der Händler hat die Möglichkeit, innerhalb von <strong>14 Tagen</strong> schriftlich Stellung zu nehmen. Bei behebbaren Verstößen wird dem Händler eine angemessene Frist zur Abhilfe eingeräumt, sofern nicht eine sofortige Sperre aus Gründen der Plattformsicherheit oder des Nutzerschutzes erforderlich ist.
          </p>
          <p className="mb-2">
            (4) <strong>Freistellung:</strong> Der Händler stellt den Betreiber von sämtlichen Ansprüchen Dritter frei, die aufgrund von Inhalten des Händlers oder dessen Rechtsverletzungen geltend gemacht werden. Dies umfasst insbesondere:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-2 ml-4">
            <li>
              <strong>(a) Urheberrechtliche und markenrechtliche Ansprüche</strong> wegen Verletzung von Bild-, Text- oder Markenrechten in den vom Händler eingestellten Inhalten
            </li>
            <li>
              <strong>(b) Wettbewerbsrechtliche Ansprüche</strong> nach dem Gesetz gegen den unlauteren Wettbewerb (UWG), insbesondere wegen irreführender oder unzutreffender Produktbeschreibungen, fehlerhafter Preisangaben (PAngV) oder anderer wettbewerbswidriger Handlungen
            </li>
            <li>
              <strong>(c) Verstöße gegen gesetzliche Informationspflichten,</strong> insbesondere fehlerhafte oder fehlende Impressumsangaben, unzureichende Datenschutzhinweise oder Verstöße gegen Verbraucherschutzvorschriften
            </li>
            <li>
              <strong>(d) Abmahnungen durch Wettbewerbsverbände, Mitbewerber oder sonstige Dritte,</strong> die auf einem Verhalten oder Inhalten des Händlers beruhen
            </li>
          </ul>
          <p className="mb-2">
            Die Freistellung umfasst die <strong>vollständige Kostenerstattung</strong>, einschließlich:
          </p>
          <ul className="list-disc list-inside space-y-1 mb-2 ml-4">
            <li>Kosten außergerichtlicher Abmahnungen (Anwaltskosten, Vertragsstrafen)</li>
            <li>Gerichts- und Anwaltskosten bei gerichtlichen Auseinandersetzungen</li>
            <li>Kosten der notwendigen Rechtsverteidigung des Betreibers</li>
            <li>Schadensersatzansprüche Dritter</li>
          </ul>
          <p className="mb-2">
            Der Händler verpflichtet sich, den Betreiber bei der Abwehr unberechtiger Ansprüche zu unterstützen und alle erforderlichen Informationen und Unterlagen zur Verfügung zu stellen.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 9 Entgelte, Zahlungsabwicklung, Prepaid-Klickpakete</h2>
          <p className="mb-2">
            (1) Die Kontoführung ist grundsätzlich kostenfrei. Die Nutzung der Sichtbarkeit erfordert den Erwerb von Klickpaketen.
          </p>
          <p className="mb-2">
            (1a) <strong>Einmaliges Startguthaben:</strong> Neue Händler erhalten bei erfolgreicher Registrierung und Freischaltung ihres Kontos einmalig ein kostenloses Startguthaben. Dieses Startguthaben umfasst derzeit 30 Klicks und ist <strong>12 Monate (365 Tage) ab Registrierung</strong> gültig. Das Startguthaben ist <strong>einmalig, nicht übertragbar und nicht auszahlbar</strong>. Nach Ablauf der Gültigkeitsdauer oder Verbrauch des Startguthabens ist der Erwerb kostenpflichtiger Klickpakete erforderlich, um die Sichtbarkeit der Produktlistings aufrechtzuerhalten (siehe § 7 Abs. 4, No-Credit-Sperre). Ein Anspruch auf erneute Gewährung eines Startguthabens besteht nicht.
          </p>
          <p className="mb-2">
            (2) Der Kaufpreis für ein Prepaid-Klickpaket ist unmittelbar mit Kauf fällig.
          </p>
          <p className="mb-2">
            (3) Die Abrechnung erfolgt über externe Zahlungsdienstleister (derzeit Stripe).
          </p>
          <p className="mb-2">
            (4) <strong>Gültigkeit/Verfall/Verlängerung:</strong> Prepaid-Klicks sind ab Kaufdatum 12 Monate nutzbar. Händler können in den letzten 30 Tagen vor Ablauf eine Verlängerung um 6 Monate beantragen. Der Betreiber entscheidet über die Verlängerung nach billigem Ermessen (§ 315 BGB). Maßgebliche Kriterien für die Verlängerung sind insbesondere:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-2 ml-4">
            <li>Die durchschnittliche Aktualität der Listings des Händlers in den letzten 6 Monaten (keine veralteten „Leichen");</li>
            <li>Das Fehlen von berechtigten Nutzerbeschwerden wegen Nicht-Verfügbarkeit von Produkten;</li>
            <li>Die technische Integrität des Händlershops (funktionierende Weiterleitungslinks).</li>
          </ul>
          <p className="mb-2">
            (5) Eine Auszahlung oder Erstattung von Prepaid-Guthaben ist ausgeschlossen, es sei denn, der Betreiber hat eine etwaige Nichtnutzbarkeit zu vertreten (siehe hierzu § 13 Abs. 5).
          </p>
          <p className="mb-2">
            (6) Preisänderungen gelten nur für zukünftige Käufe.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 10 Haftung und Gewährleistung</h2>
          <p className="mb-2">
            (1) Der Betreiber haftet unbeschränkt für Vorsatz, grobe Fahrlässigkeit sowie bei Verletzung von Leben, Körper oder Gesundheit.
          </p>
          <p className="mb-2">
            (2) Bei leichter Fahrlässigkeit haftet der Betreiber nur bei Verletzung wesentlicher Vertragspflichten (Kardinalpflichten), begrenzt auf den vertragstypischen, vorhersehbaren Schaden.
          </p>
          <p className="mb-2">
            (3) Eine Haftung für die Funktionsfähigkeit der externen Händlershops ist ausgeschlossen.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 11 Klickmessung und Statistiken</h2>
          <p className="mb-2">
            (1) Klicks werden über ein serverseitiges Tracking-System erfasst.
          </p>
          <p className="mb-2">
            (2) <strong>Deduplizierung:</strong> Mehrfachklicks desselben Nutzers auf denselben Link innerhalb von <strong>30 Minuten</strong> werden nur einmal gezählt.
          </p>
          <p className="mb-2">
            (3) <strong>Klickbetrug:</strong> Der Betreiber ist berechtigt, unrechtmäßig generierte Klicks von der Abrechnung auszunehmen. Anhaltspunkte für Klickbetrug sind insbesondere:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-2 ml-4">
            <li>Ungewöhnlich hohe Klickraten von identischen IP-Adressen innerhalb kurzer Zeitintervalle;</li>
            <li>Klicks durch automatisierte Skripte oder Bots, die keine menschliche Interaktion aufweisen;</li>
            <li>Muster, die auf systematische Klick-Farmen hindeuten.</li>
          </ul>
          <p className="mb-2">
            (4) <strong>Plausibilisierungsanspruch:</strong> Der Betreiber wird dem Händler auf begründete Anfrage in Textform die Parameter erläutern, die zur Annahme von Klickbetrug geführt haben, soweit dies keine Sicherheitsinteressen des Tracking-Systems gefährdet.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 11a Internes Beschwerdemanagement (Art. 11 P2B-VO)</h2>
          <p className="mb-2">
            (1) Händler können Beschwerden in Textform an <a href="mailto:support@vintagefindr.de" className="text-vintage-primary hover:underline">support@vintagefindr.de</a> richten. Beschwerden können sich insbesondere beziehen auf:
          </p>
          <ul className="list-disc list-inside space-y-1 mb-2 ml-4">
            <li>(a) Maßnahmen des Betreibers nach § 8 (Sperrung, Einschränkung, Kündigung),</li>
            <li>(b) technische Störungen der Plattform, einschließlich behaupteter Fehler der Klickmessung (§ 11),</li>
            <li>(c) Fragen zur Ranking-/Sichtbarkeitslogik gemäß § 7.</li>
          </ul>
          <p className="mb-2">
            (2) Der Betreiber bestätigt den Eingang der Beschwerde und prüft diese zeitnah. Das Ergebnis der Prüfung wird dem Händler in Textform mitgeteilt.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 11b Mediation (Art. 12 P2B-VO)</h2>
          <p className="mb-2">
            (1) Der Betreiber ist bereit, zur Beilegung von Streitigkeiten im Zusammenhang mit der Erbringung der Plattformdienste eine Mediation durchzuführen.
          </p>
          <p className="mb-2">
            (2) Hierfür benennt der Betreiber folgende Mediatoren/Einrichtungen:
          </p>
          <ul className="list-disc list-inside space-y-1 mb-2 ml-4">
            <li>Zentrum für Europäischen Verbraucherschutz e.V., Bahnhofsplatz 3, 77694 Kehl am Rhein, Deutschland</li>
            <li>Allgemeine Verbraucherschlichtungsstelle des Zentrums für Schlichtung e.V., Straßburger Straße 8, 77694 Kehl am Rhein, Deutschland</li>
          </ul>
          <p className="mb-2">
            (3) Soweit nicht anders vereinbart, tragen die Parteien die Kosten der Mediation jeweils zur Hälfte.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 11c Statistiken / Datenzugang</h2>
          <p className="mb-2">
            (1) Der Betreiber stellt Händlern im Händler-Dashboard aggregierte Statistiken zur Nutzung der Plattform zur Verfügung. Dazu können insbesondere gehören: Gesamt-Klicks, eindeutige Klicks (Unique Clicks), Impressionen, CTR sowie eine Übersicht der am häufigsten geklickten Produkte („Top-Produkte") jeweils für definierte Zeiträume (z. B. letzte 30 Tage) und Vergleichszeiträume.
          </p>
          <p className="mb-2">
            (2) Die Statistiken werden ausschließlich in aggregierter Form bereitgestellt. Ein Anspruch auf Herausgabe von Rohdaten (z. B. IP-Adressen, Nutzerkennungen, vollständige Referrer-Informationen) besteht nicht.
          </p>
          <p className="mb-2">
            (3) „Unique Clicks" sind Klicks, die nach Maßgabe der Deduplizierungslogik gemäß § 11 Abs. 2 gezählt werden; daraus folgt, dass ein wiederholter Klick desselben Nutzers innerhalb des dort genannten Zeitfensters ggf. nur einmal berücksichtigt wird.
          </p>
          <p className="mb-2">
            (4) Die Statistiken dienen der Information und Abrechnung im Rahmen dieser AGB; geringfügige Abweichungen aufgrund technischer Mess- und Zuordnungsmechanismen sind möglich.
          </p>
          <p className="mb-2">
            (5) <strong>Top-Produkte:</strong> „Top-Produkte" bezeichnet eine Sortierung nach Klick-/Interaktionskennzahlen innerhalb des jeweiligen Zeitraums; eine Aussage über Verkäufe beim Händler ist damit nicht verbunden.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 12 Nutzungsrechte</h2>
          <p className="mb-3">
            Der Händler räumt dem Betreiber ein einfaches, räumlich unbeschränktes Nutzungsrecht an den eingestellten Inhalten (Bilder, Texte) ein, um diese auf der Plattform und in Marketingkanälen (z. B. Social Media) darzustellen. Dies umfasst auch Produktbilder und -texte, die über die Shopify-Integration automatisch synchronisiert werden.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            § 13 Laufzeit und Kündigung
          </h2>
          <p className="mb-2">
            (1) Der Vertrag läuft auf unbestimmte Zeit.
          </p>
          <p className="mb-2">
            (2) <strong>Ordentliche Kündigung durch den Händler:</strong> Der Händler kann den Nutzungsvertrag jederzeit mit einer Frist von 14 Tagen kündigen. Nach Wirksamkeit der Kündigung bleibt nicht genutztes Klickguthaben entsprechend der regulären Gültigkeitsdauer (§ 9 Abs. 4) für eine Reaktivierung des Kontos erhalten; eine Auszahlung erfolgt gemäß Abs. 5 nicht.
          </p>
          <p className="mb-2">
            (3) <strong>Beendigung durch den Betreiber:</strong> Der Betreiber kann den Vertrag ordentlich mit einer Frist von 30 Tagen kündigen (Art. 3 Abs. 2 P2B-VO). Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt. Ein wichtiger Grund liegt insbesondere vor, wenn der Händler trotz Abmahnung wiederholt gegen wesentliche Pflichten aus § 4 oder § 8 verstößt.
          </p>
          <p className="mb-2">
            (4) <strong>Begründungspflicht:</strong> Der Betreiber wird eine Kündigung gegenüber dem Händler auf einem dauerhaften Datenträger begründen, wobei die Gründe dem Katalog aus § 8 Abs. 1a entsprechen müssen.
          </p>
          <p className="mb-2">
            (5) <strong>Guthabenerstattung bei Unnutzbarkeit:</strong> Eine Auszahlung ungenutzten Guthabens ist grundsätzlich ausgeschlossen. Eine Erstattung des Restwerts (pro rata) erfolgt jedoch ausnahmsweise, wenn das Guthaben für den Händler unnutzbar wird und der Betreiber dies zu vertreten hat. Fälle der Unnutzbarkeit sind insbesondere:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-2 ml-4">
            <li>Die endgültige, vollständige Einstellung des Plattformbetriebs durch den Betreiber;</li>
            <li>Eine außerordentliche Kündigung durch den Händler wegen einer nachgewiesenen, erheblichen und dauerhaften Pflichtverletzung des Betreibers;</li>
            <li>Die endgültige Beendigung des Accounts durch den Betreiber, sofern kein Verschulden des Händlers vorliegt.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 14 Datenschutz und technische Dienstleister</h2>
          <p className="mb-2">
            (1) Informationen zur Erhebung und Speicherung personenbezogener Daten finden sich in der gesonderten Datenschutzerklärung des Betreibers.
          </p>
          <p className="mb-3">
            (2) <strong>E-Mail-Versand über Resend:</strong> Der Versand von E-Mails über das Kontaktformular und sonstige System-E-Mails (z. B. Bestätigungen, Benachrichtigungen) erfolgt über den externen E-Mail-Dienstleister Resend Inc. (Delaware, USA). Dabei werden folgende Daten an Resend übermittelt: E-Mail-Adresse des Absenders und Empfängers, Betreff, E-Mail-Inhalt sowie technische Metadaten (z. B. Zeitstempel, IP-Adresse). Die Datenverarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an zuverlässigem E-Mail-Versand). Weitere Informationen zum Datenschutz bei Resend finden Sie unter: <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-vintage-primary hover:underline">resend.com/legal/privacy-policy</a>.
          </p>
          <p className="mb-3">
            (3) <strong>Fehlerüberwachung über Sentry:</strong> Zur Überwachung und Behebung technischer Fehler nutzt der Betreiber den Dienst Sentry. Bei technischen Fehlern werden Fehlerberichte erfasst, die technische Informationen (Fehlermeldung, Browsertyp) enthalten. Der Betreiber konfiguriert Sentry so, dass die Erfassung personenbezogener Daten (z.B. IP-Adressen in Logs) nach Möglichkeit vermieden oder minimiert wird. Eine vollständige Identifizierbarkeit von Einzelpersonen ist durch den Betreiber über Sentry nicht beabsichtigt. Ergänzende Informationen zur Datenverarbeitung und den Betroffenenrechten finden sich in der Datenschutzerklärung.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 15 Änderungen der AGB</h2>
          <p className="mb-2">
            (1) Änderungen dieser AGB werden dem Händler mindestens 15 Tage (bei umfangreichen Änderungen 6 Wochen) vor dem geplanten Inkrafttreten in Textform mitgeteilt (Art. 3 Abs. 3 P2B-VO).
          </p>
          <p className="mb-2">
            (2) Die Änderungen gelten als genehmigt, wenn der Händler nicht innerhalb der Ankündigungsfrist widerspricht. Der Betreiber wird auf diese Folge gesondert hinweisen.
          </p>
          <p className="mb-2">
            (3) <strong>Folgen des Widerspruchs:</strong> Widerspricht der Händler fristgerecht, wird das Vertragsverhältnis zu den bisherigen Bedingungen fortgesetzt. Der Betreiber behält sich für diesen Fall jedoch vor, das Vertragsverhältnis ordentlich gemäß § 13 Abs. 3 zu kündigen, sofern eine Fortführung zum alten Regelwerk technisch oder wirtschaftlich unzumutbar ist.
          </p>
          <p className="mb-2">
            (4) <strong>Sonderkündigungsrecht:</strong> Der Händler hat im Falle einer Änderungsmitteilung das Recht, den Vertrag vor Ablauf der Änderungsfrist mit sofortiger Wirkung zu kündigen.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 16 Sonderbestimmungen B2B und Widerrufsrecht</h2>
          <p className="mb-2">
            (1) <strong>Status:</strong> Dieses Angebot richtet sich ausschließlich an gewerbliche Anbieter. Der Händler versichert, <strong>Unternehmer gemäß § 14 BGB</strong> zu sein.
          </p>
          <p className="mb-2">
            (2) <strong>Ausschluss Widerruf:</strong> Im Geschäftsverkehr zwischen Unternehmern (B2B) besteht <strong>kein gesetzliches Widerrufsrecht</strong> gemäß §§ 312g, 355 BGB. Eine solche Rückgabemöglichkeit für Klickpakete wird ausdrücklich nicht eingeräumt.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 17 Schlussbestimmungen</h2>
          <p className="mb-2">
            (1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.
          </p>
          <p className="mb-2">
            (2) Gerichtsstand für alle Streitigkeiten ist der Sitz des Betreibers, sofern der Händler Kaufmann ist.
          </p>
          <p className="mb-2">
            (3) Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt (Salvatorische Klausel).
          </p>
        </section>

        <p className="text-sm text-gray-500 mt-8">
          Stand: Februar 2026
        </p>
      </div>
    </div>
  )
}
