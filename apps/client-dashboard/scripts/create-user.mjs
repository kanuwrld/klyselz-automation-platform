// Provision a dashboard account. Password is read from an environment variable,
// never from CLI arguments where it would remain in shell history.
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { validateProvisioningInput } from "../lib/account-policy.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "../.env.local") });
config({ path: join(__dirname, "../.env") });

const [email, role, clientName] = process.argv.slice(2);
const password = process.env.KLYSELZ_INITIAL_PASSWORD;
const validation = validateProvisioningInput({ email, password, role, clientName });

if (!validation.ok) {
  console.error(`Account rejected: ${validation.error}`);
  console.error("Usage: KLYSELZ_INITIAL_PASSWORD='<secret>' npm run user:create -- <email> <agency|client> [clientName]");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not configured.");
  process.exit(1);
}

const account = validation.value;
const sql = neon(process.env.DATABASE_URL);
const hash = await bcrypt.hash(account.password, 12);

let clientId = null;
if (account.role === "client" && account.clientName) {
  const slug = account.clientName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  if (!slug) {
    console.error("Client name must contain characters that can form a URL slug.");
    process.exit(1);
  }
  const rows = await sql`
    INSERT INTO clients (name, slug, status) VALUES (${account.clientName}, ${slug}, 'trial')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id`;
  clientId = rows[0].id;
}

await sql`
  INSERT INTO users (
    email, password_hash, role, client_id, status, email_verified_at, updated_at
  )
  VALUES (
    ${account.email}, ${hash}, ${account.role}, ${clientId}, 'active', now(), now()
  )
  ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    client_id = EXCLUDED.client_id,
    status = 'active',
    email_verified_at = COALESCE(users.email_verified_at, now()),
    updated_at = now()`;

console.log(`Account provisioned: ${account.email} (role: ${account.role}${clientId ? `, client_id: ${clientId}` : ""})`);
console.log("Unset KLYSELZ_INITIAL_PASSWORD in the current shell.");
