import { neon } from "@neondatabase/serverless";

// Neon serverless Postgres clients exist only when their URL is configured.
// Public contact endpoints fail closed when CRM storage is unavailable.
const url = process.env.DATABASE_URL;
export const hasDb = !!url;
export const sql = (url
  ? neon(url)
  : (() => {
      throw new Error("DATABASE_URL nicht gesetzt");
    })) as ReturnType<typeof neon>;

const crmUrl = process.env.CRM_DATABASE_URL ?? process.env.DATABASE_URL;
export const hasCrmDb = !!crmUrl;
export const crmSql = (crmUrl
  ? neon(crmUrl)
  : (() => {
      throw new Error("CRM_DATABASE_URL/DATABASE_URL nicht gesetzt");
    })) as ReturnType<typeof neon>;
