# KLYSELZ Owner Admin

Owner/admin dashboard for `admin.klyselz.com`.

## Features
- Inbound CRM: `open → qualified`
- Kundenverwaltung
- Tickets
- Lead pipeline
- Neon schema and user creation scripts

## Local
```bash
cd ../..
npm ci
cp apps/owner-admin/.env.example apps/owner-admin/.env.local
npm --prefix apps/owner-admin run db:init
read -s KLYSELZ_INITIAL_PASSWORD
export KLYSELZ_INITIAL_PASSWORD
npm --prefix apps/owner-admin run user:create -- owner@example.com agency
unset KLYSELZ_INITIAL_PASSWORD
npm run dev:owner-admin
```

Disable an account:

```bash
npm --prefix apps/owner-admin run user:status -- owner@example.com disabled
```

## Vercel
- Root Directory: `apps/owner-admin`
- Domain: `admin.klyselz.com`
- Env vars: see `.env.example`
- Use same `DATABASE_URL` as `apps/site` uses in `CRM_DATABASE_URL`.
