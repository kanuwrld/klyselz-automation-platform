"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type State = "idle" | "loading" | "ok" | "error";

export function ContactForm() {
  const [state, setState] = useState<State>("idle");
  const enabled = process.env.NEXT_PUBLIC_CONTACT_ENABLED === "true";

  if (!enabled) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-background/25 bg-background/10 p-8 text-center">
        <p className="text-lg font-semibold text-background">Portfolio-Demo</p>
        <p className="mt-2 text-sm text-background/70">
          Kontaktformular deaktiviert. Es werden keine Kontaktdaten angenommen.
        </p>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    const form = new FormData(e.currentTarget);
    const payload = {
      business: form.get("business"),
      contact: form.get("contact"),
      message: form.get("message"),
      website: form.get("website"),
    };
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setState(res.ok ? "ok" : "error");
      if (res.ok) (e.target as HTMLFormElement).reset();
    } catch {
      setState("error");
    }
  }

  if (state === "ok") {
    return (
      <div className="rounded-xl border border-background/25 bg-background/10 p-8 text-center">
	        <p className="text-lg font-semibold text-background">Danke! Prüfe dein Postfach.</p>
	        <p className="mt-1 text-sm text-background/70">Dein persönlicher Brief-Link ist unterwegs.</p>
      </div>
    );
  }

  const field =
    "w-full rounded-md border border-background/25 bg-transparent px-4 py-3 text-background placeholder:text-background/50 focus:border-background focus:outline-none";

  return (
    <form onSubmit={onSubmit} className="mx-auto grid max-w-md gap-3 text-left">
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <input name="business" required placeholder="Name deines Betriebs" className={field} />
      <input name="contact" type="email" required placeholder="E-Mail" className={field} />
      <textarea name="message" rows={3} placeholder="Kurz: worum geht's? (optional)" className={field} />
      <Button type="submit" variant="invert" size="lg" disabled={state === "loading"} className="w-full">
        {state === "loading" ? "Wird gesendet…" : "Brief-Link erhalten"}
      </Button>
      {state === "error" && (
        <p className="text-sm text-background/70">Etwas ist schiefgelaufen — bitte per E-Mail melden.</p>
      )}
      <p className="text-center text-xs text-background/50">
        Hinweise zur Verarbeitung stehen in der <a className="underline" href="/datenschutz">Datenschutzerklärung</a>.
      </p>
    </form>
  );
}
