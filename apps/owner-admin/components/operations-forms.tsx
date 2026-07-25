"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ClientOption = { id: number; name: string };
type ProjectOption = { id: number; client_id: number; name: string };

const field = "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-foreground";
const button = "inline-flex h-10 items-center justify-center rounded-lg bg-foreground px-4 text-sm font-medium text-background transition hover:opacity-85 disabled:opacity-50";

function useSubmit(endpoint: string) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(payload: Record<string, unknown>, form: HTMLFormElement) {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error ?? "Speichern fehlgeschlagen");
      form.reset();
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Speichern fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  }

  return { submit, loading, error };
}

export function NewProjectForm({ clients }: { clients: ClientOption[] }) {
  const state = useSubmit("/api/projects");
  return (
    <details className="rounded-xl border bg-card p-4">
      <summary className="cursor-pointer text-sm font-medium">+ Neues Projekt</summary>
      <form
        className="mt-4 grid gap-3 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const data = new FormData(form);
          void state.submit(Object.fromEntries(data), form);
        }}
      >
        <select name="clientId" required defaultValue="" className={field}>
          <option value="" disabled>Kunde wählen</option>
          {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
        </select>
        <input name="name" required placeholder="Projektname" className={field} />
        <input name="service" placeholder="Leistung, z. B. Lead-Automation" className={field} />
        <input name="targetAt" type="date" aria-label="Zieldatum" className={field} />
        <input name="oneTimeValue" type="number" min="0" step="0.01" placeholder="Setup in €" className={field} />
        <input name="monthlyValue" type="number" min="0" step="0.01" placeholder="Monatlich in €" className={field} />
        <div className="flex items-center gap-3 md:col-span-2">
          <button disabled={state.loading || clients.length === 0} className={button}>{state.loading ? "Speichert…" : "Projekt anlegen"}</button>
          {state.error && <span className="text-sm text-destructive">{state.error}</span>}
          {clients.length === 0 && <span className="text-sm text-muted-foreground">Zuerst einen Kunden in der Datenbank anlegen.</span>}
        </div>
      </form>
    </details>
  );
}

export function NewTaskForm({ clients, projects }: { clients: ClientOption[]; projects: ProjectOption[] }) {
  const state = useSubmit("/api/tasks");
  return (
    <details className="rounded-xl border bg-card p-4">
      <summary className="cursor-pointer text-sm font-medium">+ Neue Aufgabe</summary>
      <form
        className="mt-4 grid gap-3 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const data = new FormData(form);
          void state.submit(Object.fromEntries(data), form);
        }}
      >
        <select name="clientId" required defaultValue="" className={field}>
          <option value="" disabled>Kunde wählen</option>
          {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
        </select>
        <select name="projectId" defaultValue="" className={field}>
          <option value="">Ohne Projekt</option>
          {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
        </select>
        <input name="title" required placeholder="Aufgabe" className={`${field} md:col-span-2`} />
        <select name="ownerRole" defaultValue="agency" className={field}>
          <option value="agency">Verantwortlich: Agentur</option>
          <option value="client">Verantwortlich: Kunde</option>
        </select>
        <div className="grid grid-cols-2 gap-3">
          <select name="priority" defaultValue="normal" className={field}>
            <option value="low">Niedrig</option><option value="normal">Normal</option><option value="high">Hoch</option><option value="urgent">Dringend</option>
          </select>
          <input name="dueAt" type="date" aria-label="Fällig am" className={field} />
        </div>
        <div className="flex items-center gap-3 md:col-span-2">
          <button disabled={state.loading || clients.length === 0} className={button}>{state.loading ? "Speichert…" : "Aufgabe anlegen"}</button>
          {state.error && <span className="text-sm text-destructive">{state.error}</span>}
        </div>
      </form>
    </details>
  );
}

export function NewFinancialEntryForm({ clients, projects }: { clients: ClientOption[]; projects: ProjectOption[] }) {
  const state = useSubmit("/api/finance");
  return (
    <details className="rounded-xl border bg-card p-4">
      <summary className="cursor-pointer text-sm font-medium">+ Einnahme oder Ausgabe</summary>
      <form
        className="mt-4 grid gap-3 md:grid-cols-3"
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const data = new FormData(form);
          const payload = { ...Object.fromEntries(data), recurring: data.get("recurring") === "on" };
          void state.submit(payload, form);
        }}
      >
        <select name="type" defaultValue="revenue" className={field}><option value="revenue">Einnahme</option><option value="expense">Ausgabe</option></select>
        <input name="amount" required type="number" min="0.01" step="0.01" placeholder="Betrag in €" className={field} />
        <select name="category" defaultValue="retainer" className={field}>
          <option value="setup">Setup</option><option value="retainer">Retainer</option><option value="tool">Tool</option><option value="contractor">Dienstleister</option><option value="other">Sonstiges</option>
        </select>
        <select name="clientId" defaultValue="" className={field}><option value="">Kein Kunde</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select>
        <select name="projectId" defaultValue="" className={field}><option value="">Kein Projekt</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select>
        <input name="occurredOn" type="date" aria-label="Buchungsdatum" className={field} />
        <input name="note" placeholder="Notiz" className={`${field} md:col-span-2`} />
        <label className="flex h-10 items-center gap-2 rounded-lg border px-3 text-sm"><input name="recurring" type="checkbox" /> monatlich wiederkehrend</label>
        <div className="flex items-center gap-3 md:col-span-3">
          <button disabled={state.loading} className={button}>{state.loading ? "Speichert…" : "Buchung speichern"}</button>
          {state.error && <span className="text-sm text-destructive">{state.error}</span>}
        </div>
      </form>
    </details>
  );
}

export function StatusSelect({ endpoint, id, value, options }: { endpoint: "/api/projects" | "/api/tasks"; id: number; value: string; options: { value: string; label: string }[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <select
      aria-label="Status ändern"
      value={value}
      disabled={loading}
      className="h-8 rounded-lg border bg-background px-2 text-xs outline-none"
      onChange={async (event) => {
        setLoading(true);
        await fetch(endpoint, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: event.target.value }) });
        setLoading(false);
        router.refresh();
      }}
    >
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  );
}
