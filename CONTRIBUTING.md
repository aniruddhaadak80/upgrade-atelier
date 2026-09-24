# Contributing to Upgrade Atelier

Thanks for helping make dependency decisions easier to read.

## Local setup

```bash
npm ci
npm run dev
```

The app starts with an in-memory adapter and seeded records. Set `DATABASE_URL` to a Neon Postgres connection string when you need durable local data.

## Before opening a pull request

- Run `npm run lint` and `npm run build`.
- Keep the core flow usable without API keys or a model provider.
- Add or update tests for deterministic scoring, canonical JSON, or seal-chain changes.
- Keep external data source labels visible when a fallback is used.
- Do not commit `.env*` files, connection strings, tokens, or generated Vercel metadata.
- Explain the user-visible outcome in the pull request description, not only the implementation detail.

## Scope

Small, reviewable changes are preferred. If a proposal adds an external service, first document the failure mode and the offline behavior.
