"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const flow: Record<string, { label: string; next: string | null; variant: "default" | "secondary" | "destructive" | "success" | "outline" }> = {
  new: { label: "Neu", next: "contacted", variant: "secondary" },
  review: { label: "Prüfen", next: "contacted", variant: "secondary" },
  contacted: { label: "Kontaktiert", next: "replied", variant: "default" },
  replied: { label: "Antwort", next: "won", variant: "default" },
  won: { label: "Kunde ✓", next: null, variant: "success" },
  skip: { label: "Übersprungen", next: null, variant: "outline" },
};

export function ProspectActions({ id, status }: { id: number; status: string }) {
  const [s, setS] = useState(status);
  const [busy, setBusy] = useState(false);
  const cur = flow[s] ?? flow.new;

  async function update(next: string) {
    setBusy(true);
    try {
      const res = await fetch("/api/prospects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: next }),
      });
      if (res.ok) setS(next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant={cur.variant}>{cur.label}</Badge>
      {cur.next && (
        <button
          onClick={() => update(cur.next!)}
          disabled={busy}
          className="rounded-md border border-foreground/20 px-2 py-1 text-xs transition-colors hover:bg-foreground hover:text-background disabled:opacity-50"
        >
          → {flow[cur.next!]?.label}
        </button>
      )}
      {s !== "skip" && s !== "won" && (
        <button
          onClick={() => update("skip")}
          disabled={busy}
          className="rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        >
          Skip
        </button>
      )}
    </div>
  );
}
