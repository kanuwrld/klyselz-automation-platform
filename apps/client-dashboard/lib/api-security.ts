import { NextResponse, type NextRequest } from "next/server";

export function webhookSecret(req: NextRequest) {
  const configured = process.env.LEADS_WEBHOOK_SECRET;
  if (!configured) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "LEADS_WEBHOOK_SECRET fehlt" },
        { status: 503 }
      ),
    };
  }

  const auth = req.headers.get("authorization") ?? "";
  const bearer = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : null;
  const token = bearer || req.headers.get("x-webhook-secret")?.trim();

  if (token !== configured) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { ok: true as const };
}

export function textField(value: unknown, max = 500) {
  if (value == null) return null;
  if (typeof value !== "string" && typeof value !== "number") return null;
  const text = String(value).trim();
  if (!text) return null;
  return text.slice(0, max);
}

export function intField(value: unknown) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}
