import { redirect } from "next/navigation";
import { ArrowDownRight, ArrowUpRight, CircleDollarSign, Repeat2 } from "lucide-react";
import { AgencyNav } from "@/components/agency-nav";
import { NewFinancialEntryForm } from "@/components/operations-forms";
import { UserMenu } from "@/components/user-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getClients, getFinancialEntries, getProjects } from "@/lib/data";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";
const euro = (cents: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(cents / 100);
const category: Record<string, string> = { setup: "Setup", retainer: "Retainer", tool: "Tool", contractor: "Dienstleister", other: "Sonstiges" };

export default async function FinancePage() {
  const session = await getSession();
  if (session?.role !== "agency") redirect("/");
  const [entries, clients, projects] = await Promise.all([getFinancialEntries(), getClients(), getProjects()]);
  const month = new Date().toISOString().slice(0, 7);
  const current = entries.filter((entry) => String(entry.occurred_on).slice(0, 7) === month);
  const revenue = current.filter((entry) => entry.type === "revenue").reduce((sum, entry) => sum + entry.amount_cents, 0);
  const expense = current.filter((entry) => entry.type === "expense").reduce((sum, entry) => sum + entry.amount_cents, 0);
  const recurring = entries.filter((entry) => entry.type === "revenue" && entry.recurring).reduce((sum, entry) => sum + entry.amount_cents, 0);
  const kpis = [
    { label: "Einnahmen diesen Monat", value: euro(revenue), icon: ArrowUpRight },
    { label: "Ausgaben diesen Monat", value: euro(expense), icon: ArrowDownRight },
    { label: "Gewinn diesen Monat", value: euro(revenue - expense), icon: CircleDollarSign },
    { label: "Erfasster MRR", value: euro(recurring), icon: Repeat2 },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between gap-4"><div><h1 className="text-2xl font-semibold tracking-tight">Finanzen</h1><p className="text-sm text-muted-foreground">Einnahmen, Kosten und wiederkehrender Umsatz ohne Buchhaltungsballast.</p></div><UserMenu email={session.email} /></header>
      <AgencyNav />
      <section className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">{kpis.map(({ label, value, icon: Icon }) => <Card key={label}><CardHeader className="flex-row items-center justify-between space-y-0 pb-2"><CardTitle>{label}</CardTitle><Icon className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-semibold">{value}</div></CardContent></Card>)}</section>
      <div className="mb-6"><NewFinancialEntryForm clients={clients.map(({ id, name }) => ({ id, name }))} projects={projects.map(({ id, client_id, name }) => ({ id, client_id, name }))} /></div>
      <Card><Table><TableHeader><TableRow><TableHead>Datum</TableHead><TableHead>Typ</TableHead><TableHead>Kategorie</TableHead><TableHead>Kunde</TableHead><TableHead>Notiz</TableHead><TableHead className="text-right">Betrag</TableHead></TableRow></TableHeader>
        <TableBody>
          {entries.length === 0 && <TableRow><TableCell colSpan={6} className="py-12 text-center text-muted-foreground">Noch keine Buchungen. Erfasse nur die wichtigsten Einnahmen und Kosten.</TableCell></TableRow>}
          {entries.map((entry) => <TableRow key={entry.id}><TableCell>{new Date(entry.occurred_on).toLocaleDateString("de-DE")}</TableCell><TableCell><Badge variant={entry.type === "revenue" ? "success" : "secondary"}>{entry.type === "revenue" ? "Einnahme" : "Ausgabe"}</Badge></TableCell><TableCell>{category[entry.category] ?? entry.category}{entry.recurring && <span className="ml-2 text-xs text-muted-foreground">monatlich</span>}</TableCell><TableCell>{entry.client_name ?? "—"}</TableCell><TableCell className="max-w-64 truncate text-muted-foreground">{entry.note ?? "—"}</TableCell><TableCell className={`text-right font-medium ${entry.type === "expense" ? "text-destructive" : ""}`}>{entry.type === "expense" ? "−" : "+"}{euro(entry.amount_cents)}</TableCell></TableRow>)}
        </TableBody>
      </Table></Card>
    </main>
  );
}
