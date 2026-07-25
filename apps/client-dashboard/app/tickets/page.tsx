import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { getSession } from "@/lib/session";
import { getTicketsForClient } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { NewTicketForm } from "@/components/new-ticket-form";

export const dynamic = "force-dynamic";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "success" | "outline" }> = {
  open: { label: "Offen", variant: "secondary" },
  in_progress: { label: "In Arbeit", variant: "default" },
  waiting_client: { label: "Warten auf Kunde", variant: "outline" },
  closed: { label: "Geschlossen", variant: "success" },
};

const priorityMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  low: { label: "niedrig", variant: "outline" },
  normal: { label: "normal", variant: "secondary" },
  high: { label: "hoch", variant: "default" },
  urgent: { label: "dringend", variant: "destructive" },
};

export default async function TicketsPage() {
  const session = await getSession();
  if (!session) redirect("/login?from=/tickets");

  const tickets = session.clientId ? await getTicketsForClient(session.clientId) : [];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tickets</h1>
          <p className="text-sm text-muted-foreground">Schreib KLYSELZ direkt. Antwort bleibt im Dashboard sichtbar.</p>
        </div>
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">← Übersicht</Link>
      </header>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Neues Ticket</h2>
        <Card className="p-6">
          <NewTicketForm />
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Meine Tickets</h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thema</TableHead>
                <TableHead>Priorität</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Nachrichten</TableHead>
                <TableHead>Aktualisiert</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                    Noch leer. Erstelle dein erstes Ticket oben.
                  </TableCell>
                </TableRow>
              )}
              {tickets.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">
                    <Link href={`/tickets/${t.id}`} className="hover:underline">
                      {t.subject}
                    </Link>
                    <div className="text-xs text-muted-foreground">#{t.id}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={priorityMap[t.priority]?.variant ?? "outline"}>{priorityMap[t.priority]?.label ?? t.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusMap[t.status]?.variant ?? "outline"}>{statusMap[t.status]?.label ?? t.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{t.messages_count}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(t.last_activity_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </section>
    </main>
  );
}
