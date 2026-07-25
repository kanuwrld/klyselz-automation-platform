"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(params.get("from") || "/");
        router.refresh();
      } else {
        setError(data.error || "Anmeldung fehlgeschlagen");
      }
    } catch {
      setError("Netzwerkfehler");
    } finally {
      setBusy(false);
    }
  }

  const field =
    "w-full rounded-md border border-input bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none";

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-xl font-extrabold tracking-[0.2em]">KLYSELZ</div>
          <p className="mt-1 text-sm text-muted-foreground">Anmeldung im Dashboard</p>
        </div>
        <form onSubmit={onSubmit} className="grid gap-3 rounded-xl border border-border bg-background p-6">
          <input name="email" type="email" required placeholder="E-Mail" className={field} autoComplete="username" />
          <input name="password" type="password" required placeholder="Passwort" className={field} autoComplete="current-password" />
          <button
            type="submit"
            disabled={busy}
            className="mt-1 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {busy ? "Anmelden…" : "Anmelden"}
          </button>
          {error && <p className="text-center text-sm text-destructive">{error}</p>}
        </form>
        <p className="mt-4 text-center text-xs text-muted-foreground">Zugang nur für Kunden & Team von KLYSELZ</p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
