import { NextRequest, NextResponse } from "next/server";
import { requireAgency } from "@/lib/access";
import { hasDb, sql } from "@/lib/db";
import { intField, textField } from "@/lib/api-security";

const categories = ["setup", "retainer", "tool", "contractor", "other"];

export async function POST(req: NextRequest) {
  const auth = await requireAgency();
  if (!auth.ok) return auth.response;
  if (!hasDb) return NextResponse.json({ error: "DATABASE_URL fehlt" }, { status: 503 });
  try {
    const body = await req.json();
    const amount = Number(body.amount);
    const amountCents = Number.isFinite(amount) && amount > 0 ? Math.round(amount * 100) : null;
    const type = body.type === "expense" ? "expense" : body.type === "revenue" ? "revenue" : null;
    const category = categories.includes(body.category) ? body.category : "other";
    const clientId = intField(body.clientId);
    const projectId = intField(body.projectId);
    const occurredOn = textField(body.occurredOn, 10) ?? new Date().toISOString().slice(0, 10);
    const note = textField(body.note, 300);
    if (!amountCents || !type) return NextResponse.json({ error: "Typ und Betrag sind erforderlich" }, { status: 400 });

    const rows = (await sql`
      INSERT INTO financial_entries (client_id, project_id, type, category, amount_cents, recurring, occurred_on, note)
      VALUES (${clientId}, ${projectId}, ${type}, ${category}, ${amountCents}, ${Boolean(body.recurring)}, ${occurredOn}, ${note})
      RETURNING *`) as Record<string, unknown>[];
    return NextResponse.json({ entry: rows[0] }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Buchung konnte nicht gespeichert werden" }, { status: 400 });
  }
}
