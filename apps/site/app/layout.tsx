import type { Metadata } from "next";
import "./globals.css";

const contactEnabled = process.env.NEXT_PUBLIC_CONTACT_ENABLED === "true";

export const metadata: Metadata = {
  title: contactEnabled
    ? "KLYSELZ — KI-Automatisierung für lokale Unternehmen"
    : "KLYSELZ — DACH Automation Platform Portfolio",
  description: contactEnabled
    ? "KLYSELZ baut Systeme für Kundenanfragen, Terminübergabe und sichtbare Abläufe."
    : "Technische Portfolio-Demonstration einer DACH-orientierten Plattform für Anfragen, CRM und Service Delivery.",
  openGraph: {
    title: contactEnabled
      ? "KLYSELZ — Automatisierte Anfragen für lokale Betriebe"
      : "KLYSELZ — Automation Platform Portfolio",
    description: contactEnabled
      ? "Anfragen erfassen, qualifizieren und in klare Abläufe übergeben."
      : "Next.js portfolio project with German product UI and English engineering documentation.",
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
