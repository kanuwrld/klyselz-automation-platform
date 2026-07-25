-- Dashboard schema for Neon Postgres.
-- Apply with npm run db:init or review/run in Neon SQL Editor.

CREATE TABLE IF NOT EXISTS leads (
  id          SERIAL PRIMARY KEY,
  name        TEXT,
  contact     TEXT,
  channel     TEXT,                  -- Instagram / WhatsApp / website / phone
  message     TEXT,
  source      TEXT,                  -- website / whatsapp / instagram / n8n / make
  external_id TEXT,                  -- optional upstream-system id
  status      TEXT NOT NULL DEFAULT 'new'
              CHECK (status IN ('new','qualified','booked','lost')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE leads ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS external_id TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE leads ADD COLUMN IF NOT EXISTS client_id INTEGER;

CREATE TABLE IF NOT EXISTS bookings (
  id            SERIAL PRIMARY KEY,
  lead_id       INTEGER REFERENCES leads(id) ON DELETE SET NULL,
  customer_name TEXT,
  service       TEXT,
  slot_at       TIMESTAMPTZ NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','confirmed','done','no_show')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_created ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_external_id ON leads (external_id) WHERE external_id IS NOT NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS client_id INTEGER;
CREATE INDEX IF NOT EXISTS idx_bookings_slot ON bookings (slot_at ASC);
CREATE INDEX IF NOT EXISTS idx_leads_client ON leads (client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_client ON bookings (client_id);

CREATE TABLE IF NOT EXISTS lead_events (
  id          SERIAL PRIMARY KEY,
  lead_id     INTEGER REFERENCES leads(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  payload     JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_lead_events_lead ON lead_events (lead_id, created_at DESC);

-- Manually researched prospects from tools/prospect-pipeline.
CREATE TABLE IF NOT EXISTS prospects (
  id           SERIAL PRIMARY KEY,
  salon        TEXT NOT NULL,
  city         TEXT,
  channel      TEXT,                 -- Instagram / Email
  contact      TEXT,                 -- handle or email
  website      TEXT,
  observation  TEXT,                 -- public operational observation
  score        INTEGER DEFAULT 0,    -- prioritization only, 0..100
  draft        TEXT,                 -- German draft requiring human review
  notes        TEXT,
  follow_up_at TIMESTAMPTZ,
  status       TEXT NOT NULL DEFAULT 'new'
               CHECK (status IN ('new','review','contacted','replied','won','skip')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (salon, city)
);
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS follow_up_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_prospects_score ON prospects (score DESC);
CREATE INDEX IF NOT EXISTS idx_prospects_status ON prospects (status);

-- Accounts and tenant records.
CREATE TABLE IF NOT EXISTS clients (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE,
  plan          TEXT,
  monthly_fee   INTEGER DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('lead','trial','active','paused','churned')),
  dashboard_url TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS monthly_fee INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS users (
  id                SERIAL PRIMARY KEY,
  email             TEXT UNIQUE NOT NULL,
  password_hash     TEXT NOT NULL,
  role              TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('agency','client')),
  client_id         INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  status            TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled')),
  email_verified_at TIMESTAMPTZ,
  last_login_at     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('active','disabled'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
-- Existing users were manually provisioned by the operator, so migration marks
-- them verified. New public sign-up remains intentionally disabled.
UPDATE users SET email_verified_at = COALESCE(email_verified_at, created_at);
CREATE INDEX IF NOT EXISTS idx_users_status ON users (status);

-- Ticket system shared between client and agency roles.
CREATE TABLE IF NOT EXISTS tickets (
  id          SERIAL PRIMARY KEY,
  client_id   INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  created_by  INTEGER REFERENCES users(id) ON DELETE SET NULL,
  subject     TEXT NOT NULL,
  priority    TEXT NOT NULL DEFAULT 'normal'
              CHECK (priority IN ('low','normal','high','urgent')),
  status      TEXT NOT NULL DEFAULT 'open'
              CHECK (status IN ('open','in_progress','waiting_client','closed')),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tickets_client ON tickets (client_id, last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets (status);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id           SERIAL PRIMARY KEY,
  ticket_id    INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  author_role  TEXT NOT NULL CHECK (author_role IN ('agency','client')),
  body         TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages (ticket_id, created_at ASC);

-- Inbound CRM flow: email → open → one-time brief link → qualified.
CREATE TABLE IF NOT EXISTS inbound_leads (
  id                     SERIAL PRIMARY KEY,
  email                  TEXT UNIQUE NOT NULL,
  business               TEXT,
  contact_name           TEXT,
  message                TEXT,
  source                 TEXT DEFAULT 'website',
  utm_source             TEXT,
  utm_medium             TEXT,
  utm_campaign           TEXT,
  referrer               TEXT,
  user_agent             TEXT,
  status                 TEXT NOT NULL DEFAULT 'open'
                         CHECK (status IN ('open','qualified','won','lost','spam')),
  brief_token_hash       TEXT UNIQUE,
  brief_sent_at          TIMESTAMPTZ,
  brief_token_expires_at TIMESTAMPTZ,
  brief_token_used_at    TIMESTAMPTZ,
  brief_completed_at     TIMESTAMPTZ,
  website                TEXT,
  phone                  TEXT,
  city                   TEXT,
  niche                  TEXT,
  team_size              TEXT,
  current_channels       TEXT,
  pain                   TEXT,
  goal                   TEXT,
  budget_range           TEXT,
  timeline               TEXT,
  notes                  TEXT,
  brief_answers          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE inbound_leads ADD COLUMN IF NOT EXISTS business TEXT;
ALTER TABLE inbound_leads ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE inbound_leads ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE inbound_leads ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'website';
ALTER TABLE inbound_leads ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE inbound_leads ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE inbound_leads ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
ALTER TABLE inbound_leads ADD COLUMN IF NOT EXISTS referrer TEXT;
ALTER TABLE inbound_leads ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE inbound_leads ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'open';
ALTER TABLE inbound_leads ADD COLUMN IF NOT EXISTS brief_token_hash TEXT;
ALTER TABLE inbound_leads ADD COLUMN IF NOT EXISTS brief_sent_at TIMESTAMPTZ;
ALTER TABLE inbound_leads ADD COLUMN IF NOT EXISTS brief_token_expires_at TIMESTAMPTZ;
ALTER TABLE inbound_leads ADD COLUMN IF NOT EXISTS brief_token_used_at TIMESTAMPTZ;
ALTER TABLE inbound_leads ADD COLUMN IF NOT EXISTS brief_completed_at TIMESTAMPTZ;
ALTER TABLE inbound_leads ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE inbound_leads ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE inbound_leads ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE inbound_leads ADD COLUMN IF NOT EXISTS niche TEXT;
ALTER TABLE inbound_leads ADD COLUMN IF NOT EXISTS team_size TEXT;
ALTER TABLE inbound_leads ADD COLUMN IF NOT EXISTS current_channels TEXT;
ALTER TABLE inbound_leads ADD COLUMN IF NOT EXISTS pain TEXT;
ALTER TABLE inbound_leads ADD COLUMN IF NOT EXISTS goal TEXT;
ALTER TABLE inbound_leads ADD COLUMN IF NOT EXISTS budget_range TEXT;
ALTER TABLE inbound_leads ADD COLUMN IF NOT EXISTS timeline TEXT;
ALTER TABLE inbound_leads ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE inbound_leads ADD COLUMN IF NOT EXISTS brief_answers JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE inbound_leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
CREATE UNIQUE INDEX IF NOT EXISTS idx_inbound_leads_token_hash ON inbound_leads (brief_token_hash) WHERE brief_token_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inbound_leads_status ON inbound_leads (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inbound_leads_created ON inbound_leads (created_at DESC);

-- Agency delivery: projects, shared tasks and simple finance tracking.
CREATE TABLE IF NOT EXISTS agency_projects (
  id             SERIAL PRIMARY KEY,
  client_id      INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  service        TEXT,
  status         TEXT NOT NULL DEFAULT 'planned'
                 CHECK (status IN ('planned','in_progress','client_review','live','paused','completed')),
  progress       INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  one_time_value INTEGER NOT NULL DEFAULT 0,
  monthly_value  INTEGER NOT NULL DEFAULT 0,
  next_step      TEXT,
  started_at     DATE,
  target_at      DATE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_agency_projects_client ON agency_projects (client_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_agency_projects_status ON agency_projects (status, target_at ASC);

CREATE TABLE IF NOT EXISTS agency_tasks (
  id          SERIAL PRIMARY KEY,
  project_id  INTEGER REFERENCES agency_projects(id) ON DELETE CASCADE,
  client_id   INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'todo'
              CHECK (status IN ('todo','in_progress','blocked','done')),
  priority    TEXT NOT NULL DEFAULT 'normal'
              CHECK (priority IN ('low','normal','high','urgent')),
  owner_role  TEXT NOT NULL DEFAULT 'agency'
              CHECK (owner_role IN ('agency','client')),
  due_at      DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_agency_tasks_client ON agency_tasks (client_id, status, due_at ASC);
CREATE INDEX IF NOT EXISTS idx_agency_tasks_project ON agency_tasks (project_id, status);

CREATE TABLE IF NOT EXISTS financial_entries (
  id           SERIAL PRIMARY KEY,
  client_id    INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  project_id   INTEGER REFERENCES agency_projects(id) ON DELETE SET NULL,
  type         TEXT NOT NULL CHECK (type IN ('revenue','expense')),
  category     TEXT NOT NULL DEFAULT 'other'
               CHECK (category IN ('setup','retainer','tool','contractor','other')),
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  recurring    BOOLEAN NOT NULL DEFAULT false,
  occurred_on  DATE NOT NULL DEFAULT CURRENT_DATE,
  note         TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_financial_entries_date ON financial_entries (occurred_on DESC);
CREATE INDEX IF NOT EXISTS idx_financial_entries_client ON financial_entries (client_id, occurred_on DESC);
