import { NextRequest, NextResponse } from "next/server";
import { sql, hasDb } from "@/lib/db";
import { intField } from "@/lib/api-security";
import { requireAgency } from "@/lib/access";

// GET /api/prospects returns prioritized records.
// PATCH /api/prospects updates reviewed status: { id, status }.
export async function GET() {
  const auth = await requireAgency();
  if (!auth.ok) return auth.response;
  if (!hasDb) return NextResponse.json({ error: "DATABASE_URL fehlt" }, { status: 503 });
  const rows = (await sql`SELECT * FROM prospects ORDER BY score DESC LIMIT 200`) as any[];
  return NextResponse.json({ prospects: rows });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAgency();
  if (!auth.ok) return auth.response;
  if (!hasDb) return NextResponse.json({ error: "DATABASE_URL fehlt" }, { status: 503 });
  try {
    const { id, status } = (await req.json()) ?? {};
    const allowed = ["new", "review", "contacted", "replied", "won", "skip"];
    const prospectId = intField(id);
    if (!prospectId || !allowed.includes(status)) {
      return NextResponse.json({ error: "Ungültige Daten" }, { status: 400 });
    }
    const rows = (await sql`
      UPDATE prospects SET status = ${status}, updated_at = now()
      WHERE id = ${prospectId} RETURNING *`) as any[];
    return NextResponse.json({ prospect: rows[0] });
  } catch {
    return NextResponse.json({ error: "Fehler" }, { status: 400 });
  }
}
