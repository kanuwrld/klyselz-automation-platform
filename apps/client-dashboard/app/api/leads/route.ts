import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireSession } from "@/lib/access";
import { webhookSecret, textField } from "@/lib/api-security";
import { rateLimit } from "@/lib/rate-limit";
import { getTenantReadScope } from "@/lib/tenant-access.mjs";

// GET /api/leads lists enquiries for integrations and reporting.
// POST /api/leads accepts a signed assistant or messaging webhook.
//
// Example body:
// { "name": "Anna", "contact": "@anna", "channel": "Instagram", "message": "Ist ein Termin frei?", "status": "new", "externalId": "wa_123" }

const allowedStatuses = ["new", "qualified", "booked", "lost"] as const;

export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL fehlt" }, { status: 503 });
  }
  const scope = getTenantReadScope(auth.session);
  if (!scope) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const rows = scope.kind === "agency"
    ? await sql`SELECT * FROM leads ORDER BY created_at DESC LIMIT 100`
    : await sql`
        SELECT *
        FROM leads
        WHERE client_id = ${scope.clientId}
        ORDER BY created_at DESC
        LIMIT 100`;
  return NextResponse.json({ leads: rows });
}

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { key: "leads-webhook", limit: 60, windowMs: 60 * 1000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter ?? 60) } }
    );
  }
  const secret = webhookSecret(req);
  if (!secret.ok) return secret.response;
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL fehlt" }, { status: 503 });
  }
  try {
    const body = await req.json();
    const status = allowedStatuses.includes(body?.status) ? body.status : "new";
    const payload = {
      name: textField(body?.name, 120),
      contact: textField(body?.contact, 180),
      channel: textField(body?.channel, 80),
      message: textField(body?.message, 2000),
      source: textField(body?.source, 80),
      externalId: textField(body?.externalId ?? body?.external_id, 180),
      status,
    };
    if (!payload.contact && !payload.message) {
      return NextResponse.json({ error: "contact oder message ist Pflicht" }, { status: 400 });
    }
    const rows = (await sql`
      INSERT INTO leads (name, contact, channel, message, status, source, external_id)
      VALUES (${payload.name}, ${payload.contact}, ${payload.channel}, ${payload.message}, ${payload.status}, ${payload.source}, ${payload.externalId})
      RETURNING *`) as any[];
    const lead = rows[0];
    if (lead?.id) {
      try {
        await sql`
          INSERT INTO lead_events (lead_id, type, payload)
          VALUES (${lead.id}, 'created', ${JSON.stringify({ source: payload.source, channel: payload.channel })}::jsonb)`;
      } catch {
        console.warn("[leads] lead_events unavailable; run npm run db:init");
      }
    }
    return NextResponse.json({ lead: rows[0] }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
  }
}
