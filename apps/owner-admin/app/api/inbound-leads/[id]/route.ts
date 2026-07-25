import { NextRequest, NextResponse } from "next/server";
import { sql, hasDb } from "@/lib/db";
import { getSession } from "@/lib/session";

const ALLOWED = new Set(["open", "qualified", "won", "lost", "spam"]);

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "agency") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasDb) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const { id: idParam } = await ctx.params;
  const id = Number(idParam);
  if (!Number.isFinite(id) || id <= 0) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = (await req.json().catch(() => null)) as { status?: string } | null;
  const status = body?.status;
  if (!status || !ALLOWED.has(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const rows = (await sql`
    UPDATE inbound_leads SET status = ${status}, updated_at = now() WHERE id = ${id}
    RETURNING id, status`) as Array<{ id: number; status: string }>;
  if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true, id: rows[0].id, status: rows[0].status });
}
