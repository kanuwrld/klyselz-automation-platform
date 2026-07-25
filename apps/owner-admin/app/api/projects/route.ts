import { NextRequest, NextResponse } from "next/server";
import { requireAgency } from "@/lib/access";
import { hasDb, sql } from "@/lib/db";
import { intField, textField } from "@/lib/api-security";

const statuses = ["planned", "in_progress", "client_review", "live", "paused", "completed"];

function cents(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? Math.round(amount * 100) : 0;
}

export async function POST(req: NextRequest) {
  const auth = await requireAgency();
  if (!auth.ok) return auth.response;
  if (!hasDb) return NextResponse.json({ error: "DATABASE_URL fehlt" }, { status: 503 });

  try {
    const body = await req.json();
    const clientId = intField(body.clientId);
    const name = textField(body.name, 160);
    const service = textField(body.service, 160);
    const targetAt = textField(body.targetAt, 10);
    if (!clientId || !name) return NextResponse.json({ error: "Kunde und Projektname sind erforderlich" }, { status: 400 });

    const rows = (await sql`
      INSERT INTO agency_projects (client_id, name, service, one_time_value, monthly_value, target_at)
      VALUES (${clientId}, ${name}, ${service}, ${cents(body.oneTimeValue)}, ${cents(body.monthlyValue)}, ${targetAt})
      RETURNING *`) as Record<string, unknown>[];
    return NextResponse.json({ project: rows[0] }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Projekt konnte nicht angelegt werden" }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAgency();
  if (!auth.ok) return auth.response;
  if (!hasDb) return NextResponse.json({ error: "DATABASE_URL fehlt" }, { status: 503 });

  try {
    const body = await req.json();
    const id = intField(body.id);
    const status = statuses.includes(body.status) ? body.status : null;
    const progressNumber = Number(body.progress);
    const progress = Number.isInteger(progressNumber) && progressNumber >= 0 && progressNumber <= 100 ? progressNumber : null;
    const nextStep = textField(body.nextStep, 300);
    if (!id || (!status && progress === null && !nextStep)) {
      return NextResponse.json({ error: "Ungültige Projektdaten" }, { status: 400 });
    }
    const rows = (await sql`
      UPDATE agency_projects
      SET status = COALESCE(${status}, status),
          progress = COALESCE(${progress}, progress),
          next_step = COALESCE(${nextStep}, next_step),
          updated_at = now()
      WHERE id = ${id}
      RETURNING *`) as Record<string, unknown>[];
    if (!rows[0]) return NextResponse.json({ error: "Projekt nicht gefunden" }, { status: 404 });
    return NextResponse.json({ project: rows[0] });
  } catch {
    return NextResponse.json({ error: "Projekt konnte nicht aktualisiert werden" }, { status: 400 });
  }
}
