import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql, hasDb } from "@/lib/db";
import { signSession, COOKIE } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { validateLoginInput } from "@/lib/account-policy.mjs";

export const runtime = "nodejs";

const DUMMY_PASSWORD_HASH =
  "$2b$12$aGz8GKqLtoI7VutXK.4JkOj9T2na8Aj5EfDzTAj4t5vwU9vO.iEIi";

type AccountRow = {
  id: number;
  email: string;
  password_hash: string;
  role: "agency" | "client";
  client_id: number | null;
  status: "active" | "disabled";
  email_verified_at: string | null;
  client_status: "lead" | "trial" | "active" | "paused" | "churned" | null;
};

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(req, { key: "login", limit: 8, windowMs: 5 * 60 * 1000 });
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Zu viele Versuche. Bitte später erneut versuchen." },
        { status: 429, headers: { "Retry-After": String(limited.retryAfter ?? 60) } }
      );
    }
    const input = validateLoginInput((await req.json()) ?? {});
    if (!input.ok || !input.value) {
      return NextResponse.json({ error: "Ungültige Anmeldedaten" }, { status: 400 });
    }
    const credentials = input.value;
    if (!hasDb) {
      return NextResponse.json({ error: "Datenbank nicht konfiguriert" }, { status: 503 });
    }
    const rows = (await sql`
      SELECT
        u.id, u.email, u.password_hash, u.role, u.client_id, u.status,
        u.email_verified_at, c.status AS client_status
      FROM users u
      LEFT JOIN clients c ON c.id = u.client_id
      WHERE u.email = ${credentials.email}
      LIMIT 1
    `) as AccountRow[];
    const user = rows[0];
    const passwordMatches = await bcrypt.compare(
      credentials.password,
      user?.password_hash ?? DUMMY_PASSWORD_HASH
    );
    const activeClient =
      user?.role === "agency" ||
      (user?.client_id != null &&
        (user.client_status === "active" || user.client_status === "trial"));
    if (
      !user ||
      !passwordMatches ||
      user.status !== "active" ||
      !user.email_verified_at ||
      !activeClient
    ) {
      return NextResponse.json({ error: "Falsche E-Mail oder Passwort" }, { status: 401 });
    }
    await sql`
      UPDATE users
      SET last_login_at = now(), updated_at = now()
      WHERE id = ${user.id}
    `;
    const token = await signSession({
      uid: user.id,
      email: user.email,
      role: user.role,
      clientId: user.client_id ?? null,
    });
    const res = NextResponse.json({ ok: true, role: user.role });
    res.cookies.set(COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Fehler bei der Anmeldung" }, { status: 400 });
  }
}
