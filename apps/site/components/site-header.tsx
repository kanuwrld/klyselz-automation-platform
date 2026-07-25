import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

const links = [
  { href: "#problem", label: "Problem" },
  { href: "#loesung", label: "Lösung" },
  { href: "#ablauf", label: "Ablauf" },
  { href: "#preise", label: "Preise" },
];

export function SiteHeader({ contactEnabled = false }: { contactEnabled?: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="block" aria-label="KLYSELZ Startseite">
          <img src="/brand/klyselz-wordmark-black.svg" alt="KLYSELZ" className="h-6 w-auto" />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>
        <a href={contactEnabled ? "#kontakt" : "#showreel"} className={buttonVariants({ size: "sm" })}>
          {contactEnabled ? "Kostenlos testen" : "Demo ansehen"}
        </a>
      </div>
    </header>
  );
}
