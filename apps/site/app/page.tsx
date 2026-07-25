import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { ContactForm } from "@/components/contact-form";
import { HeroSubscribe } from "@/components/hero-subscribe";
import { Moon, Phone, TrendingDown, MessageSquare, CalendarCheck, Star, LayoutDashboard, Check } from "lucide-react";

const problems = [
  { icon: Moon, title: "Anfragen nach Feierabend", text: "Nachrichten um 21 Uhr bleiben bis morgen liegen — der Kunde hat längst woanders gebucht." },
  { icon: Phone, title: "Immer dieselben Fragen", text: "Preise, Öffnungszeiten, freie Termine — dein Team hängt am Telefon statt am Kunden." },
  { icon: TrendingDown, title: "No-Shows & wenig Bewertungen", text: "Verpasste Termine kosten Umsatz, und ohne Bewertungen findet dich online kaum jemand." },
];

const features = [
  { icon: MessageSquare, title: "24/7 Antworten", text: "Beantwortet häufige Fragen sofort — auf Deutsch, im Ton deiner Marke." },
  { icon: CalendarCheck, title: "Termine buchen", text: "Prüft freie Slots und bucht direkt im Chat, inkl. Erinnerungen gegen No-Shows." },
  { icon: Star, title: "Mehr Bewertungen", text: "Fragt nach dem Termin automatisch nach einer Bewertung — dein Ranking steigt." },
  { icon: LayoutDashboard, title: "Dein Dashboard", text: "Anfragen, Buchungen und Kennzahlen — alles an einem Ort, jederzeit einsehbar." },
];

const steps = [
  { title: "Kennenlernen", text: "Kurzes Gespräch: deine Leistungen, Preise, häufigsten Fragen." },
  { title: "Einrichtung", text: "Wir trainieren den Assistenten und verbinden ihn mit deinen Kanälen." },
  { title: "Testen & loslegen", text: "7 Tage kostenlos live testen. Passt's? Dann läuft's dauerhaft für dich." },
];

const plans = [
  { tag: "Start", setup: "ab 400 €", monthly: "ab 200 €/Monat", featured: false, items: ["KI-Assistent 24/7", "Häufige Fragen automatisch", "Anfragen sammeln", "Monitoring & Updates"] },
  { tag: "Wachstum", setup: "ab 800 €", monthly: "ab 375 €/Monat", featured: true, items: ["Alles aus Start", "Termine buchen im Chat", "Automatische Erinnerungen", "Eigenes Dashboard"] },
  { tag: "Maximum", setup: "ab 1250 €", monthly: "ab 525 €/Monat", featured: false, items: ["Alles aus Wachstum", "Bewertungen automatisch", "Kunden reaktivieren", "Priorisierter Support"] },
];

const marquee = ["Friseur", "Barbershop", "Kosmetik", "Nagelstudio", "Zahnarztpraxis", "KFZ-Werkstatt", "Gastronomie", "Fitnessstudio"];

export default function Home() {
  const contactEnabled = process.env.NEXT_PUBLIC_CONTACT_ENABLED === "true";

  return (
    <>
      <SiteHeader contactEnabled={contactEnabled} />
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="container relative py-24 text-center md:py-32">
            <div className="animate-fade-up mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
              {contactEnabled ? "Warteliste offen · Frühzugang für lokale Betriebe" : "Portfolio-Demo · DACH Automation Platform"}
            </div>
            <h1 className="animate-fade-up mx-auto max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
              Nie wieder Kundenanfragen verlieren.
            </h1>
            <p className="animate-fade-up mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              {contactEnabled
                ? "KLYSELZ baut dir ein System, das Anfragen strukturiert beantwortet, qualifiziert und in die Terminvergabe übergibt."
                : "Technische Demonstration eines Systems für Anfrage-Erfassung, Qualifizierung, CRM und transparente Service Delivery. Keine Live-Kundendaten."}
            </p>
            <HeroSubscribe source="waitlist" />
            <p className="animate-fade-up mt-4 text-sm text-muted-foreground">
              {contactEnabled
                ? "Warteliste · Frühzugang & Sonderkonditionen"
                : "Kontaktfunktionen deaktiviert · Fiktive Beispieldaten · Quellcode auf GitHub"}
            </p>
            <div className="animate-fade-up mt-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <a href="#loesung" className="underline-offset-4 hover:text-foreground hover:underline">So funktioniert&apos;s</a>
              <span aria-hidden="true">·</span>
              <a href="#preise" className="underline-offset-4 hover:text-foreground hover:underline">Preise</a>
              <span aria-hidden="true">·</span>
              <a href={contactEnabled ? "#kontakt" : "/impressum"} className="underline-offset-4 hover:text-foreground hover:underline">
                {contactEnabled ? "Persönliches Gespräch" : "Portfolio-Modus"}
              </a>
            </div>
          </div>
        </section>

        {/* SHOWREEL */}
        <section id="showreel" className="border-b border-border bg-muted/40 py-16 md:py-20">
          <div className="container">
            <SectionHead
              over="Showreel"
              title="So fühlt sich dein System in der Praxis an"
              sub="Ein kurzer Blick auf den Stil, die Geschwindigkeit und die Klarheit, mit der KLYSELZ lokale Betriebe digitalisiert."
            />
          </div>
          <div className="bg-background md:container md:mx-auto md:max-w-5xl md:overflow-hidden md:rounded-xl md:border md:border-border md:shadow-sm">
            <video
              className="aspect-video w-full bg-black object-contain"
              src="/media/showreel.mp4"
              controls
              muted
              playsInline
              preload="metadata"
            />
          </div>
        </section>

        {/* MARQUEE */}
        <section className="border-b border-border py-6">
          <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_15%,black_85%,transparent)]">
            <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
              {[...marquee, ...marquee].map((m, i) => (
                <span key={i} className="text-sm font-medium uppercase tracking-widest text-muted-foreground">{m}</span>
              ))}
            </div>
          </div>
        </section>

        {/* PROBLEM */}
        <section id="problem" className="border-b border-border py-24">
          <div className="container">
            <SectionHead over="Das Problem" title="Jede unbeantwortete Nachricht kostet Geld" sub="Kunden schreiben abends, am Wochenende, während du am Kunden arbeitest. Wer nicht schnell antwortet, verliert sie an die Konkurrenz." />
            <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3">
              {problems.map((p) => (
                <div key={p.title} className="bg-background p-8">
                  <p.icon className="h-6 w-6" strokeWidth={1.5} />
                  <h3 className="mt-5 text-lg font-semibold">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LÖSUNG */}
        <section id="loesung" className="border-b border-border py-24">
          <div className="container">
            <SectionHead over="Die Lösung" title="Dein digitaler Mitarbeiter, der nie schläft" sub="Ein KI-Assistent, individuell auf deinen Betrieb trainiert — mit einem Dashboard, in dem du alles im Blick hast." />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => (
                <div key={f.title} className="rounded-xl border border-border p-7 transition-colors hover:bg-muted">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-foreground text-background">
                    <f.icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <h3 className="mt-5 font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ABLAUF */}
        <section id="ablauf" className="border-b border-border py-24">
          <div className="container">
            <SectionHead over="Der Ablauf" title="In 5 Tagen startklar" sub="Kein Aufwand für dich — wir richten alles ein und du testest, bevor du zahlst." />
            <div className="grid gap-6 md:grid-cols-3">
              {steps.map((s, i) => (
                <div key={s.title} className="relative rounded-xl border border-border p-8">
                  <span className="text-4xl font-extrabold tracking-tight text-muted-foreground/40">0{i + 1}</span>
                  <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PREISE */}
        <section id="preise" className="border-b border-border py-24">
          <div className="container">
            <SectionHead
              over={contactEnabled ? "Preise" : "Beispiel-Pakete"}
              title={contactEnabled ? "Einfach und fair" : "Illustrative Produktstruktur"}
              sub={contactEnabled
                ? "Einmalige Einrichtung + monatliche Betreuung. Jederzeit kündbar mit 30 Tagen Frist."
                : "Portfolio-Beispiele, keine verbindlichen Angebote. Marktvalidierung und Leistungsumfang sind noch offen."}
            />
            <div className="grid gap-6 md:grid-cols-3">
              {plans.map((p) => (
                <div key={p.tag} className={p.featured ? "rounded-2xl border-2 border-foreground bg-foreground p-8 text-background" : "rounded-2xl border border-border p-8"}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-widest">{p.tag}</span>
                    {p.featured && <span className="rounded-full bg-background px-2.5 py-0.5 text-[11px] font-semibold text-foreground">beliebt</span>}
                  </div>
                  <div className="mt-5 text-3xl font-extrabold">{p.setup}</div>
                  <div className={p.featured ? "text-sm text-background/70" : "text-sm text-muted-foreground"}>+ {p.monthly}</div>
                  <ul className="mt-6 space-y-2.5 text-sm">
                    {p.items.map((it) => (
                      <li key={it} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={contactEnabled ? "#kontakt" : "#showreel"}
                    className={buttonVariants({
                      variant: p.featured ? "invert" : "outline",
                      className: "mt-8 w-full",
                    })}
                  >
                    {contactEnabled ? (p.featured ? "Kostenlos testen" : "Anfragen") : "Demo ansehen"}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* KONTAKT */}
        <section id="kontakt" className="bg-foreground py-24 text-background">
          <div className="container text-center">
            <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight md:text-4xl">
              {contactEnabled ? "Sichere dir jede Anfrage — ab heute" : "Portfolio-Demo — keine Datenerfassung"}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-background/70">
              {contactEnabled
                ? "Schreib uns, und wir zeigen dir eine passende Demo für deinen Prozess."
                : "Kontakt-, Wartelisten- und Briefing-Funktionen bleiben deaktiviert, bis Betrieb, Datenschutz und CRM produktionsreif geprüft sind."}
            </p>
            <div className="mt-10">
              <ContactForm />
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border py-10">
        <div className="container flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <span>© 2026 KLYSELZ · KI-Automatisierung für lokale Unternehmen</span>
          <nav className="flex gap-6">
            <Link href="/impressum" className="hover:text-foreground">Impressum</Link>
            <Link href="/datenschutz" className="hover:text-foreground">Datenschutz</Link>
          </nav>
        </div>
      </footer>
    </>
  );
}

function SectionHead({ over, title, sub }: { over: string; title: string; sub: string }) {
  return (
    <div className="mx-auto mb-14 max-w-2xl text-center">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{over}</span>
      <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">{title}</h2>
      <p className="mt-4 text-muted-foreground">{sub}</p>
    </div>
  );
}
