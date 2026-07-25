// Applies db/schema.sql to Neon. Run: npm run db:init
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "../.env.local") });
config({ path: join(__dirname, "../.env") });

const url = process.env.DATABASE_URL ?? process.env.CRM_DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL or CRM_DATABASE_URL is required in apps/site/.env.local.");
  process.exit(1);
}

const sql = neon(url);
const schema = readFileSync(join(__dirname, "../db/schema.sql"), "utf8");
const statements = schema
  .split(/\r?\n/)
  .filter((line) => !line.trim().startsWith("--"))
  .join("\n")
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

for (const stmt of statements) await sql(stmt);
console.log(`Schema applied (${statements.length} statements).`);
