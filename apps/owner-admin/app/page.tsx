import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { getInboundLeads } from "@/lib/data";
import { getSession } from "@/lib/session";
import { UserMenu } from "@/components/user-menu";
import { formatDate } from "@/lib/utils";
import { Inbox, CheckCircle2, Clock3, Send } from "lucide-react";
import { AgencyNav } from "@/components/agency-nav";

export const dynamic = "force-dynamic";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "success" | "outline" }> = {
  open: { label: "Open", variant: "secondary" },
  qualified: { label: "Qualified", variant: "success" },
  won: { label: "Won", variant: "default" },
  lost: { label: "Lost", variant: "destructive" },
  spam: { label: "Spam", variant: "outline" },
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "agency") redirect("/tickets");

  const leads = await getInboundLeads();
  const total = leads.length;
  const open = leads.filter((l) => l.status === "open").length;
  const qualified = leads.filter((l) => l.status === "qualified").length;
  const briefSent = leads.filter((l) => l.brief_sent_at).length;

  const kpis = [
    { label: "Inbound gesamt", value: total, icon: Inbox },
    { label: "Open", value: open, icon: Clock3 },
    { label: "Qualified", value: qualified, icon: CheckCircle2 },
    { label: "Brief sent", value: briefSent, icon: Send },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">KLYSELZ · Inbound Leads</h1>
          <p className="text-sm text-muted-foreground">Alle Anfragen von der Website in einer Tabelle.</p>
        </div>
        <UserMenu email={session.email} />
      </header>

      <AgencyNav />

      <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>{k.label}</CardTitle>
              <k.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>E-Mail</TableHead>
              <TableHead>Betrieb</TableHead>
              <TableHead>Quelle</TableHead>
              <TableHead>Mail</TableHead>
              <TableHead>Brief</TableHead>
              <TableHead>Erstellt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  Noch keine Anfragen. Sobald jemand die E-Mail auf klyselz.com hinterlässt, erscheint sie hier.
                </TableCell>
              </TableRow>
            )}
            {leads.map((l) => (
              <TableRow key={l.id}>
                <TableCell>
                  <Badge variant={statusMap[l.status]?.variant ?? "outline"}>
                    {statusMap[l.status]?.label ?? l.status}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  <Link href={`/leads/${l.id}`} className="hover:underline">{l.email}</Link>
                  <div className="text-xs text-muted-foreground">{l.contact_name ?? l.phone ?? "—"}</div>
                </TableCell>
                <TableCell>
                  {l.business ?? "—"}
                  <div className="text-xs text-muted-foreground">{l.niche ?? l.city ?? "—"}</div>
                </TableCell>
                <TableCell>{l.source ?? "website"}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {l.brief_sent_at ? <Badge variant="success">gesendet</Badge> : <span>—</span>}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {l.brief_completed_at ? <Badge variant="success">ausgefüllt</Badge> : l.brief_sent_at ? <span>wartet</span> : <span>—</span>}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(l.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <footer className="mt-10 text-center text-xs text-muted-foreground">KLYSELZ Admin</footer>
    </main>
  );
}
