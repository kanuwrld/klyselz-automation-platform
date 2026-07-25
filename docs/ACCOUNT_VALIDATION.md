# Account validation

## Boundary

Public self-registration is disabled. An operator provisions agency and client accounts after commercial/customer verification.

## Provisioning checks

Creation fails unless:

- email syntax is valid and normalized to lowercase;
- password has 15–128 characters and fits bcrypt's 72-byte input limit;
- common placeholder passwords are rejected;
- role is exactly `agency` or `client`;
- every client account has a 2–120 character tenant name;
- agency accounts have no client tenant;
- `DATABASE_URL` exists.

Passwords are accepted through `KLYSELZ_INITIAL_PASSWORD`, not a command-line argument. Hashing uses bcrypt cost 12.

## Database state

User record:

- `status`: `active` or `disabled`;
- `email_verified_at`: operator verification timestamp;
- `last_login_at`: successful-login audit timestamp;
- `updated_at`: lifecycle change timestamp;
- `client_id`: required by application policy for client role.

Client users can authenticate only when tenant state is `trial` or `active`.

## Session validation

1. Login input is validated before database access.
2. Unknown emails still execute a dummy bcrypt comparison to reduce timing disclosure.
3. Login returns one generic credential error for unknown, disabled, unverified or inactive-tenant accounts.
4. JWT uses an HTTP-only, `SameSite=Lax`, secure-in-production cookie.
5. JWT expires after 12 hours.
6. Server routes re-read user and tenant state. Disabling an account revokes effective access without waiting for JWT expiry.

Proxy checks protect navigation early. Server-side database validation remains the authorization source of truth.

## Operator commands

Create agency account:

```bash
read -s KLYSELZ_INITIAL_PASSWORD
export KLYSELZ_INITIAL_PASSWORD
npm --prefix apps/owner-admin run user:create -- owner@example.com agency
unset KLYSELZ_INITIAL_PASSWORD
```

Disable immediately:

```bash
npm --prefix apps/owner-admin run user:status -- owner@example.com disabled
```

Restore:

```bash
npm --prefix apps/owner-admin run user:status -- owner@example.com active
```

## Production backlog

Required before open customer onboarding:

- durable distributed login throttling;
- breached-password blocklist;
- MFA/passkeys for agency administrators;
- one-time invitation and forced initial password change;
- password reset with short-lived, single-use tokens;
- audit log for role, tenant and status changes;
- automated cross-tenant authorization tests.

Current baseline is suitable for a controlled portfolio/pilot, not broad self-service registration.
