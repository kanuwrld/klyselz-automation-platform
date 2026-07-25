"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type State = "idle" | "loading" | "error";

export function NewTicketForm() {
  const router = useRouter();
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setState("loading");
    const form = new FormData(e.currentTarget);
    const payload = {
      subject: form.get("subject"),
      priority: form.get("priority") ?? "normal",
      message: form.get("message"),
    };
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Fehler beim Anlegen");
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
      <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
        <input name="subject" required placeholder="Thema (z. B. Bot antwortet abends nicht)" className={field} />
        <select name="priority" defaultValue="normal" className={field}>
          <option value="low">niedrig</option>
          <option value="normal">normal</option>
          <option value="high">hoch</option>
          <option value="urgent">dringend</option>
        </select>
      </div>
      <textarea name="message" required rows={4} placeholder="Beschreibe Problem oder Wunsch" className={field} />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={state === "loading"}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {state === "loading" ? "Sende…" : "Ticket senden"}
        </button>
        {error && <span className="text-sm text-destructive">{error}</span>}
      </div>
    </form>
  );
}
