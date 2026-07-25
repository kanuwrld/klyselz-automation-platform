// KLYSELZ prospect pipeline: manual input → enrich → score → reviewed draft.
// Automation prepares work; a human validates every record and channel.
// Run from repository root: npm run leadgen:dry-run

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";
import "dotenv/config";

// 1. Configuration
const DB_URL = process.env.DATABASE_URL || null;
const AI_KEY = process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY || null;
const AI_PROVIDER = process.env.ANTHROPIC_API_KEY ? "anthropic" : process.env.OPENAI_API_KEY ? "openai" : null;
const args = new Set(process.argv.slice(2));
const shouldSyncDb = args.has("--sync-db");
const moduleDir = fileURLToPath(new URL(".", import.meta.url));
const inputPath = resolve(moduleDir, process.env.PROSPECTS_INPUT_PATH || "prospects.example.csv");

const TARGET_CITIES = ["München","Nürnberg","Augsburg","Regensburg","Ingolstadt","Fürth","Würzburg"];

// 2. Find: read manually researched CSV input.
// No social-platform parsing or automated scraping.
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).filter(Boolean).map((line) => {
    const cells = splitCsvLine(line);
    const row = {};
    headers.forEach((h, i) => (row[h.trim()] = (cells[i] ?? "").trim()));
    return row;
  });
}
function splitCsvLine(line) {
  const out = [];
  let cur = "", inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else {
        inQ = !inQ;
      }
    } else if (ch === "," && !inQ) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

// 3. Enrich and score: prioritization from 0 to 100.
function scoreProspect(r) {
  let score = 0;
  const reasons = [];
  const hasWebsite = !!r.website;
  const hasBooking = String(r.has_online_booking).toLowerCase() === "true";
  const reviews = parseInt(r.reviews_count, 10);

  if (!hasWebsite) { score += 30; reasons.push("kein Web"); }
  else if (!hasBooking) { score += 25; reasons.push("Web ohne Buchung"); }

  if ((r.channel || "").toLowerCase() === "instagram" && r.contact) { score += 15; reasons.push("IG erreichbar"); }
  if (!Number.isNaN(reviews)) {
    if (reviews < 20) { score += 20; reasons.push("wenige Bewertungen"); }
    else if (reviews < 50) { score += 10; reasons.push("mittlere Bewertungen"); }
  }
  if (TARGET_CITIES.includes(r.city)) { score += 10; reasons.push("Zielstadt"); }
  if (r.observation) score += 5;

  return { score: Math.max(0, Math.min(100, score)), reasons };
}

// 4. Draft: German text for human and legal review.
function templateDraft(r) {
  const obs = r.observation ? `Mir ist aufgefallen: ${r.observation}. ` : "";
  if ((r.channel || "").toLowerCase() === "email") {
    return `Hallo ${r.salon}-Team,\n\n${obs}Erfahrungsgemäß gehen abends und am Wochenende Terminanfragen verloren. Ich baue für Salons in ${r.city || "eurer Stadt"} einen KI-Assistenten, der rund um die Uhr auf Deutsch antwortet, häufige Fragen klärt und Termine sammelt — DSGVO-konform.\n\nIch zeige es euch gern kostenlos an eurem Beispiel, plus 7 Tage gratis testen. Passt ein kurzer Anruf diese Woche?\n\nBeste Grüße\n[Dein Name] · KLYSELZ · klyselz.com`;
  }
  return `Hallo ${r.salon}! 👋 ${obs}Ich baue für Salons in ${r.city || "eurer Stadt"} einen KI-Assistenten, der rund um die Uhr auf Deutsch antwortet und Termine anbahnt — im Ton eures Salons. Darf ich euch kostenlos zeigen, wie das bei euch aussähe? 7 Tage gratis testen.`;
}

async function aiFirstLine(r) {
  if (!AI_KEY) return null;
  const prompt = `Schreibe eine EINZIGE, kurze, natürliche erste Zeile (max. 25 Wörter) auf Deutsch für eine kalte Kontaktnachricht an den Friseur/Salon "${r.salon}" in ${r.city}. Beziehe dich konkret auf: "${r.observation}". Kein Emoji-Spam, freundlich, keine Übertreibung. Nur die Zeile, ohne Anführungszeichen.`;
  try {
    if (AI_PROVIDER === "anthropic") {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": AI_KEY, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 120, messages: [{ role: "user", content: prompt }] }),
      });
      const j = await res.json();
      return j?.content?.[0]?.text?.trim() || null;
    } else {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${AI_KEY}` },
        body: JSON.stringify({ model: "gpt-4o-mini", max_tokens: 120, messages: [{ role: "user", content: prompt }] }),
      });
      const j = await res.json();
      return j?.choices?.[0]?.message?.content?.trim() || null;
    }
  } catch (e) {
    console.warn("  AI request failed; using deterministic template:", e.message);
    return null;
  }
}

async function buildDraft(r) {
  const base = templateDraft(r);
  const aiLine = await aiFirstLine(r);
  if (!aiLine) return base;
  // Replace opening line while preserving reviewed deterministic body.
  if ((r.channel || "").toLowerCase() === "email") return base.replace(/^Hallo[^\n]*\n\n[^\n]*/, `Hallo ${r.salon}-Team,\n\n${aiLine}`);
  return `${aiLine} — ${base.split("👋 ").slice(1).join("👋 ") || base}`;
}

// 5. Save: local CSV and optional explicit Neon sync.
async function upsert(sql, p) {
  await sql`
    INSERT INTO prospects (salon, city, channel, contact, website, observation, score, draft, status)
    VALUES (${p.salon}, ${p.city}, ${p.channel}, ${p.contact}, ${p.website || null}, ${p.observation}, ${p.score}, ${p.draft}, 'new')
    ON CONFLICT (salon, city) DO UPDATE
      SET channel=EXCLUDED.channel, contact=EXCLUDED.contact, website=EXCLUDED.website,
          observation=EXCLUDED.observation, score=EXCLUDED.score, draft=EXCLUDED.draft, updated_at=now()`;
}

function toCsv(rows) {
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const head = "salon,city,channel,contact,website,score,status,draft";
  const body = rows.map((r) => [r.salon, r.city, r.channel, r.contact, r.website, r.score, "new", r.draft].map(esc).join(","));
  return [head, ...body].join("\n");
}

// ── main ────────────────────────────────────────────────────────────────────
async function main() {
  const rows = parseCSV(readFileSync(inputPath, "utf8"));
  console.log(`\nLoaded prospects: ${rows.length}`);
  console.log(shouldSyncDb ? "  mode: sync-db → CSV + Neon" : "  mode: dry-run → local CSV only");
  if (!AI_KEY) console.log("  AI key not configured → deterministic drafts");
  else console.log(`  AI provider: ${AI_PROVIDER}`);

  const processed = [];
  for (const r of rows) {
    const { score, reasons } = scoreProspect(r);
    r.score = score;
    r.draft = await buildDraft(r);
    processed.push(r);
    console.log(`  • ${r.salon} (${r.city}) — score ${score} [${reasons.join(", ")}]`);
  }
  processed.sort((a, b) => b.score - a.score);

  const outPath = new URL("./prospects-output.csv", import.meta.url);
  writeFileSync(outPath, toCsv(processed), "utf8");
  console.log("\nWrote ignored prospects-output.csv");

  if (DB_URL && shouldSyncDb) {
    const sql = neon(DB_URL);
    for (const p of processed) await upsert(sql, p);
    console.log(`Synced ${processed.length} prospects to Neon.`);
  } else if (DB_URL) {
    console.log("Neon configured; write skipped in dry-run. Use leadgen:sync explicitly.");
  } else {
    console.log("DATABASE_URL not configured; database write skipped.");
  }
  console.log("");
}

main().catch((e) => { console.error("Pipeline failed:", e); process.exit(1); });
