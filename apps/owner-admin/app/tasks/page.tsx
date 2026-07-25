import { redirect } from "next/navigation";
import { AlertTriangle, CheckCircle2, Clock3, UserRoundCheck } from "lucide-react";
import { AgencyNav } from "@/components/agency-nav";
import { NewTaskForm, StatusSelect } from "@/components/operations-forms";
import { UserMenu } from "@/components/user-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAgencyTasks, getClients, getProjects } from "@/lib/data";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const statuses = [
  { value: "todo", label: "Offen" }, { value: "in_progress", label: "In Arbeit" },
  { value: "blocked", label: "Blockiert" }, { value: "done", label: "Erledigt" },
];

const priority: Record<string, { label: string; variant: "outline" | "secondary" | "default" | "destructive" }> = {
  low: { label: "Niedrig", variant: "outline" }, normal: { label: "Normal", variant: "secondary" },
  high: { label: "Hoch", variant: "default" }, urgent: { label: "Dringend", variant: "destructive" },
};

export default async function TasksPage() {
  const session = await getSession();
  if (session?.role !== "agency") redirect("/");
  const [tasks, clients, projects] = await Promise.all([getAgencyTasks(), getClients(), getProjects()]);
  const open = tasks.filter((task) => task.status !== "done").length;
  const blocked = tasks.filter((task) => task.status === "blocked").length;
  const waitingClient = tasks.filter((task) => task.owner_role === "client" && task.status !== "done").length;
  const overdue = tasks.filter((task) => task.status !== "done" && task.due_at && new Date(task.due_at) < new Date(new Date().toDateString())).length;
  const kpis = [
    { label: "Offen", value: open, icon: Clock3 }, { label: "Überfällig", value: overdue, icon: AlertTriangle },
    { label: "Beim Kunden", value: waitingClient, icon: UserRoundCheck }, { label: "Blockiert", value: blocked, icon: CheckCircle2 },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between gap-4"><div><h1 className="text-2xl font-semibold tracking-tight">Aufgaben</h1><p className="text-sm text-muted-foreground">Was als Nächstes getan werden muss und wer verantwortlich ist.</p></div><UserMenu email={session.email} /></header>
      <AgencyNav />
      <section className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">{kpis.map(({ label, value, icon: Icon }) => <Card key={label}><CardHeader className="flex-row items-center justify-between space-y-0 pb-2"><CardTitle>{label}</CardTitle><Icon className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-semibold">{value}</div></CardContent></Card>)}</section>
      <div className="mb-6"><NewTaskForm clients={clients.map(({ id, name }) => ({ id, name }))} projects={projects.map(({ id, client_id, name }) => ({ id, client_id, name }))} /></div>
      <Card><Table><TableHeader><TableRow><TableHead>Aufgabe</TableHead><TableHead>Kunde / Projekt</TableHead><TableHead>Verantwortlich</TableHead><TableHead>Priorität</TableHead><TableHead>Fällig</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
        <TableBody>
          {tasks.length === 0 && <TableRow><TableCell colSpan={6} className="py-12 text-center text-muted-foreground">Noch keine Aufgaben. Lege oben den ersten nächsten Schritt an.</TableCell></TableRow>}
          {tasks.map((task) => <TableRow key={task.id}><TableCell className="font-medium">{task.title}</TableCell><TableCell>{task.client_name}<div className="text-xs text-muted-foreground">{task.project_name ?? "Ohne Projekt"}</div></TableCell><TableCell>{task.owner_role === "client" ? "Kunde" : "Agentur"}</TableCell><TableCell><Badge variant={priority[task.priority]?.variant ?? "outline"}>{priority[task.priority]?.label ?? task.priority}</Badge></TableCell><TableCell className="whitespace-nowrap">{task.due_at ? new Date(task.due_at).toLocaleDateString("de-DE") : "—"}</TableCell><TableCell><StatusSelect endpoint="/api/tasks" id={task.id} value={task.status} options={statuses} /></TableCell></TableRow>)}
        </TableBody>
      </Table></Card>
    </main>
  );
}
