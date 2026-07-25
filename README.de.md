# KLYSELZ Automationsplattform

Portfolio-Monorepo für einen DACH-orientierten **Anfragen-Autopilot**. Produktoberflächen sind auf Deutsch; technische Dokumentation ist überwiegend auf Englisch.

Live-Portfolio-Demo: [klyselz-flow-prod.vercel.app](https://klyselz-flow-prod.vercel.app)

## Enthalten

- deutsche Website mit Anfrage- und Briefing-Flow;
- Agentur-CRM für Leads, Kunden, Projekte, Aufgaben, Finanzen und Tickets;
- mandantenbezogenes Kunden-Dashboard;
- kontrollierte Benutzeranlage ohne öffentliche Registrierung;
- Recherche-Pipeline ohne Scraping oder automatische Massenansprache;
- CI, Dependency Audit und Schutz vor Secrets im öffentlichen Repository;
- Vercel-fähige Monorepo-Struktur.

Status: Portfolio-Beta und Kundenvalidierung. Keine Behauptung, dass Funnel oder Angebot bereits am Markt validiert sind.

## Lokaler Start

```bash
npm ci
npm run verify
npm run dev:site
```

Echte Zugangsdaten gehören ausschließlich in lokale `.env.local`-Dateien oder geschützte Vercel-Umgebungsvariablen.

## Wichtige Dokumente

- [Projektmanagement](PROJECT_MANAGEMENT.md)
- [Account Validation](docs/ACCOUNT_VALIDATION.md)
- [Zugriffsmanagement](docs/ACCESS_CONTROL.md)
- [CI/CD](docs/CICD.md)
- [Go-to-Market-Experiment](docs/GO_TO_MARKET.md)
- [Security Policy](SECURITY.md)

Rechtlicher Hinweis: Outreach- und DSGVO-Hinweise sind operative Leitplanken, keine Rechtsberatung.
