import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { getClients } from "@/lib/data";
import { getSession } from "@/lib/session";
import { AgencyNav } from "@/components/agency-nav";

export const dynamic = "force-dynamic";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "success" | "outline" }> = {
  lead: { label: "Lead", variant: "secondary" },
  trial: { label: "Test", variant: "default" },
  active: { label: "Aktiv", variant: "success" },
  paused: { label: "Pausiert", variant: "outline" },
  churned: { label: "Verloren", variant: "destructive" },
};

export default async function ClientsPage() {
  const session = await getSession();
  if (session?.role !== "agency") redirect("/");

  const clients = await getClients();
  const active = clients.filter((c) => c.status === "active").length;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">KLYSELZ Kunden</h1>
          <p className="text-sm text-muted-foreground">Alle betreuten Betriebe, Dashboards und Statuswerte.</p>
        </div>
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">← Übersicht</Link>
      </header>

      <AgencyNav />

      <div className="mb-6 flex gap-3 text-sm text-muted-foreground">
        <span>Gesamt: <b className="text-foreground">{clients.length}</b></span>
        <span>·</span>
        <span>Aktiv: <b className="text-foreground">{active}</b></span>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Betrieb</TableHead>
              <TableHead>Paket</TableHead>
              <TableHead>Monatlich</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dashboard</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}<div className="text-xs text-muted-foreground">{c.slug}</div></TableCell>
                <TableCell>{c.plan ?? "—"}</TableCell>
                <TableCell>{new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(c.monthly_fee / 100)}</TableCell>
                <TableCell><Badge variant={statusMap[c.status]?.variant ?? "outline"}>{statusMap[c.status]?.label ?? c.status}</Badge></TableCell>
                <TableCell>
                  {c.dashboard_url ? (
                    <a href={c.dashboard_url} target="_blank" rel="noreferrer" className="text-muted-foreground underline hover:text-foreground">öffnen</a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </main>
  );
}
