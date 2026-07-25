import { neon } from "@neondatabase/serverless";

// Neon serverless client. Without DATABASE_URL the dashboard shows an empty state.
const url = process.env.DATABASE_URL;
export const hasDb = !!url;
if (!hasDb) {
  console.warn("[db] DATABASE_URL missing; dashboard data is unavailable.");
}

export const sql = (url
  ? neon(url)
  : (() => {
      throw new Error("DATABASE_URL nicht gesetzt");
    })) as ReturnType<typeof neon>;

export type Lead = {
  id: number;
  name: string | null;
  contact: string | null;
  channel: string | null;
  message: string | null;
  status: "new" | "qualified" | "booked" | "lost";
  created_at: string;
};

export type Booking = {
  id: number;
  customer_name: string | null;
  service: string | null;
  slot_at: string;
  status: "pending" | "confirmed" | "done" | "no_show";
};

export type Prospect = {
  id: number;
  salon: string;
  city: string | null;
  channel: string | null;
  contact: string | null;
  website: string | null;
  observation: string | null;
  score: number;
  draft: string | null;
  status: "new" | "review" | "contacted" | "replied" | "won" | "skip";
  created_at: string;
};

export type Client = {
  id: number;
  name: string;
  slug: string | null;
  plan: string | null;
  monthly_fee: number;
  status: "lead" | "trial" | "active" | "paused" | "churned";
  dashboard_url: string | null;
  created_at: string;
};

export type ProjectStatus = "planned" | "in_progress" | "client_review" | "live" | "paused" | "completed";
export type TaskStatus = "todo" | "in_progress" | "blocked" | "done";
export type TaskPriority = "low" | "normal" | "high" | "urgent";

export type AgencyProject = {
  id: number;
  client_id: number;
  client_name: string;
  name: string;
  service: string | null;
  status: ProjectStatus;
  progress: number;
  one_time_value: number;
  monthly_value: number;
  next_step: string | null;
  started_at: string | null;
  target_at: string | null;
  updated_at: string;
};

export type AgencyTask = {
  id: number;
  project_id: number | null;
  client_id: number;
  project_name: string | null;
  client_name: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  owner_role: "agency" | "client";
  due_at: string | null;
  updated_at: string;
};

export type FinancialEntry = {
  id: number;
  client_id: number | null;
  project_id: number | null;
  client_name: string | null;
  type: "revenue" | "expense";
  category: "setup" | "retainer" | "tool" | "contractor" | "other";
  amount_cents: number;
  recurring: boolean;
  occurred_on: string;
  note: string | null;
};

export type TicketStatus = "open" | "in_progress" | "waiting_client" | "closed";
export type TicketPriority = "low" | "normal" | "high" | "urgent";
export type AuthorRole = "agency" | "client";

export type Ticket = {
  id: number;
  client_id: number | null;
  created_by: number | null;
  subject: string;
  priority: TicketPriority;
  status: TicketStatus;
  last_activity_at: string;
  created_at: string;
};

export type TicketWithClient = Ticket & {
  client_name: string | null;
  messages_count: number;
};

export type TicketMessage = {
  id: number;
  ticket_id: number;
  author_id: number | null;
  author_role: AuthorRole;
  body: string;
  created_at: string;
};

export type InboundLeadStatus = "open" | "qualified" | "won" | "lost" | "spam";

export type InboundLead = {
  id: number;
  email: string;
  business: string | null;
  contact_name: string | null;
  message: string | null;
  source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer: string | null;
  user_agent: string | null;
  status: InboundLeadStatus;
  brief_sent_at: string | null;
  brief_token_expires_at: string | null;
  brief_token_used_at: string | null;
  brief_completed_at: string | null;
  website: string | null;
  phone: string | null;
  city: string | null;
  niche: string | null;
  team_size: string | null;
  current_channels: string | null;
  pain: string | null;
  goal: string | null;
  budget_range: string | null;
  timeline: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};
