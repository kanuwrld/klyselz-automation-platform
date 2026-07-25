import Link from "next/link";

export const metadata = { title: "Datenschutzhinweis · KLYSELZ" };

export default function Datenschutz() {
  return (
    <div className="container max-w-2xl py-20">
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">← Zurück</Link>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight">Datenschutzhinweis</h1>
      <div className="mt-8 space-y-5 text-muted-foreground">
        <p className="rounded-lg border border-border bg-muted p-4 text-foreground">
          Portfolio-Modus: Formulare sind deaktiviert. Diese Demo speichert keine über Formulare
          eingegebenen Kontakt- oder Briefing-Daten.
        </p>
        <section>
          <h2 className="font-semibold text-foreground">Hosting</h2>
          <p className="mt-1">
            Die Demo wird bei Vercel bereitgestellt. Beim Aufruf können technisch notwendige
            Verbindungsdaten wie IP-Adresse, Zeitpunkt, angeforderte URL und User-Agent in
            Server- und Sicherheitsprotokollen verarbeitet werden.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-foreground">Keine zusätzlichen Tracker</h2>
          <p className="mt-1">
            Die Portfolio-Konfiguration setzt keine Marketing- oder Analyse-Cookies und bindet
            keine Social-Media-Tracker ein.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-foreground">Produktionssperre</h2>
          <p className="mt-1">
            Kontaktfunktionen dürfen erst nach Ergänzung vollständiger Verantwortlichenangaben,
            Rechtsgrundlagen, Empfänger, Speicherdauer, Betroffenenrechte und
            Auftragsverarbeitungsverträge aktiviert werden.
          </p>
        </section>
        <p className="text-sm">
          Dieser Hinweis dokumentiert den technischen Demo-Modus. Er ersetzt keine
          einzelfallbezogene rechtliche Prüfung.
        </p>
      </div>
    </div>
  );
}
