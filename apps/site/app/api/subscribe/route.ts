import { NextRequest, NextResponse } from "next/server";
import { textField } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { sendBriefLink, notifyOwnerLead } from "@/lib/email";
import { notifyTgLead } from "@/lib/telegram";
import { createInboundLead } from "@/lib/brief";
import { hasCrmDb } from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Opt-in request flow: admin CRM status=open → one-time brief link.
export async function POST(req: NextRequest) {
  try {
    if (process.env.NEXT_PUBLIC_CONTACT_ENABLED !== "true" || !hasCrmDb) {
      return NextResponse.json(
        { error: "Warteliste ist in dieser Portfolio-Demo deaktiviert." },
        { status: 503 }
      );
    }
    const limited = rateLimit(req, { key: "subscribe", limit: 20, windowMs: 10 * 60 * 1000 });
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Zu viele Anfragen. Bitte später erneut versuchen." },
        { status: 429, headers: { "Retry-After": String(limited.retryAfter ?? 60) } }
      );
    }
    const body = (await req.json()) ?? {};
    if (textField(body.website, 120)) return NextResponse.json({ ok: true }, { status: 201 });

    const email = textField(body.email, 180)?.toLowerCase();
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Bitte eine gültige E-Mail-Adresse angeben." }, { status: 400 });
    }
    const source = textField(body.source, 40) ?? "hero";
    const utm_source = textField(body.utm_source, 80);
    const utm_medium = textField(body.utm_medium, 80);
    const utm_campaign = textField(body.utm_campaign, 120);
    const referrer = textField(body.referrer, 500);
    const ua = req.headers.get("user-agent")?.slice(0, 500) ?? null;

    const lead = await createInboundLead({
      email,
      source,
      utmSource: utm_source,
      utmMedium: utm_medium,
      utmCampaign: utm_campaign,
      referrer,
      userAgent: ua,
    });

    void Promise.all([
      lead.token ? sendBriefLink(email, lead.token).catch((e) => console.warn("[subscribe] brief mail:", e)) : null,
      notifyOwnerLead(email, source).catch((e) => console.warn("[subscribe] owner mail:", e)),
      notifyTgLead(email, source).catch((e) => console.warn("[subscribe] telegram:", e)),
    ]);

    return NextResponse.json({ ok: true, status: lead.status }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }
}
