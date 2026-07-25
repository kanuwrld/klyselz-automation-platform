import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { validateEmail } from "../lib/account-policy.mjs";

const scriptDir = dirname(fileURLToPath(import.meta.url));
config({ path: join(scriptDir, "../.env.local") });
config({ path: join(scriptDir, "../.env") });

const [emailInput, statusInput] = process.argv.slice(2);
const email = validateEmail(emailInput);
const status = typeof statusInput === "string" ? statusInput.trim().toLowerCase() : "";

if (!email.ok || !["active", "disabled"].includes(status)) {
  console.error("Usage: npm run user:status -- <email> <active|disabled>");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not configured.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const rows = await sql`
  UPDATE users
  SET status = ${status}, updated_at = now()
  WHERE email = ${email.value}
  RETURNING id, email, status
`;

if (!rows.length) {
  console.error("Account not found.");
  process.exit(1);
}

console.log(`Account status updated: ${rows[0].email} → ${rows[0].status}`);
