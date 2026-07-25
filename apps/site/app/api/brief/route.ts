import { NextRequest, NextResponse } from "next/server";
import { textField } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { completeBrief } from "@/lib/brief";
import { notifyOwnerQualified } from "@/lib/email";
import { notifyTgQualified } from "@/lib/telegram";
import { hasCrmDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    if (process.env.NEXT_PUBLIC_CONTACT_ENABLED !== "true" || !hasCrmDb) {
      return NextResponse.json(
        { error: "Briefing ist in dieser Portfolio-Demo deaktiviert." },
        { status: 503 }
      );
    }
    const limited = rateLimit(req, { key: "brief", limit: 20, windowMs: 10 * 60 * 1000 });
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Zu viele Anfragen. Bitte später erneut versuchen." },
        { status: 429, headers: { "Retry-After": String(limited.retryAfter ?? 60) } }
      );
    }

    const body = (await req.json()) ?? {};
    const token = textField(body.token, 300);
    const payload = {
      contactName: textField(body.contactName, 120),
      businessName: textField(body.businessName, 160),
      website: textField(body.website, 240),
      phone: textField(body.phone, 120),
      city: textField(body.city, 120),
      niche: textField(body.niche, 140),
      teamSize: textField(body.teamSize, 80),
      currentChannels: textField(body.currentChannels, 1200),
      pain: textField(body.pain, 1800),
      goal: textField(body.goal, 1800),
      budgetRange: textField(body.budgetRange, 80),
      timeline: textField(body.timeline, 80),
      notes: textField(body.notes, 1800),
    };

    if (!token || !payload.businessName || !payload.niche || !payload.pain || !payload.goal) {
      return NextResponse.json({ error: "Bitte Pflichtfelder ausfüllen." }, { status: 400 });
    }

    const lead = await completeBrief(token, {
      contactName: payload.contactName,
      businessName: payload.businessName,
      website: payload.website,
      phone: payload.phone,
      city: payload.city,
      niche: payload.niche,
      teamSize: payload.teamSize,
      currentChannels: payload.currentChannels,
      pain: payload.pain,
      goal: payload.goal,
      budgetRange: payload.budgetRange,
      timeline: payload.timeline,
      notes: payload.notes,
    });

    if (!lead) {
      return NextResponse.json({ error: "Link ungültig oder bereits verwendet." }, { status: 404 });
    }

    void notifyOwnerQualified({
      email: lead.email,
      business: payload.businessName,
      niche: payload.niche,
      goal: payload.goal,
    }).catch((e) => console.warn("[brief] owner mail:", e));
    void notifyTgQualified({
      email: lead.email,
      business: payload.businessName,
      niche: payload.niche,
      goal: payload.goal,
    }).catch((e) => console.warn("[brief] telegram:", e));

    return NextResponse.json({ ok: true, status: lead.status });
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }
}
