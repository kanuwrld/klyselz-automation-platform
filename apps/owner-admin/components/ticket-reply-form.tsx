"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = { ticketId: number; isAgency: boolean; currentStatus: string };
type State = "idle" | "loading" | "error";

export function TicketReplyForm({ ticketId, isAgency, currentStatus }: Props) {
  const router = useRouter();
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>(currentStatus);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setState("loading");
    const form = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = { body: form.get("body") };
    if (isAgency) payload.status = status;
    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Fehler");
        setState("error");
        return;
      }
      (e.target as HTMLFormElement).reset();
      setState("idle");
      router.refresh();
    } catch {
      setError("Netzwerkfehler");
      setState("error");
    }
  }

  const field = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-foreground";

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <textarea name="body" required rows={4} placeholder="Antwort oder Rückfrage" className={field} />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={state === "loading"}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {state === "loading" ? "Sende…" : "Senden"}
        </button>
        {isAgency && (
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={field + " h-10 w-auto"}>
              <option value="open">Offen</option>
              <option value="in_progress">In Arbeit</option>
              <option value="waiting_client">Warten auf Kunde</option>
              <option value="closed">Geschlossen</option>
            </select>
          </label>
        )}
        {error && <span className="text-sm text-destructive">{error}</span>}
      </div>
    </form>
  );
}
