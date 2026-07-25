import { sql, type Lead, type Booking, type Prospect, type Client, type TicketWithClient, type TicketMessage, type Ticket, type InboundLead, type AgencyProject, type AgencyTask, type FinancialEntry } from "./db";

const hasDb = !!process.env.DATABASE_URL;

export async function getLeads(clientId?: number | null): Promise<Lead[]> {
  if (!hasDb) return [];
  try {
    if (clientId != null) {
      return (await sql`SELECT * FROM leads WHERE client_id = ${clientId} ORDER BY created_at DESC LIMIT 50`) as Lead[];
    }
    return (await sql`SELECT * FROM leads ORDER BY created_at DESC LIMIT 50`) as Lead[];
  } catch {
    return [];
  }
}

export async function getBookings(clientId?: number | null): Promise<Booking[]> {
  if (!hasDb) return [];
  try {
    if (clientId != null) {
      return (await sql`SELECT * FROM bookings WHERE client_id = ${clientId} ORDER BY slot_at ASC LIMIT 50`) as Booking[];
    }
    return (await sql`SELECT * FROM bookings ORDER BY slot_at ASC LIMIT 50`) as Booking[];
  } catch {
    return [];
  }
}

export async function getInboundLeads(): Promise<InboundLead[]> {
  if (!hasDb) return [];
  try {
    return (await sql`
      SELECT *
      FROM inbound_leads
      ORDER BY created_at DESC
      LIMIT 200`) as InboundLead[];
  } catch {
    return [];
  }
}

export async function getInboundLead(id: number): Promise<InboundLead | null> {
  if (!hasDb) return null;
  try {
    const rows = (await sql`SELECT * FROM inbound_leads WHERE id = ${id} LIMIT 1`) as InboundLead[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function getProspects(): Promise<Prospect[]> {
  if (!hasDb) return [];
  try {
    return (await sql`SELECT * FROM prospects ORDER BY score DESC, created_at DESC LIMIT 100`) as Prospect[];
  } catch {
    return [];
  }
}

export async function getClients(): Promise<Client[]> {
  if (!hasDb) return [];
  try {
    return (await sql`SELECT * FROM clients ORDER BY created_at DESC LIMIT 200`) as Client[];
  } catch {
    return [];
  }
}

export async function getTicketsForAgency(): Promise<TicketWithClient[]> {
  if (!hasDb) return [];
  try {
    return (await sql`
      SELECT t.*, c.name AS client_name,
             (SELECT COUNT(*) FROM ticket_messages m WHERE m.ticket_id = t.id) AS messages_count
      FROM tickets t
      LEFT JOIN clients c ON c.id = t.client_id
      ORDER BY t.last_activity_at DESC
      LIMIT 200`) as TicketWithClient[];
  } catch {
    return [];
  }
}

export async function getTicketsForClient(clientId: number): Promise<TicketWithClient[]> {
  if (!hasDb) return [];
  try {
    return (await sql`
      SELECT t.*, c.name AS client_name,
             (SELECT COUNT(*) FROM ticket_messages m WHERE m.ticket_id = t.id) AS messages_count
      FROM tickets t
      LEFT JOIN clients c ON c.id = t.client_id
      WHERE t.client_id = ${clientId}
      ORDER BY t.last_activity_at DESC
      LIMIT 100`) as TicketWithClient[];
  } catch {
    return [];
  }
}

export async function getTicket(id: number): Promise<Ticket | null> {
  if (!hasDb) return null;
  try {
    const rows = (await sql`SELECT * FROM tickets WHERE id = ${id} LIMIT 1`) as Ticket[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function getTicketMessages(ticketId: number): Promise<TicketMessage[]> {
  if (!hasDb) return [];
  try {
    return (await sql`SELECT * FROM ticket_messages WHERE ticket_id = ${ticketId} ORDER BY created_at ASC`) as TicketMessage[];
  } catch {
    return [];
  }
}

export async function getProjects(clientId?: number | null): Promise<AgencyProject[]> {
  if (!hasDb) return [];
  try {
    if (clientId != null) {
      return (await sql`
        SELECT p.*, c.name AS client_name
        FROM agency_projects p
        JOIN clients c ON c.id = p.client_id
        WHERE p.client_id = ${clientId}
        ORDER BY p.updated_at DESC`) as AgencyProject[];
    }
    return (await sql`
      SELECT p.*, c.name AS client_name
      FROM agency_projects p
      JOIN clients c ON c.id = p.client_id
      ORDER BY p.updated_at DESC
      LIMIT 200`) as AgencyProject[];
  } catch {
    return [];
  }
}

export async function getAgencyTasks(clientId?: number | null): Promise<AgencyTask[]> {
  if (!hasDb) return [];
  try {
    if (clientId != null) {
      return (await sql`
        SELECT t.*, p.name AS project_name, c.name AS client_name
        FROM agency_tasks t
        LEFT JOIN agency_projects p ON p.id = t.project_id
        JOIN clients c ON c.id = t.client_id
        WHERE t.client_id = ${clientId}
        ORDER BY (t.status = 'done') ASC, t.due_at ASC NULLS LAST, t.updated_at DESC`) as AgencyTask[];
    }
    return (await sql`
      SELECT t.*, p.name AS project_name, c.name AS client_name
      FROM agency_tasks t
      LEFT JOIN agency_projects p ON p.id = t.project_id
      JOIN clients c ON c.id = t.client_id
      ORDER BY (t.status = 'done') ASC, t.due_at ASC NULLS LAST, t.updated_at DESC
      LIMIT 300`) as AgencyTask[];
  } catch {
    return [];
  }
}

export async function getFinancialEntries(): Promise<FinancialEntry[]> {
  if (!hasDb) return [];
  try {
    return (await sql`
      SELECT f.*, c.name AS client_name
      FROM financial_entries f
      LEFT JOIN clients c ON c.id = f.client_id
      ORDER BY f.occurred_on DESC, f.id DESC
      LIMIT 500`) as FinancialEntry[];
  } catch {
    return [];
  }
}

export type Metrics = { total: number; newCount: number; booked: number; conversion: number };

export async function getMetrics(leads: Lead[]): Promise<Metrics> {
  const total = leads.length;
  const newCount = leads.filter((l) => l.status === "new").length;
  const booked = leads.filter((l) => l.status === "booked").length;
  const conversion = total ? Math.round((booked / total) * 100) : 0;
  return { total, newCount, booked, conversion };
}
