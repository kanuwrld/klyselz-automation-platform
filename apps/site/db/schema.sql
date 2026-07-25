-- KLYSELZ site schema for Neon Postgres. Apply with npm run db:init.
CREATE TABLE IF NOT EXISTS contact_requests (
  id          SERIAL PRIMARY KEY,
  business    TEXT NOT NULL,
  contact     TEXT NOT NULL,
  message     TEXT,
  source      TEXT DEFAULT 'website',
  status      TEXT NOT NULL DEFAULT 'new'
              CHECK (status IN ('new','contacted','qualified','won','lost','spam')),
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE contact_requests ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'website';
ALTER TABLE contact_requests ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new';
ALTER TABLE contact_requests ADD COLUMN IF NOT EXISTS user_agent TEXT;
CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_requests (status);

-- Opt-in leads from the hero form or tracked organic content.
-- Flow: email → open → one-time brief link → qualified.
CREATE TABLE IF NOT EXISTS subscribers (
  id                    SERIAL PRIMARY KEY,
  email                 TEXT UNIQUE NOT NULL,
  source                TEXT DEFAULT 'hero',
  utm_source            TEXT,
  utm_medium            TEXT,
  utm_campaign          TEXT,
  referrer              TEXT,
  user_agent            TEXT,
  status                TEXT NOT NULL DEFAULT 'open'
                        CHECK (status IN ('open','contacted','qualified','won','lost','spam')),
  brief_token           TEXT UNIQUE,
  brief_sent_at         TIMESTAMPTZ,
  brief_completed_at    TIMESTAMPTZ,
  business_name         TEXT,
  business_niche        TEXT,
  business_scale        TEXT,
  business_goal         TEXT,
  phone                 TEXT,
  notes                 TEXT,
  unsubscribed          BOOLEAN NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Additive compatibility migration for earlier schema versions.
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'open';
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS brief_token TEXT;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS brief_sent_at TIMESTAMPTZ;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS brief_completed_at TIMESTAMPTZ;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS business_niche TEXT;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS business_scale TEXT;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS business_goal TEXT;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscribers_brief_token ON subscribers (brief_token) WHERE brief_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscribers_created ON subscribers (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscribers_source ON subscribers (source);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers (status);

-- Admin CRM table. Same schema should exist in admin.klyselz.com database.
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
