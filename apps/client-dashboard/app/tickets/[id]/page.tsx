import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/session";
import { getTicket, getTicketMessages } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { TicketReplyForm } from "@/components/ticket-reply-form";

export const dynamic = "force-dynamic";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "success" | "outline" }> = {
  open: { label: "Offen", variant: "secondary" },
  in_progress: { label: "In Arbeit", variant: "default" },
  waiting_client: { label: "Warten auf Kunde", variant: "outline" },
  closed: { label: "Geschlossen", variant: "success" },
};

export default async function TicketDetail({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { id } = await params;
  const ticketId = Number(id);
  if (!Number.isInteger(ticketId)) notFound();

  const ticket = await getTicket(ticketId);
  if (!ticket) notFound();
  if (session.role === "client" && ticket.client_id !== session.clientId) redirect("/tickets");

  const messages = await getTicketMessages(ticketId);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/tickets" className="text-sm text-muted-foreground hover:text-foreground">← Alle Tickets</Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{ticket.subject}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            #{ticket.id} · erstellt {formatDate(ticket.created_at)}
          </p>
        </div>
        <Badge variant={statusMap[ticket.status]?.variant ?? "outline"}>
          {statusMap[ticket.status]?.label ?? ticket.status}
        </Badge>
      </header>

      <div className="mb-6 space-y-3">
        {messages.map((m) => {
          const mine = m.author_role === session.role;
          return (
            <Card
              key={m.id}
              className={mine ? "ml-8 bg-primary text-primary-foreground" : "mr-8"}
            >
              <div className="p-4">
                <div className={mine ? "text-xs opacity-80" : "text-xs text-muted-foreground"}>
                  {m.author_role === "agency" ? "KLYSELZ" : "Kunde"} · {formatDate(m.created_at)}
                </div>
                <div className="mt-2 whitespace-pre-wrap text-sm">{m.body}</div>
              </div>
            </Card>
          );
        })}
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">Noch keine Nachrichten.</p>
        )}
      </div>

      {ticket.status !== "closed" && (
        <Card className="p-6">
          <TicketReplyForm ticketId={ticket.id} isAgency={session.role === "agency"} currentStatus={ticket.status} />
        </Card>
      )}
    </main>
  );
}
