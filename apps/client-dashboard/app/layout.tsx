import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KLYSELZ Kunden-Dashboard",
  description: "Anfragen, Termine und Support für Kunden von KLYSELZ",
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
