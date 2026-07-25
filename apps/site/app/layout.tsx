import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KLYSELZ — KI-Automatisierung für lokale Unternehmen",
  description:
    "KLYSELZ baut KI-Systeme, die rund um die Uhr auf Kundenanfragen antworten, Termine buchen und keine Anfrage verloren gehen lassen. Für Friseure, Salons & lokale Betriebe in Bayern.",
  openGraph: {
    title: "KLYSELZ — KI, die für dein Geschäft antwortet",
    description: "Nie wieder Kundenanfragen verlieren. Rund um die Uhr, DSGVO-konform.",
    locale: "de_DE",
    type: "website",
  },
  icons: {
    icon: "/brand/klyselz-favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="font-sans">{children}</body>
    </html>
  );
}
