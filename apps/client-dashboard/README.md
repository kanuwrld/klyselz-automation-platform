# KLYSELZ Client Dashboard

Separate deployable dashboard for one business client.

## Features
- Anfragen
- Termine
- Kundentickets
- Client-scoped data via `client_id`

## Local
```bash
cd ../..
npm ci
cp apps/client-dashboard/.env.example apps/client-dashboard/.env.local
npm --prefix apps/client-dashboard run db:init
read -s KLYSELZ_INITIAL_PASSWORD
export KLYSELZ_INITIAL_PASSWORD
npm --prefix apps/client-dashboard run user:create -- owner@example.com client "Example GmbH"
unset KLYSELZ_INITIAL_PASSWORD
npm run dev:client-dashboard
```

## Vercel
- Root Directory: `apps/client-dashboard`
- Domain: client subdomain, e.g. `salonname.klyselz.com`
- Env vars: see `.env.example`
- Use client-specific Neon project/branch, or shared DB with correct `client_id`.
