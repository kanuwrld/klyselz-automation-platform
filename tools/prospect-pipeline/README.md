# Prospect research pipeline

Portfolio-safe pipeline: manual research input → scoring → German draft → local CSV. Database writes require explicit `npm run sync`.

## What it does

1. Reads a manually researched CSV. No scraping.
2. Scores operational signals such as missing booking flow or limited availability.
3. Produces a German draft for human review.
4. Writes ignored `prospects-output.csv`; optional sync stores approved records in Neon.

## Run

```bash
npm ci
npm run leadgen:dry-run
```

Public default uses fictional `prospects.example.csv`. Set `PROSPECTS_INPUT_PATH=prospects-input.csv` in local `.env` for private data.

Explicit database sync:

```bash
npm run leadgen:sync
```

Optional AI keys live only in local `.env`. Without a key, deterministic templates still work.

## Safety boundary

- Human review is mandatory.
- No Instagram automation or platform scraping.
- No bulk cold email. German electronic marketing generally requires prior express consent under [§ 7 UWG](https://www.gesetze-im-internet.de/uwg_2004/__7.html), apart from a narrow existing-customer exception.
- Store real contacts outside Git. Follow deletion requests and document source, lawful basis and opt-out state.
