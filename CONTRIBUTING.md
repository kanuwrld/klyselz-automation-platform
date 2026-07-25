# Contributing

## Workflow

1. Open or select an issue with acceptance criteria.
2. Create a short-lived branch.
3. Keep change scoped.
4. Run `npm run verify` and `npm run audit`.
5. Open a pull request and complete checklist.

## Data rule

Never commit:

- real `.env` files or tokens;
- customer/prospect contact lists;
- financial exports, contracts or internal operating files;
- database snapshots;
- screenshots containing private data.

Use `example.com`, fictional companies and synthetic data in tests/docs.

## Code rule

- product UI: German;
- engineering docs and code comments: English;
- validate authorization on server;
- make database migrations additive;
- document rollout and rollback;
- add regression test for security-sensitive changes.
