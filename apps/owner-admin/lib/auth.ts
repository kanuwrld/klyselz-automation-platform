import { SignJWT, jwtVerify } from "jose";

// Edge-safe token helpers. Server-side account state is checked separately.
function sessionSecret() {
  const raw = process.env.AUTH_SECRET;
  if (!raw && process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET is required in production");
  }
  return new TextEncoder().encode(raw ?? "dev-secret-change-me");
}

export const COOKIE = "klyselz_session";

export type Role = "agency" | "client";
export type SessionData = { uid: number; email: string; role: Role; clientId: number | null };

export async function signSession(data: SessionData): Promise<string> {
  return await new SignJWT({ ...data })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(sessionSecret());
}

export async function verifyToken(token: string): Promise<SessionData | null> {
  try {
    const { payload } = await jwtVerify(token, sessionSecret());
    const uid = Number(payload.uid);
    const email = typeof payload.email === "string" ? payload.email : "";
    const role = payload.role === "agency" || payload.role === "client" ? payload.role : null;
    if (!Number.isFinite(uid) || !email || !role) return null;
    return {
      uid,
      email,
      role,
      clientId: payload.clientId != null ? Number(payload.clientId) : null,
    };
  } catch {
    return null;
  }
}
