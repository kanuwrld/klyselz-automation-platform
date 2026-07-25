import { cookies } from "next/headers";
import { COOKIE, verifyToken, type SessionData } from "./auth";
import { hasDb, sql } from "./db";

type CurrentAccount = {
  id: number;
  email: string;
  role: "agency" | "client";
  client_id: number | null;
  status: "active" | "disabled";
  email_verified_at: string | null;
  client_status: "lead" | "trial" | "active" | "paused" | "churned" | null;
};

// Server-only. Database revalidation makes account disablement effective
// without waiting for JWT expiry.
export async function getSession(): Promise<SessionData | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  const claimed = await verifyToken(token);
  if (!claimed) return null;
  if (!hasDb) return process.env.NODE_ENV === "production" ? null : claimed;

  try {
    const rows = (await sql`
      SELECT
        u.id, u.email, u.role, u.client_id, u.status, u.email_verified_at,
        c.status AS client_status
      FROM users u
      LEFT JOIN clients c ON c.id = u.client_id
      WHERE u.id = ${claimed.uid}
      LIMIT 1
    `) as CurrentAccount[];
    const user = rows[0];
    const activeClient =
      user?.role === "agency" ||
      (user?.client_id != null &&
        (user.client_status === "active" || user.client_status === "trial"));
    if (!user || user.status !== "active" || !user.email_verified_at || !activeClient) {
      return null;
    }
    return {
      uid: user.id,
      email: user.email,
      role: user.role,
      clientId: user.client_id,
    };
  } catch {
    return null;
  }
}
