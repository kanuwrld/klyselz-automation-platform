"use client";

import { useState } from "react";

const OPTIONS: { value: string; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "qualified", label: "Qualified" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
  { value: "spam", label: "Spam" },
];

export function LeadStatusSelect({ id, status }: { id: number; status: string }) {
  const [s, setS] = useState(status);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function update(next: string) {
    setBusy(true);
    setErr(null);
    const prev = s;
    setS(next);
    try {
      const res = await fetch(`/api/inbound-leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        setS(prev);
        setErr("Fehler beim Speichern");
      }
    } catch {
      setS(prev);
      setErr("Netzwerkfehler");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <select
        value={s}
        onChange={(e) => update(e.target.value)}
        disabled={busy}
        className="h-9 rounded-md border border-border bg-background px-3 text-sm focus:border-foreground focus:outline-none disabled:opacity-50"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {busy && <span className="text-xs text-muted-foreground">speichere…</span>}
      {err && <span className="text-xs text-destructive">{err}</span>}
    </div>
  );
}
