import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireSession } from "@/lib/access";
import { textField, intField } from "@/lib/api-security";
import { rateLimit } from "@/lib/rate-limit";

const ALLOWED_PRIORITY = new Set(["low", "normal", "high", "urgent"]);

export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  if (!process.env.DATABASE_URL) return NextResponse.json({ tickets: [] });
  const { role, clientId } = auth.session;
  const rows = role === "agency"
    ? await sql`
        SELECT t.*, c.name AS client_name,
               (SELECT COUNT(*) FROM ticket_messages m WHERE m.ticket_id = t.id) AS messages_count
        FROM tickets t
        LEFT JOIN clients c ON c.id = t.client_id
        ORDER BY t.last_activity_at DESC LIMIT 200`
    : clientId
      ? await sql`
          SELECT t.*, c.name AS client_name,
                 (SELECT COUNT(*) FROM ticket_messages m WHERE m.ticket_id = t.id) AS messages_count
          FROM tickets t
          LEFT JOIN clients c ON c.id = t.client_id
          WHERE t.client_id = ${clientId}
          ORDER BY t.last_activity_at DESC LIMIT 200`
      : [];
  return NextResponse.json({ tickets: rows });
}

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { key: "tickets-create", limit: 30, windowMs: 10 * 60 * 1000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter ?? 60) } }
    );
  }
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DATABASE_URL fehlt" }, { status: 503 });

  try {
    const body = await req.json();
    const subject = textField(body?.subject, 200);
    const message = textField(body?.message, 4000);
    const priorityRaw = textField(body?.priority, 20) ?? "normal";
    const priority = ALLOWED_PRIORITY.has(priorityRaw) ? priorityRaw : "normal";
    if (!subject || !message) {
      return NextResponse.json({ error: "subject und message sind Pflichtfelder" }, { status: 400 });
    }

    const { role, uid, clientId } = auth.session;
    const authorRole = role;
    let targetClientId: number | null;
    if (role === "client") {
      if (!clientId) return NextResponse.json({ error: "client_id fehlt für Benutzer" }, { status: 400 });
      targetClientId = clientId;
    } else {
      targetClientId = intField(body?.client_id) ?? null;
    }

    const ticketRows = (await sql`
      INSERT INTO tickets (client_id, created_by, subject, priority, status)
      VALUES (${targetClientId}, ${uid}, ${subject}, ${priority}, 'open')
      RETURNING *`) as Array<{ id: number }>;
    const ticketId = ticketRows[0].id;

    await sql`
      INSERT INTO ticket_messages (ticket_id, author_id, author_role, body)
      VALUES (${ticketId}, ${uid}, ${authorRole}, ${message})`;

    return NextResponse.json({ ticket: ticketRows[0] }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
  }
}
