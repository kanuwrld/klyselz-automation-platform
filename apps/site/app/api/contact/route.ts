import { NextRequest, NextResponse } from "next/server";
import { sql, hasDb, hasCrmDb } from "@/lib/db";
import { textField } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { notifyOwnerContact, sendBriefLink } from "@/lib/email";
import { notifyTgContact } from "@/lib/telegram";
import { createInboundLead } from "@/lib/brief";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Landing-page enquiry. Disabled unless contact feature and CRM storage are configured.
export async function POST(req: NextRequest) {
  try {
    if (process.env.NEXT_PUBLIC_CONTACT_ENABLED !== "true" || !hasCrmDb) {
      return NextResponse.json(
        { error: "Kontaktformular ist in dieser Portfolio-Demo deaktiviert." },
        { status: 503 }
      );
    }
    const limited = rateLimit(req, { key: "contact", limit: 10, windowMs: 10 * 60 * 1000 });
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Zu viele Anfragen. Bitte später erneut versuchen." },
        { status: 429, headers: { "Retry-After": String(limited.retryAfter ?? 60) } }
      );
    }
    const body = (await req.json()) ?? {};
    if (textField(body.website, 120)) {
      return NextResponse.json({ ok: true }, { status: 201 });
    }
    const business = textField(body.business, 140);
    const contact = textField(body.contact, 180);
    const message = textField(body.message, 2000);
    if (!business || !contact) {
      return NextResponse.json({ error: "Bitte Betrieb und E-Mail angeben." }, { status: 400 });
    }
    const emailContact = contact.toLowerCase();
    if (!EMAIL_RE.test(emailContact)) {
      return NextResponse.json({ error: "Bitte gültige E-Mail-Adresse angeben." }, { status: 400 });
    }
    const ua = req.headers.get("user-agent")?.slice(0, 500) ?? null;

    if (hasDb) {
      let rows: Array<{ id: number }>;
      try {
        rows = (await sql`
          INSERT INTO contact_requests (business, contact, message, source, user_agent)
          VALUES (${business}, ${emailContact}, ${message}, 'website', ${ua})
          RETURNING id`) as Array<{ id: number }>;
      } catch {
        rows = (await sql`
          INSERT INTO contact_requests (business, contact, message)
          VALUES (${business}, ${emailContact}, ${message})
          RETURNING id`) as Array<{ id: number }>;
      }
      const lead = await createInboundLead({ email: emailContact, business, message, source: "contact", userAgent: ua });
      void Promise.all([
        notifyOwnerContact({ business, contact: emailContact, message }).catch((e) => console.warn("[contact] owner mail:", e)),
        notifyTgContact({ business, contact: emailContact, message }).catch((e) => console.warn("[contact] telegram:", e)),
        lead.token ? sendBriefLink(emailContact, lead.token).catch((e) => console.warn("[contact] brief mail:", e)) : null,
      ]);
      return NextResponse.json({ ok: true, id: rows[0].id }, { status: 201 });
    }
    const lead = await createInboundLead({ email: emailContact, business, message, source: "contact", userAgent: ua });
    void Promise.all([
      notifyOwnerContact({ business, contact: emailContact, message }).catch((e) => console.warn("[contact] owner mail:", e)),
      notifyTgContact({ business, contact: emailContact, message }).catch((e) => console.warn("[contact] telegram:", e)),
      lead.token ? sendBriefLink(emailContact, lead.token).catch((e) => console.warn("[contact] brief mail:", e)) : null,
    ]);
    return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }
}
