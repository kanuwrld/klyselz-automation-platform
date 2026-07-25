import Link from "next/link";

export const metadata = { title: "Impressum · KLYSELZ" };

export default function Impressum() {
  return (
    <div className="container max-w-2xl py-20">
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">← Zurück</Link>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight">Impressum</h1>
      <div className="mt-8 space-y-5 text-muted-foreground">
        <p className="rounded-lg border border-border bg-muted p-4 text-foreground">
          Technische Portfolio-Demonstration. Kontakt-, Wartelisten- und Briefing-Funktionen sind deaktiviert.
        </p>
        <p>
          Diese öffentliche Demo dokumentiert Software- und Produktarbeit. Sie nimmt keine Aufträge,
          Zahlungen oder personenbezogenen Kontaktdaten entgegen.
        </p>
        <p>
          Quellcode und technischer Kontakt:{" "}
          <a
            className="underline hover:text-foreground"
            href="https://github.com/kanuwrld/klyselz-automation-platform"
            rel="noreferrer"
            target="_blank"
          >
            GitHub-Repository
          </a>
        </p>
        <p className="text-sm">
          Vor kommerzieller Aktivierung müssen vollständige Anbieterangaben gemäß § 5 DDG,
          verantwortliche Person, ladungsfähige Anschrift und Kontaktangaben ergänzt und
          rechtlich geprüft werden.
        </p>
      </div>
    </div>
  );
}
