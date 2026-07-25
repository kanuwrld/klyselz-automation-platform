# Project management

## Current objective

Validate one DACH service-business use case while keeping the portfolio technically credible, secure and deployable.

Current stage: **portfolio hardening + customer discovery**.

## Scope

In scope:

- lead capture and qualification;
- agency CRM and client delivery visibility;
- secure operator-provisioned accounts;
- Vercel deployments and automated quality gates;
- one measurable acquisition experiment.

Out of scope until validation:

- public self-service registration;
- autonomous outbound messaging;
- automated social-platform scraping;
- live payment processing;
- unsupported AI or conversion claims;
- multi-region enterprise compliance certification.

## Workstreams

| ID | Workstream | Outcome | Current state |
| --- | --- | --- | --- |
| W1 | Demand validation | Two paid pilots in one ICP | Not validated |
| W2 | Product | Demoable enquiry-to-delivery flow | In progress |
| W3 | Security | No secrets/PII in Git; revocable accounts | Baseline implemented |
| W4 | Platform | Green CI and reproducible Vercel deploy | In progress |
| W5 | Evidence | Case study with measured before/after data | Blocked by W1 |

## Delivery board

GitHub Projects columns:

1. `Inbox` — untriaged ideas and reports.
2. `Ready` — acceptance criteria and owner exist.
3. `In progress` — maximum three items total.
4. `Review` — CI green; security and product review pending.
5. `Done` — deployed or explicitly closed with evidence.

Recommended labels:

- `type:feature`, `type:bug`, `type:security`, `type:experiment`, `type:docs`;
- `area:site`, `area:admin`, `area:client`, `area:leadgen`, `area:platform`;
- `priority:p0`, `priority:p1`, `priority:p2`;
- `status:blocked`, `needs:decision`.

## Issue contract

Every delivery issue must contain:

- problem and user;
- expected result;
- acceptance criteria;
- data/security impact;
- test evidence;
- rollout and rollback note.

Experiments also require hypothesis, primary metric, stop condition and decision date.

## Definition of ready

- one clear user or operator problem;
- scope small enough for one pull request;
- dependencies and sensitive data identified;
- acceptance criteria observable;
- owner and target milestone assigned.

## Definition of done

- code and docs reviewed;
- `npm run verify` and production dependency audit pass;
- no secret or customer-data changes in Git;
- migration and rollback recorded when applicable;
- preview checked on desktop and mobile;
- production deployment checked when release is intended;
- outcome linked in issue.

## Release model

- `main` is releasable.
- Work uses short branches and pull requests.
- CI is mandatory before merge.
- Vercel creates previews for pull requests and production from `main`.
- Releases use semantic tags: patch for fixes, minor for compatible features, major for breaking data/API changes.
- Database changes are additive first; destructive cleanup requires separate reviewed release.

## Cadence

- Monday: choose one W1 experiment and up to two delivery items.
- Daily: update blocked items and next action.
- Friday: inspect funnel and delivery metrics; close or rewrite failed hypotheses.
- Monthly: access review, dependency review, recovery check and roadmap reset.

## Decision gates

| Gate | Required evidence | Decision |
| --- | --- | --- |
| G1 Problem | 10 relevant interviews with repeated pain | Keep or change ICP |
| G2 Offer | 5 demos and 2 paid pilots | Keep or change offer |
| G3 Delivery | Pilot works with manual fallback and audit trail | Productize |
| G4 Scale | Repeatable acquisition plus positive delivery margin | Add paid traffic |

No paid acquisition before G2. No autonomous outreach before legal and platform review.

## Risk register

| Risk | Severity | Control | Owner action |
| --- | --- | --- | --- |
| Secrets or PII reach public Git | Critical | ignore rules, CI scanner, GitHub scanning | Rotate exposed value; purge history |
| Disabled user keeps access | High | DB revalidation on server requests | Disable account; verify denial |
| Serverless rate limit resets | High | Current local limiter is only baseline | Add durable limiter before public launch |
| Invalid German outreach | High | consent-first channels and manual approval | Legal review before campaign |
| Tenant data leakage | Critical | `client_id` checks and scoped queries | Add cross-tenant integration tests |
| Placeholder legal text goes live | High | release checklist | Obtain German legal review |
| Offer lacks demand | High | paid-pilot gate | Stop building; interview market |

## Next milestone

`M1 — Public portfolio baseline`

- green GitHub CI;
- public repository contains no secrets or real contacts;
- production site deployment linked from repository;
- account lifecycle documented and tested;
- first 30-day acquisition experiment opened as issues.
