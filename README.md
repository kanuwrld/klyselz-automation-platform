# KLYSELZ Automation Platform

[![CI](https://github.com/kanuwrld/klyselz-automation-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/kanuwrld/klyselz-automation-platform/actions/workflows/ci.yml)

English-first portfolio monorepo for a DACH-focused lead intake and service-delivery platform. German product UI, English engineering documentation.

[Deutsche Übersicht](README.de.md) · [Project management](PROJECT_MANAGEMENT.md) · [Security](SECURITY.md)

## Product

KLYSELZ is a portfolio implementation of an **Anfragen-Autopilot**: a system for capturing enquiries, qualifying demand, booking work and keeping agency/client delivery visible.

This repository demonstrates:

- German marketing site and structured lead brief;
- owner CRM with leads, clients, projects, tasks, finance and tickets;
- client-scoped dashboard;
- operator-provisioned accounts with tenant and status validation;
- safe-by-default prospect research pipeline;
- CI, dependency auditing and public-repository secret checks;
- Vercel-ready monorepo deployment.

Status: portfolio beta and customer-discovery stage. It is not presented as a validated sales funnel or compliance-certified product.

## Architecture

| Workspace | Purpose | Vercel root |
| --- | --- | --- |
| `apps/site` | German landing page, brief flow and inbound CRM | `apps/site` |
| `apps/owner-admin` | Agency CRM and operations dashboard | `apps/owner-admin` |
| `apps/client-dashboard` | Tenant-scoped customer dashboard | `apps/client-dashboard` |
| `tools/prospect-pipeline` | Manual-input research, scoring and reviewed drafts | not deployed |

Shared stack: Next.js, React, TypeScript, Neon Postgres, Resend and Vercel.

## Security model

- Real `.env` files, contact lists, financial workbooks and internal contracts are ignored.
- CI scans every publishable file for forbidden data types and common secret patterns.
- Accounts have explicit `active` / `disabled` state and verified-email timestamp.
- Client accounts require a tenant; paused or churned tenants cannot open a session.
- Passwords are operator-provisioned, validated and hashed with bcrypt cost 12.
- Session JWTs expire after 12 hours and are revalidated against database state.
- GitHub Actions use read-only permissions and full commit SHA pins.

See [account validation](docs/ACCOUNT_VALIDATION.md), [access control](docs/ACCESS_CONTROL.md) and [CI/CD](docs/CICD.md).

## Local setup

Requirements: Node.js 22 and npm.

```bash
git clone https://github.com/kanuwrld/klyselz-automation-platform.git
cd klyselz-automation-platform
npm ci
npm run verify
```

Start one surface:

```bash
npm run dev:site
npm run dev:owner-admin
npm run dev:client-dashboard
```

Copy only required example variables:

```bash
cp apps/site/.env.example apps/site/.env.local
cp apps/owner-admin/.env.example apps/owner-admin/.env.local
cp apps/client-dashboard/.env.example apps/client-dashboard/.env.local
```

Never commit real values. Production secrets belong in Vercel environment settings.

## Account provisioning

Apply database schema first:

```bash
npm --prefix apps/owner-admin run db:init
```

Read password without placing it in shell history:

```bash
read -s KLYSELZ_INITIAL_PASSWORD
export KLYSELZ_INITIAL_PASSWORD
npm --prefix apps/owner-admin run user:create -- owner@example.com agency
unset KLYSELZ_INITIAL_PASSWORD
```

Client account:

```bash
read -s KLYSELZ_INITIAL_PASSWORD
export KLYSELZ_INITIAL_PASSWORD
npm --prefix apps/owner-admin run user:create -- owner@example.com client "Example GmbH"
unset KLYSELZ_INITIAL_PASSWORD
```

Immediate account revocation:

```bash
npm --prefix apps/owner-admin run user:status -- owner@example.com disabled
```

## Verification

```bash
npm run verify
npm run audit
```

`verify` runs public-repository safety checks, account-policy tests, TypeScript checks, all production builds and a fictional-data prospect dry-run.

## Deployment

Use one Vercel project per web workspace. Connect GitHub, set Root Directory from architecture table, protect production variables and deploy `main` to production. Pull requests receive preview deployments through Vercel Git integration.

Deployment details and rollback procedure: [docs/CICD.md](docs/CICD.md).

## Delivery and validation

- [Project operating model](PROJECT_MANAGEMENT.md)
- [Account validation](docs/ACCOUNT_VALIDATION.md)
- [Platform access reviews](docs/ACCESS_CONTROL.md)
- [Prospect validation](docs/PROSPECT_VALIDATION.md)
- [30-day go-to-market experiment](docs/GO_TO_MARKET.md)
- [Operations runbook](OPERATIONS.md)

## Legal boundary

This repository contains engineering controls and operating guidance, not legal advice. German outreach and data processing require case-specific review, especially § 7 UWG, GDPR lawful basis, transparency, objection handling and processor agreements.

## License

Public portfolio source. Copyright retained; see [LICENSE](LICENSE).
