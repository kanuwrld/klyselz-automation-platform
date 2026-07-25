import { NextResponse } from "next/server";
import { hasDb, sql } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const checks = {
    app: true,
    databaseConfigured: hasDb,
    databaseReachable: false,
  };

  if (hasDb) {
    try {
      await sql`SELECT 1`;
      checks.databaseReachable = true;
    } catch {
      checks.databaseReachable = false;
    }
  }

  const ok = checks.app && (!checks.databaseConfigured || checks.databaseReachable);
  return NextResponse.json({ ok, checks }, { status: ok ? 200 : 503 });
}
