# KLYSELZ — end-to-end runbook

## 1. Local verification

```bash
npm run verify
npm run audit
```

`verify` checks dashboard typecheck/build, site typecheck/build, and leadgen dry-run. `audit` checks production dependencies in all three apps.

## 2. Dashboard deploy checklist

Required environment variables per dashboard deploy:

- `DATABASE_URL`
- `AUTH_SECRET`
- `LEADS_WEBHOOK_SECRET`
- `NEXT_PUBLIC_CLIENT_NAME`

Initialize database:

```bash
cd apps/owner-admin
npm run db:init
read -s KLYSELZ_INITIAL_PASSWORD
export KLYSELZ_INITIAL_PASSWORD
npm run user:create -- owner@example.com agency
unset KLYSELZ_INITIAL_PASSWORD
```

Optional local demo seed:

```bash
npm run db:init -- --with-demo
```

Webhook contract:

```bash
curl -X POST https://dashboard.example.com/api/leads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LEADS_WEBHOOK_SECRET" \
  -d '{"name":"Anna","contact":"@anna","channel":"Instagram","message":"Termin frei?","status":"new","source":"instagram"}'
```

Healthcheck:

```bash
curl https://dashboard.example.com/api/health
```

## 3. Site deploy checklist

Required before ads or outreach:

- Fill real `app/impressum/page.tsx`.
- Fill real `app/datenschutz/page.tsx`.
- Add `DATABASE_URL` if form submissions should persist.
- Run `npm run db:init` when `DATABASE_URL` exists.

Healthcheck:

```bash
curl https://klyselz.com/api/health
```

## 4. Leadgen workflow

Safe preview:

```bash
cd tools/prospect-pipeline
npm run dry-run
```

Sync approved prospects into Neon:

```bash
npm run sync
```

Manual review stays required before outreach. No mass Instagram DM. No cold email blasts in Germany without legal review.

## 5. Production rule

No client deployment should ship with placeholder legal pages, missing `AUTH_SECRET`, missing `LEADS_WEBHOOK_SECRET`, or unverified `npm run verify`.

## 6. Account lifecycle

Disable access immediately:

```bash
npm --prefix apps/owner-admin run user:status -- owner@example.com disabled
```

Server requests revalidate user and tenant state against Neon. Review GitHub, Vercel, Neon and provider accounts monthly using `docs/ACCESS_CONTROL.md`.

## 7. Incident response

For suspected secret exposure:

1. revoke/rotate first;
2. disable affected account or integration;
3. inspect provider and GitHub logs;
4. clean repository/history if required;
5. document scope and add regression control.
