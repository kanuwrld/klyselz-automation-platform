import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAgencyTasks, getBookings, getLeads, getMetrics, getProjects, getTicketsForClient } from "@/lib/data";
import { getSession } from "@/lib/session";
import { UserMenu } from "@/components/user-menu";
import { formatDate } from "@/lib/utils";
import { CalendarCheck, Inbox, LifeBuoy, Sparkles } from "lucide-react";
import { ClientNav } from "@/components/client-nav";

export const dynamic = "force-dynamic";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "success" | "outline" }> = {
  new: { label: "Neu", variant: "secondary" },
  qualified: { label: "Qualifiziert", variant: "default" },
  booked: { label: "Gebucht", variant: "success" },
  lost: { label: "Verloren", variant: "destructive" },
  pending: { label: "Wartet", variant: "secondary" },
  confirmed: { label: "Bestätigt", variant: "success" },
  done: { label: "Erledigt", variant: "outline" },
  no_show: { label: "No-Show", variant: "destructive" },
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const clientId = session.clientId ?? null;
  const leads = await getLeads(clientId);
  const bookings = await getBookings(clientId);
  const metrics = await getMetrics(leads);
  const tickets = clientId ? await getTicketsForClient(clientId) : [];
  const projects = clientId ? await getProjects(clientId) : [];
  const tasks = clientId ? await getAgencyTasks(clientId) : [];
  const openTickets = tickets.filter((ticket) => ticket.status !== "closed").length;
  const clientName = process.env.NEXT_PUBLIC_CLIENT_NAME ?? "Kunden-Dashboard";

  const kpis = [
    { label: "Anfragen gesamt", value: metrics.total, icon: Inbox },
    { label: "Neue Anfragen", value: metrics.newCount, icon: Sparkles },
    { label: "Buchungen", value: metrics.booked, icon: CalendarCheck },
    { label: "Offene Tickets", value: openTickets, icon: LifeBuoy },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{clientName}</h1>
          <p className="text-sm text-muted-foreground">Anfragen, Termine und Support an einem Ort.</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/tickets" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Tickets{openTickets > 0 ? ` · ${openTickets}` : ""}
          </Link>
          {session ? <UserMenu email={session.email} /> : <Badge variant="success">System aktiv</Badge>}
        </div>
      </header>

      <ClientNav />

      <section className="mb-8">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div><h2 className="text-lg font-semibold">Ihre Projekte</h2><p className="text-sm text-muted-foreground">Aktueller Stand Ihrer Automationen.</p></div>
          <Badge variant="outline">{projects.filter((project) => project.status !== "completed").length} aktiv</Badge>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {projects.length === 0 && <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">Noch kein Projekt hinterlegt.</CardContent></Card>}
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader className="pb-3"><div className="flex items-start justify-between gap-3"><div><CardTitle className="text-base">{project.name}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{project.service ?? "KI-Automation"}</p></div><Badge variant={project.status === "live" ? "success" : "secondary"}>{project.status === "live" ? "Live" : project.status === "client_review" ? "Ihre Prüfung" : project.status === "completed" ? "Abgeschlossen" : "In Arbeit"}</Badge></div></CardHeader>
              <CardContent>
                <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground"><span>Fortschritt</span><span>{project.progress}%</span></div>
                <div className="mb-4 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-foreground transition-all" style={{ width: `${project.progress}%` }} /></div>
                <div className="rounded-lg bg-muted/70 p-3 text-sm"><span className="text-muted-foreground">Nächster Schritt: </span>{project.next_step ?? "Wir melden uns mit dem nächsten Update."}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Nächste Schritte</h2>
        <Card><Table><TableHeader><TableRow><TableHead>Aufgabe</TableHead><TableHead>Projekt</TableHead><TableHead>Verantwortlich</TableHead><TableHead>Fällig</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>
          {tasks.length === 0 && <TableRow><TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">Aktuell sind keine Aufgaben offen.</TableCell></TableRow>}
          {tasks.slice(0, 8).map((task) => <TableRow key={task.id}><TableCell className="font-medium">{task.title}</TableCell><TableCell>{task.project_name ?? "—"}</TableCell><TableCell>{task.owner_role === "client" ? "Sie" : "KLYSELZ"}</TableCell><TableCell>{task.due_at ? new Date(task.due_at).toLocaleDateString("de-DE") : "—"}</TableCell><TableCell><Badge variant={task.status === "done" ? "success" : task.status === "blocked" ? "destructive" : "secondary"}>{task.status === "done" ? "Erledigt" : task.status === "blocked" ? "Blockiert" : task.status === "in_progress" ? "In Arbeit" : "Offen"}</Badge></TableCell></TableRow>)}
        </TableBody></Table></Card>
      </section>

      <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>{kpi.label}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Letzte Anfragen</h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kunde</TableHead>
                <TableHead>Kanal</TableHead>
                <TableHead>Nachricht</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Zeit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">
                    {lead.name ?? "—"}
                    <div className="text-xs text-muted-foreground">{lead.contact}</div>
                  </TableCell>
                  <TableCell>{lead.channel}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">{lead.message}</TableCell>
                  <TableCell>
                    <Badge variant={statusMap[lead.status]?.variant ?? "outline"}>
                      {statusMap[lead.status]?.label ?? lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(lead.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Nächste Termine</h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kunde</TableHead>
                <TableHead>Leistung</TableHead>
                <TableHead>Wann</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.customer_name ?? "—"}</TableCell>
                  <TableCell>{booking.service}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatDate(booking.slot_at)}</TableCell>
                  <TableCell>
                    <Badge variant={statusMap[booking.status]?.variant ?? "outline"}>
                      {statusMap[booking.status]?.label ?? booking.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </section>

      <footer className="mt-10 text-center text-xs text-muted-foreground">
        KLYSELZ Dashboard · Next.js + Neon
      </footer>
    </main>
  );
}
