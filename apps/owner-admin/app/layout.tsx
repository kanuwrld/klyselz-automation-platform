import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KLYSELZ Owner Admin",
  description: "Agentur-CRM, Kunden, Tickets und Inbound Leads",
  icons: {
    icon: "/brand/klyselz-favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-muted/30 antialiased">{children}</body>
    </html>
  );
}
