import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { ok: true as const, session };
}

export async function requireAgency() {
  const result = await requireSession();
  if (!result.ok) return result;
  if (result.session.role !== "agency") {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return result;
}
