# KLYSELZ Site

German marketing site for `klyselz.com`.

## Features
- Landing page in German
- Showreel section from `public/media/showreel.mp4`
- Email capture → inbound CRM status `open`
- Resend one-time brief link
- Brief form → status `qualified`
- Legal pages and healthcheck

## Local
```bash
cd ../..
npm ci
cp apps/site/.env.example apps/site/.env.local
npm --prefix apps/site run db:init
npm run dev:site
```

## Vercel
- Root Directory: `apps/site`
- Domain: `klyselz.com`, `www.klyselz.com`
- Env vars: see `.env.example`
- `CRM_DATABASE_URL` should point to same Neon database as `apps/owner-admin`.
