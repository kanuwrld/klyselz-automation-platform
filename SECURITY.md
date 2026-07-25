# Security policy

## Supported version

Security fixes target `main`.

## Report privately

Do not open a public issue for a vulnerability or exposed credential. Use GitHub Private Vulnerability Reporting for this repository.

Include:

- affected surface and reproduction;
- security impact;
- whether customer data or credentials may be involved;
- suggested mitigation if known.

Do not include real secrets or personal data.

## Secret exposure response

1. Revoke or rotate exposed value immediately.
2. Disable affected integration/account.
3. Check provider and repository audit logs.
4. Remove value from current files and Git history where required.
5. assess notification duties with qualified legal/security support.
6. Add a regression check.

Gitignore is not protection for a secret already committed. Rotation remains mandatory.

## Baseline

- no public sign-up;
- bcrypt password hashes;
- short-lived, HTTP-only session cookie;
- database-backed account status validation;
- tenant-aware access checks;
- rate limiting baseline;
- CI secret/public-file scan;
- locked dependency install and production audit.

Known pre-production work is tracked in [account validation](docs/ACCOUNT_VALIDATION.md) and [project risk register](PROJECT_MANAGEMENT.md).
