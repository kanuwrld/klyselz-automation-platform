import { redirect } from "next/navigation";
import { BriefcaseBusiness, CircleDollarSign, Eye, Radio } from "lucide-react";
import { AgencyNav } from "@/components/agency-nav";
import { NewProjectForm, StatusSelect } from "@/components/operations-forms";
import { UserMenu } from "@/components/user-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getClients, getProjects } from "@/lib/data";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const statuses = [
  { value: "planned", label: "Geplant" }, { value: "in_progress", label: "In Arbeit" },
  { value: "client_review", label: "Kundenprüfung" }, { value: "live", label: "Live" },
  { value: "paused", label: "Pausiert" }, { value: "completed", label: "Abgeschlossen" },
];

const statusLabel = Object.fromEntries(statuses.map((status) => [status.value, status.label]));
const euro = (cents: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(cents / 100);

export default async function ProjectsPage() {
  const session = await getSession();
  if (session?.role !== "agency") redirect("/");
  const [projects, clients] = await Promise.all([getProjects(), getClients()]);
  const active = projects.filter((project) => ["in_progress", "client_review"].includes(project.status)).length;
  const live = projects.filter((project) => project.status === "live").length;
  const review = projects.filter((project) => project.status === "client_review").length;
  const mrr = projects.filter((project) => project.status !== "paused").reduce((sum, project) => sum + project.monthly_value, 0);

  const kpis = [
    { label: "Aktive Projekte", value: active, icon: BriefcaseBusiness },
    { label: "Kundenprüfung", value: review, icon: Eye },
    { label: "Live", value: live, icon: Radio },
    { label: "Projekt-MRR", value: euro(mrr), icon: CircleDollarSign },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div><h1 className="text-2xl font-semibold tracking-tight">Projekte</h1><p className="text-sm text-muted-foreground">Umsetzung, Fortschritt und nächster Schritt pro Kunde.</p></div>
        <UserMenu email={session.email} />
      </header>
      <AgencyNav />
      <section className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon }) => <Card key={label}><CardHeader className="flex-row items-center justify-between space-y-0 pb-2"><CardTitle>{label}</CardTitle><Icon className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-semibold">{value}</div></CardContent></Card>)}
      </section>
      <div className="mb-6"><NewProjectForm clients={clients.map(({ id, name }) => ({ id, name }))} /></div>
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Projekt</TableHead><TableHead>Kunde</TableHead><TableHead>Status</TableHead><TableHead>Fortschritt</TableHead><TableHead>Nächster Schritt</TableHead><TableHead>Ziel</TableHead><TableHead>Wert</TableHead></TableRow></TableHeader>
          <TableBody>
            {projects.length === 0 && <TableRow><TableCell colSpan={7} className="py-12 text-center text-muted-foreground">Noch keine Projekte. Lege das erste Projekt oben an.</TableCell></TableRow>}
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">{project.name}<div className="text-xs text-muted-foreground">{project.service ?? "—"}</div></TableCell>
                <TableCell>{project.client_name}</TableCell>
                <TableCell><StatusSelect endpoint="/api/projects" id={project.id} value={project.status} options={statuses} /></TableCell>
                <TableCell><div className="flex min-w-28 items-center gap-2"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-foreground" style={{ width: `${project.progress}%` }} /></div><span className="text-xs text-muted-foreground">{project.progress}%</span></div></TableCell>
                <TableCell className="max-w-56 text-sm text-muted-foreground">{project.next_step ?? "—"}</TableCell>
                <TableCell className="whitespace-nowrap text-sm">{project.target_at ? new Date(project.target_at).toLocaleDateString("de-DE") : "—"}</TableCell>
                <TableCell className="whitespace-nowrap"><Badge variant="outline">{euro(project.one_time_value)} + {euro(project.monthly_value)}/M</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </main>
  );
}
