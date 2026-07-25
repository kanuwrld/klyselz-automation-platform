"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type State = "idle" | "loading" | "ok" | "error";

export function HeroSubscribe({ source = "waitlist" }: { source?: string }) {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);
  const enabled = process.env.NEXT_PUBLIC_CONTACT_ENABLED === "true";

  if (!enabled) {
    return (
      <div className="mx-auto mt-9 max-w-md rounded-lg border border-border bg-muted px-5 py-4 text-sm">
        <p className="font-semibold">Portfolio-Demo</p>
        <p className="mt-0.5 text-muted-foreground">
          Warteliste deaktiviert. Es werden keine E-Mail-Adressen angenommen.
        </p>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setState("loading");
    const form = new FormData(e.currentTarget);
    const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const payload = {
      email: form.get("email"),
      website: form.get("website"),
      source,
      utm_source: params?.get("utm_source") ?? null,
      utm_medium: params?.get("utm_medium") ?? null,
      utm_campaign: params?.get("utm_campaign") ?? null,
      referrer: typeof document !== "undefined" ? document.referrer : null,
    };
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Etwas ist schiefgelaufen.");
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
      <div className="mx-auto mt-9 max-w-md rounded-lg border border-border bg-muted px-5 py-4 text-sm">
        <p className="font-semibold">Du bist auf der Warteliste.</p>
        <p className="mt-0.5 text-muted-foreground">Wir melden uns, sobald dein Platz frei ist — meist innerhalb von 48 Stunden.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="animate-fade-up mx-auto mt-9 flex w-full max-w-md flex-col gap-2 sm:flex-row">
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <input
        name="email"
        type="email"
        required
        inputMode="email"
        autoComplete="email"
        placeholder="Deine E-Mail für die Warteliste"
        className="h-12 flex-1 rounded-md border border-border bg-background px-4 text-base text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
      />
      <Button type="submit" size="lg" disabled={state === "loading"}>
        {state === "loading" ? "Sende…" : "Auf die Warteliste"}
      </Button>
      {state === "error" && error && (
        <p className="w-full text-center text-sm text-muted-foreground sm:text-left">{error}</p>
      )}
      <p className="w-full text-center text-xs text-muted-foreground">
        Details in der <a className="underline" href="/datenschutz">Datenschutzerklärung</a>.
      </p>
    </form>
  );
}
