// Applies db/schema.sql to Neon. Run: npm run db:init
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load local environment in same priority order as application tooling.
config({ path: join(__dirname, "../.env.local") });
config({ path: join(__dirname, "../.env") });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required in apps/owner-admin/.env.local.");
  process.exit(1);
}

const sql = neon(url);
const schema = readFileSync(join(__dirname, "../db/schema.sql"), "utf8");
const withDemo = process.argv.includes("--with-demo");

function statementsFrom(text) {
  return text
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

const statements = statementsFrom(schema);
for (const stmt of statements) {
  await sql(stmt);
}

let demoStatements = [];
if (withDemo) {
  const demo = readFileSync(join(__dirname, "../db/seed-demo.sql"), "utf8");
  demoStatements = statementsFrom(demo);
  for (const stmt of demoStatements) {
    await sql(stmt);
  }
}

console.log(`Schema applied (${statements.length} statements).`);
if (withDemo) console.log(`Fictional demo data applied (${demoStatements.length} statements).`);
