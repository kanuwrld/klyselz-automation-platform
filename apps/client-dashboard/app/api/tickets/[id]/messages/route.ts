import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireSession } from "@/lib/access";
import { textField } from "@/lib/api-security";
import { rateLimit } from "@/lib/rate-limit";

const ALLOWED_STATUS = new Set(["open", "in_progress", "waiting_client", "closed"]);

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  if (!process.env.DATABASE_URL) return NextResponse.json({ messages: [] });
  const { id } = await ctx.params;
  const ticketId = Number(id);
  if (!Number.isInteger(ticketId)) return NextResponse.json({ error: "bad id" }, { status: 400 });

  const rows = (await sql`SELECT * FROM tickets WHERE id = ${ticketId} LIMIT 1`) as Array<{ client_id: number | null }>;
  const ticket = rows[0];
  if (!ticket) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (auth.session.role === "client" && ticket.client_id !== auth.session.clientId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const messages = await sql`SELECT * FROM ticket_messages WHERE ticket_id = ${ticketId} ORDER BY created_at ASC`;
  return NextResponse.json({ ticket, messages });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(req, { key: "tickets-reply", limit: 60, windowMs: 10 * 60 * 1000 });
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(limited.retryAfter ?? 60) } });
  }
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DATABASE_URL fehlt" }, { status: 503 });
  const { id } = await ctx.params;
  const ticketId = Number(id);
  if (!Number.isInteger(ticketId)) return NextResponse.json({ error: "bad id" }, { status: 400 });

  try {
    const body = await req.json();
    const messageBody = textField(body?.body, 4000);
    const newStatusRaw = textField(body?.status, 30);
    if (!messageBody && !newStatusRaw) {
      return NextResponse.json({ error: "body oder status ist Pflicht" }, { status: 400 });
    }

    const rows = (await sql`SELECT client_id FROM tickets WHERE id = ${ticketId} LIMIT 1`) as Array<{ client_id: number | null }>;
    const ticket = rows[0];
    if (!ticket) return NextResponse.json({ error: "not found" }, { status: 404 });
    if (auth.session.role === "client" && ticket.client_id !== auth.session.clientId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (messageBody) {
      await sql`
        INSERT INTO ticket_messages (ticket_id, author_id, author_role, body)
        VALUES (${ticketId}, ${auth.session.uid}, ${auth.session.role}, ${messageBody})`;
    }

    const nextStatus = newStatusRaw && ALLOWED_STATUS.has(newStatusRaw)
      ? newStatusRaw
      : auth.session.role === "agency" && messageBody ? "waiting_client" : "open";

    await sql`
      UPDATE tickets
      SET status = ${nextStatus}, last_activity_at = now()
      WHERE id = ${ticketId}`;

    return NextResponse.json({ ok: true, status: nextStatus }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
  }
}
