import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getInboundLead } from "@/lib/data";
import { getSession } from "@/lib/session";
import { UserMenu } from "@/components/user-menu";
import { LeadStatusSelect } from "@/components/lead-status";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type FieldRow = { label: string; value: string | null | undefined };

function Field({ label, value }: FieldRow) {
  return (
    <div className="border-b border-border py-3 last:border-b-0">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 whitespace-pre-wrap text-sm">{value && value.trim() ? value : "—"}</div>
    </div>
  );
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "agency") redirect("/");

  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isFinite(id) || id <= 0) notFound();

  const lead = await getInboundLead(id);
  if (!lead) notFound();

  const briefFilled = !!lead.brief_completed_at;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">← Alle Leads</Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{lead.email}</h1>
          <p className="text-sm text-muted-foreground">Lead #{lead.id} · {formatDate(lead.created_at)}</p>
        </div>
        <UserMenu email={session.email} />
      </header>

      <section className="mb-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle>Status</CardTitle></CardHeader>
          <CardContent>
            <LeadStatusSelect id={lead.id} status={lead.status} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle>Fortschritt</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge variant={lead.brief_sent_at ? "success" : "outline"}>
              Mail: {lead.brief_sent_at ? "gesendet" : "—"}
            </Badge>
            <Badge variant={briefFilled ? "success" : "outline"}>
              Brief: {briefFilled ? "ausgefüllt" : lead.brief_sent_at ? "wartet" : "—"}
            </Badge>
          </CardContent>
        </Card>
      </section>

      <section className="mb-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle>Kontakt & Herkunft</CardTitle></CardHeader>
          <CardContent>
            <Field label="E-Mail" value={lead.email} />
            <Field label="Name" value={lead.contact_name} />
            <Field label="Telefon" value={lead.phone} />
            <Field label="Website" value={lead.website} />
            <Field label="Quelle" value={lead.source} />
            <Field label="Referrer" value={lead.referrer} />
            <Field label="UTM Source" value={lead.utm_source} />
            <Field label="UTM Medium" value={lead.utm_medium} />
            <Field label="UTM Campaign" value={lead.utm_campaign} />
          </CardContent>
        </Card>
      </section>

      <section className="mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Brief-Antworten {briefFilled ? "" : "(noch nicht ausgefüllt)"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Field label="Betrieb" value={lead.business} />
            <Field label="Nische" value={lead.niche} />
            <Field label="Stadt" value={lead.city} />
            <Field label="Team-Größe" value={lead.team_size} />
            <Field label="Aktuelle Kanäle" value={lead.current_channels} />
            <Field label="Problem / Pain" value={lead.pain} />
            <Field label="Ziel / Goal" value={lead.goal} />
            <Field label="Budget" value={lead.budget_range} />
            <Field label="Timeline" value={lead.timeline} />
            <Field label="Notizen" value={lead.notes} />
            <Field label="Nachricht (Contact-Form)" value={lead.message} />
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader className="pb-2"><CardTitle>Timeline</CardTitle></CardHeader>
          <CardContent>
            <Field label="Erstellt" value={formatDate(lead.created_at)} />
            <Field label="Mail gesendet" value={lead.brief_sent_at ? formatDate(lead.brief_sent_at) : null} />
            <Field label="Brief ausgefüllt" value={lead.brief_completed_at ? formatDate(lead.brief_completed_at) : null} />
            <Field label="Token benutzt" value={lead.brief_token_used_at ? formatDate(lead.brief_token_used_at) : null} />
            <Field label="Token läuft ab" value={lead.brief_token_expires_at ? formatDate(lead.brief_token_expires_at) : null} />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
