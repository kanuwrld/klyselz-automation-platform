import { NextRequest, NextResponse } from "next/server";
import { requireAgency } from "@/lib/access";
import { hasDb, sql } from "@/lib/db";
import { intField, textField } from "@/lib/api-security";

const statuses = ["todo", "in_progress", "blocked", "done"];
const priorities = ["low", "normal", "high", "urgent"];

export async function POST(req: NextRequest) {
  const auth = await requireAgency();
  if (!auth.ok) return auth.response;
  if (!hasDb) return NextResponse.json({ error: "DATABASE_URL fehlt" }, { status: 503 });

  try {
    const body = await req.json();
    const clientId = intField(body.clientId);
    const projectId = intField(body.projectId);
    const title = textField(body.title, 240);
    const priority = priorities.includes(body.priority) ? body.priority : "normal";
    const ownerRole = body.ownerRole === "client" ? "client" : "agency";
    const dueAt = textField(body.dueAt, 10);
    if (!clientId || !title) return NextResponse.json({ error: "Kunde und Aufgabe sind erforderlich" }, { status: 400 });

    const rows = (await sql`
      INSERT INTO agency_tasks (project_id, client_id, title, priority, owner_role, due_at)
      VALUES (${projectId}, ${clientId}, ${title}, ${priority}, ${ownerRole}, ${dueAt})
      RETURNING *`) as Record<string, unknown>[];
    return NextResponse.json({ task: rows[0] }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Aufgabe konnte nicht angelegt werden" }, { status: 400 });
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
    if (!id || !status) return NextResponse.json({ error: "Ungültige Aufgabendaten" }, { status: 400 });
    const rows = (await sql`UPDATE agency_tasks SET status = ${status}, updated_at = now() WHERE id = ${id} RETURNING *`) as Record<string, unknown>[];
    if (!rows[0]) return NextResponse.json({ error: "Aufgabe nicht gefunden" }, { status: 404 });
    return NextResponse.json({ task: rows[0] });
  } catch {
    return NextResponse.json({ error: "Aufgabe konnte nicht aktualisiert werden" }, { status: 400 });
  }
}
