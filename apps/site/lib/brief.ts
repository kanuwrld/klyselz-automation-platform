import crypto from "node:crypto";
import { crmSql, hasCrmDb } from "@/lib/db";

export type InboundLeadStatus = "open" | "qualified" | "won" | "lost" | "spam";

export type InboundLead = {
  id: number;
  email: string;
  business: string | null;
  contact_name: string | null;
  status: InboundLeadStatus;
  brief_token_expires_at: string | null;
  brief_token_used_at: string | null;
};

export type BriefPayload = {
  contactName: string | null;
  businessName: string;
  website: string | null;
  phone: string | null;
  city: string | null;
  niche: string;
  teamSize: string | null;
  currentChannels: string | null;
  pain: string;
  goal: string;
  budgetRange: string | null;
  timeline: string | null;
  notes: string | null;
};

function tokenHash(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createBriefToken() {
  const token = crypto.randomBytes(32).toString("base64url");
  return { token, hash: tokenHash(token) };
}

export async function createInboundLead(input: {
  email: string;
  business?: string | null;
  contactName?: string | null;
  message?: string | null;
  source: string;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  referrer?: string | null;
  userAgent?: string | null;
}) {
  const { token, hash } = createBriefToken();
  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  if (!hasCrmDb) {
    throw new Error("CRM database not configured");
  }

  const existing = (await crmSql`
    SELECT id, status FROM inbound_leads WHERE email = ${input.email} LIMIT 1`) as Array<{ id: number; status: InboundLeadStatus }>;

  if (existing[0]?.status === "qualified") {
    return { id: existing[0].id, email: input.email, token: null, status: "qualified" as const };
  }

  const rows = (await crmSql`
    INSERT INTO inbound_leads (
      email, business, contact_name, message, source, utm_source, utm_medium, utm_campaign,
      referrer, user_agent, status, brief_token_hash, brief_sent_at, brief_token_expires_at
    )
    VALUES (
      ${input.email}, ${input.business ?? null}, ${input.contactName ?? null}, ${input.message ?? null},
      ${input.source}, ${input.utmSource ?? null}, ${input.utmMedium ?? null}, ${input.utmCampaign ?? null},
      ${input.referrer ?? null}, ${input.userAgent ?? null}, 'open', ${hash}, now(), ${expiresAt}
    )
    ON CONFLICT (email) DO UPDATE SET
      business = COALESCE(EXCLUDED.business, inbound_leads.business),
      contact_name = COALESCE(EXCLUDED.contact_name, inbound_leads.contact_name),
      message = COALESCE(EXCLUDED.message, inbound_leads.message),
      source = EXCLUDED.source,
      utm_source = COALESCE(EXCLUDED.utm_source, inbound_leads.utm_source),
      utm_medium = COALESCE(EXCLUDED.utm_medium, inbound_leads.utm_medium),
      utm_campaign = COALESCE(EXCLUDED.utm_campaign, inbound_leads.utm_campaign),
      referrer = COALESCE(EXCLUDED.referrer, inbound_leads.referrer),
      user_agent = COALESCE(EXCLUDED.user_agent, inbound_leads.user_agent),
      status = 'open',
      brief_token_hash = EXCLUDED.brief_token_hash,
      brief_sent_at = now(),
      brief_token_expires_at = EXCLUDED.brief_token_expires_at,
      brief_token_used_at = NULL,
      updated_at = now()
    RETURNING id, status`) as Array<{ id: number; status: InboundLeadStatus }>;

  return { id: rows[0].id, email: input.email, token, status: rows[0].status };
}

export async function getInboundLeadByToken(token: string): Promise<InboundLead | null> {
  if (!hasCrmDb) return null;
  const rows = (await crmSql`
    SELECT id, email, business, contact_name, status, brief_token_expires_at, brief_token_used_at
    FROM inbound_leads
    WHERE brief_token_hash = ${tokenHash(token)}
      AND brief_token_used_at IS NULL
      AND (brief_token_expires_at IS NULL OR brief_token_expires_at > now())
    LIMIT 1`) as InboundLead[];
  return rows[0] ?? null;
}

export async function completeBrief(token: string, payload: BriefPayload) {
  if (!hasCrmDb) throw new Error("CRM database not configured");
  const rows = (await crmSql`
    UPDATE inbound_leads SET
      status = 'qualified',
      contact_name = COALESCE(${payload.contactName}, contact_name),
      business = ${payload.businessName},
      website = ${payload.website},
      phone = ${payload.phone},
      city = ${payload.city},
      niche = ${payload.niche},
      team_size = ${payload.teamSize},
      current_channels = ${payload.currentChannels},
      pain = ${payload.pain},
      goal = ${payload.goal},
      budget_range = ${payload.budgetRange},
      timeline = ${payload.timeline},
      notes = ${payload.notes},
      brief_answers = ${JSON.stringify(payload)}::jsonb,
      brief_completed_at = now(),
      brief_token_used_at = now(),
      updated_at = now()
    WHERE brief_token_hash = ${tokenHash(token)}
      AND brief_token_used_at IS NULL
      AND (brief_token_expires_at IS NULL OR brief_token_expires_at > now())
    RETURNING id, email, status`) as Array<{ id: number; email: string; status: InboundLeadStatus }>;
  return rows[0] ?? null;
}
