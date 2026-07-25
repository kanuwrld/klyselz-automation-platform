# Platform access control

Applies to GitHub, Vercel, Neon, Resend, domain/DNS, Meta and automation providers.

## Account validation checklist

Before granting access:

- named individual account; no shared login;
- verified work email and recovery channel;
- phishing-resistant MFA or passkey enabled where supported;
- role matches job need;
- production access separately approved;
- recovery codes stored in password manager, not repository;
- owner and expiry/review date recorded.

## Roles

| Role | GitHub | Vercel | Neon | Communication providers |
| --- | --- | --- | --- | --- |
| Owner | Admin | Owner | Admin | Admin |
| Developer | Write | Developer | Branch/dev only | None by default |
| Operator | Read/issues | Viewer | Read-only where needed | Campaign/operator |
| Contractor | Time-limited least privilege | Preview only | Isolated dev branch | None |

## Secrets

- local development: ignored `.env.local`;
- production: Vercel encrypted environment variables;
- CI: GitHub environment secrets only when unavoidable;
- prefer OIDC/short-lived credentials over stored cloud tokens;
- never paste secrets into issues, logs, screenshots or support chats.

Every secret needs owner, purpose, environment and rotation trigger.

## Review and offboarding

Monthly:

- compare active users with current collaborators;
- remove stale sessions and unused tokens;
- confirm MFA;
- inspect GitHub/Vercel/Neon audit events;
- rotate any secret copied outside approved storage.

Offboarding:

1. Disable product and provider accounts.
2. Revoke sessions, PATs, deploy hooks and API keys.
3. Transfer ownership of projects and domains.
4. Rotate shared secrets.
5. Record completion without storing sensitive values.
