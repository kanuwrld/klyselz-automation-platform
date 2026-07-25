"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type State = "idle" | "loading" | "ok" | "error";

export function BriefForm({ token, email, business }: { token: string; email: string; business?: string | null }) {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setError(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      token,
      contactName: form.get("contactName"),
      businessName: form.get("businessName"),
      website: form.get("website"),
      phone: form.get("phone"),
      city: form.get("city"),
      niche: form.get("niche"),
      teamSize: form.get("teamSize"),
      currentChannels: form.get("currentChannels"),
      pain: form.get("pain"),
      goal: form.get("goal"),
      budgetRange: form.get("budgetRange"),
      timeline: form.get("timeline"),
      notes: form.get("notes"),
    };

    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Brief konnte nicht gesendet werden.");
        setState("error");
        return;
      }
      setState("ok");
      (e.target as HTMLFormElement).reset();
    } catch {
      setError("Netzwerkfehler.");
      setState("error");
    }
  }

  if (state === "ok") {
    return (
      <div className="rounded-lg border border-border bg-muted p-6">
        <h2 className="text-xl font-bold">Danke. Brief ist angekommen.</h2>
        <p className="mt-2 text-muted-foreground">
          Dein Status ist jetzt qualified. Wir prüfen dein Geschäft und melden uns mit einer passenden Demo.
        </p>
      </div>
    );
  }

  const field =
    "w-full rounded-md border border-input bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none";
  const label = "text-sm font-medium";

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div className="rounded-lg border border-border bg-muted p-4 text-sm text-muted-foreground">
        Persönlicher Brief für <span className="font-semibold text-foreground">{email}</span>
      </div>

      <div className="grid gap-2">
        <label className={label}>Dein Name</label>
        <input name="contactName" className={field} placeholder="Max Mustermann" />
      </div>

      <div className="grid gap-2">
        <label className={label}>Name deines Betriebs</label>
        <input name="businessName" required className={field} defaultValue={business ?? ""} placeholder="Salon Beispiel" />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="grid gap-2">
          <label className={label}>Website / Instagram</label>
          <input name="website" className={field} placeholder="https://..." />
        </div>
        <div className="grid gap-2">
          <label className={label}>Telefon / WhatsApp</label>
          <input name="phone" className={field} placeholder="+49 ..." />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="grid gap-2">
          <label className={label}>Stadt</label>
          <input name="city" className={field} placeholder="München" />
        </div>
        <div className="grid gap-2">
          <label className={label}>Branche</label>
          <input name="niche" required className={field} placeholder="Friseur, Kosmetik, Praxis..." />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="grid gap-2">
          <label className={label}>Teamgröße</label>
          <select name="teamSize" className={field} defaultValue="">
            <option value="" disabled>Bitte wählen</option>
            <option>1 Person</option>
            <option>2-5 Personen</option>
            <option>6-15 Personen</option>
            <option>16+ Personen</option>
          </select>
        </div>
        <div className="grid gap-2">
          <label className={label}>Start-Zeitpunkt</label>
          <select name="timeline" className={field} defaultValue="">
            <option value="" disabled>Bitte wählen</option>
            <option>Sofort</option>
            <option>Diese Woche</option>
            <option>Diesen Monat</option>
            <option>Später</option>
          </select>
        </div>
      </div>

      <div className="grid gap-2">
        <label className={label}>Wo kommen Anfragen heute rein?</label>
        <textarea name="currentChannels" rows={3} className={field} placeholder="Instagram, WhatsApp, Telefon, Website, Google..." />
      </div>

      <div className="grid gap-2">
        <label className={label}>Was kostet dich aktuell am meisten Zeit oder Geld?</label>
        <textarea name="pain" required rows={4} className={field} placeholder="Nachrichten bleiben liegen, gleiche Fragen, No-Shows..." />
      </div>

      <div className="grid gap-2">
        <label className={label}>Was soll die KI-Systemlösung für dich verbessern?</label>
        <textarea name="goal" required rows={4} className={field} placeholder="Mehr Buchungen, schnellere Antworten, weniger Telefon..." />
      </div>

      <div className="grid gap-2">
        <label className={label}>Budget-Rahmen</label>
        <select name="budgetRange" className={field} defaultValue="">
          <option value="" disabled>Bitte wählen</option>
          <option>Start testen</option>
          <option>200-400 €/Monat</option>
          <option>400-700 €/Monat</option>
          <option>700+ €/Monat</option>
        </select>
      </div>

      <div className="grid gap-2">
        <label className={label}>Noch wichtig?</label>
        <textarea name="notes" rows={3} className={field} placeholder="Tools, Kalender, besondere Prozesse..." />
      </div>

      {state === "error" && error && <p className="text-sm text-muted-foreground">{error}</p>}

      <Button type="submit" size="lg" disabled={state === "loading"}>
        {state === "loading" ? "Sende..." : "Brief absenden"}
      </Button>
    </form>
  );
}
