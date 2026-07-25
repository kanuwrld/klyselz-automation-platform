# CI/CD

## Continuous integration

GitHub Actions runs on every pull request and push to `main`.

Pipeline:

1. Checkout through a full commit SHA pin.
2. Install Node.js 22 and locked dependencies with `npm ci`.
3. Scan every publishable file for forbidden data and common secret patterns.
4. Run account-policy tests.
5. Run TypeScript checks.
6. Build all three Next.js applications.
7. Run leadgen against fictional sample data.
8. Fail on high/critical production dependency findings.

Workflow has read-only repository permission, concurrency cancellation and a 20-minute timeout.

## Continuous deployment

Recommended CD uses Vercel Git integration, not a long-lived Vercel token inside workflow YAML.

Use three Vercel projects from one repository:

| Project | Root Directory | Production branch | Current release state |
| --- | --- | --- | --- |
| KLYSELZ Site | `apps/site` | `main` | Public portfolio deployed |
| KLYSELZ Owner Admin | `apps/owner-admin` | `main` | Git-connected; production protected by application authentication |
| KLYSELZ Client Dashboard | `apps/client-dashboard` | `main` | Production data connection blocked by tenant-isolation gate |

Pull requests produce previews. `main` produces production deployments only after CI passes and branch protection allows merge.

Root `.vercelignore` prevents local CLI deployments from uploading ignored
private folders, local environment files or customer/prospect exports. Git-based
deployments remain preferred because their source is the reviewed public commit.

## Environments

- Preview uses test database/keys and no real customer data.
- Production uses dedicated protected variables.
- `NEXT_PUBLIC_*` values are public by design. Never put secrets in them.
- Database, auth, webhook, Resend and Telegram values remain server-side.
- Vercel Standard Protection guards preview and generated deployment URLs.
  Production domains use application authentication; protecting every
  production URL through Vercel requires an eligible paid protection plan.
- Client Dashboard production data stays disconnected until application access
  checks and tenant boundaries pass their release gates.

## Release gate

Before production:

- CI green;
- migration reviewed and applied;
- legal pages contain approved operator data;
- desktop and mobile preview checked;
- login, logout, disabled account, tenant boundary and health endpoint checked;
- rollback owner named.

Client Dashboard production database access remains blocked until
[cross-tenant integration tests](https://github.com/kanuwrld/klyselz-automation-platform/issues/2)
pass against two isolated tenants.

## Rollback

1. Use Vercel Instant Rollback to restore last known-good deployment.
2. Disable affected account/integration if security related.
3. Revert code in a pull request.
4. For database changes, use forward repair. Never assume destructive rollback is safe.
5. Record incident and add regression test.

## Repository controls

Enable:

- branch protection/ruleset for `main`;
- required CI check;
- secret scanning and push protection;
- Dependabot security updates;
- private vulnerability reporting;
- CodeQL default setup where available.
