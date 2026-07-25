import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getInboundLeads } from "@/lib/data";
import { getSession } from "@/lib/session";
import { formatDate } from "@/lib/utils";
import { CheckCircle2, Clock3, Mail, Target } from "lucide-react";

export const dynamic = "force-dynamic";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "success" | "outline" }> = {
  open: { label: "Open", variant: "secondary" },
  qualified: { label: "Qualified", variant: "success" },
  won: { label: "Won", variant: "default" },
  lost: { label: "Lost", variant: "destructive" },
  spam: { label: "Spam", variant: "outline" },
};

function compactDate(value: string | null) {
  return value ? formatDate(value) : "—";
}

export default async function CrmPage() {
  const session = await getSession();
  if (session?.role !== "agency") redirect("/");

  const leads = await getInboundLeads();
  const open = leads.filter((lead) => lead.status === "open").length;
  const qualified = leads.filter((lead) => lead.status === "qualified").length;
  const withBriefSent = leads.filter((lead) => lead.brief_sent_at).length;
  const conversion = leads.length ? Math.round((qualified / leads.length) * 100) : 0;

  const kpis = [
    { label: "Inbound gesamt", value: leads.length, icon: Mail },
    { label: "Open", value: open, icon: Clock3 },
    { label: "Qualified", value: qualified, icon: CheckCircle2 },
    { label: "Brief conversion", value: `${conversion}%`, icon: Target },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inbound CRM</h1>
          <p className="text-sm text-muted-foreground">
            E-Mails von klyselz.com, persönliche Brief-Links und Qualifizierung.
          </p>
        </div>
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Übersicht
        </Link>
      </header>

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

      <div className="mb-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
        <span>Brief sent: <b className="text-foreground">{withBriefSent}</b></span>
        <span>·</span>
        <span>Admin-Domain: <b className="text-foreground">admin.klyselz.com</b></span>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Kontakt</TableHead>
              <TableHead>Betrieb</TableHead>
              <TableHead>Problem / Ziel</TableHead>
              <TableHead>Quelle</TableHead>
              <TableHead>Brief</TableHead>
              <TableHead>Erstellt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>
                  <Badge variant={statusMap[lead.status]?.variant ?? "outline"}>
                    {statusMap[lead.status]?.label ?? lead.status}
                  </Badge>
                </TableCell>
                <TableCell className="min-w-[190px] font-medium">
                  {lead.email}
                  <div className="text-xs text-muted-foreground">{lead.contact_name ?? lead.phone ?? "—"}</div>
                </TableCell>
                <TableCell className="min-w-[180px]">
                  {lead.business ?? "—"}
                  <div className="text-xs text-muted-foreground">{lead.niche ?? lead.city ?? "—"}</div>
                </TableCell>
                <TableCell className="max-w-[320px] text-muted-foreground">
                  <div className="line-clamp-2">{lead.pain ?? lead.message ?? "Wartet auf Brief"}</div>
                  {lead.goal ? <div className="mt-1 line-clamp-1 text-xs">Goal: {lead.goal}</div> : null}
                </TableCell>
                <TableCell>
                  {lead.source ?? "website"}
                  <div className="text-xs text-muted-foreground">{lead.utm_source ?? lead.referrer ?? "—"}</div>
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  <div>Sent: {compactDate(lead.brief_sent_at)}</div>
                  <div className="text-xs">Done: {compactDate(lead.brief_completed_at)}</div>
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(lead.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </main>
  );
}
