import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { getProspects } from "@/lib/data";
import { getSession } from "@/lib/session";
import { ProspectActions } from "@/components/prospect-actions";

export const dynamic = "force-dynamic";

function scoreVariant(score: number): "success" | "default" | "secondary" {
  if (score >= 75) return "success";
  if (score >= 50) return "default";
  return "secondary";
}

export default async function ProspectsPage() {
  const session = await getSession();
  if (session?.role !== "agency") redirect("/");
  const prospects = await getProspects();
  const hot = prospects.filter((p) => p.score >= 75).length;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Lead-Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            KI sammelt, bewertet und schreibt Entwürfe. Du prüfst und kontaktierst live.
          </p>
        </div>
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">← Dashboard</Link>
      </header>

      <div className="mb-6 flex gap-3 text-sm text-muted-foreground">
        <span>Gesamt: <b className="text-foreground">{prospects.length}</b></span>
        <span>·</span>
        <span>Hot Leads (≥75): <b className="text-foreground">{hot}</b></span>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Score</TableHead>
              <TableHead>Betrieb</TableHead>
              <TableHead>Kanal</TableHead>
              <TableHead>Beobachtung</TableHead>
              <TableHead>Entwurf (DE)</TableHead>
              <TableHead>Status / Aktion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prospects.map((p) => (
              <TableRow key={p.id}>
                <TableCell><Badge variant={scoreVariant(p.score)}>{p.score}</Badge></TableCell>
                <TableCell className="font-medium">
                  {p.salon}
                  <div className="text-xs text-muted-foreground">{p.city} · {p.contact}</div>
                </TableCell>
                <TableCell>{p.channel}</TableCell>
                <TableCell className="max-w-[180px] text-muted-foreground">{p.observation}</TableCell>
                <TableCell className="max-w-[260px]">
                  <span className="line-clamp-2 text-muted-foreground">{p.draft}</span>
                </TableCell>
                <TableCell><ProspectActions id={p.id} status={p.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Leadgen-Pipeline: tools/prospect-pipeline · Start: npm run leadgen:dry-run
      </p>
    </main>
  );
}
