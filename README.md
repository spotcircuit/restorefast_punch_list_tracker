# Punch list tracker

TypeScript monorepo for the construction punch-list MVP ([requirements](apps/punch-list-tracker/requirements.md), [implementation plan](apps/punch-list-tracker/specs/mvp-implementation.md)).

## Structure

| Path | Purpose |
|------|--------|
| `apps/web` | Next.js (App Router) application |
| `apps/punch-list-tracker` | Rebar: `requirements.md`, `expertise.yaml`, `specs/` |

## Prerequisites

- Node.js **20+**
- npm **9+** (workspaces)

## Commands (repo root)

```bash
npm install
npm run dev      # Next.js dev server → http://localhost:3000
npm run build
npm run lint
npm run typecheck
```

### Database (Neon + Prisma)

1. Create a project in [Neon](https://neon.tech) and copy the **pooled** `DATABASE_URL` (with `sslmode=require`).
2. In `apps/web`, copy the env template and paste your URL:

   ```bash
   cp apps/web/.env.example apps/web/.env
   ```

3. Apply migrations and (optionally) seed demo data:

   ```bash
   npm run db:migrate   # prisma migrate dev — creates/applies migrations locally
   npm run db:seed      # optional demo project + punch items
   ```

   Production / CI: `npm run db:deploy` runs `prisma migrate deploy` (no prompts).

Prisma schema: `apps/web/prisma/schema.prisma`. Client helper: `apps/web/lib/prisma.ts`.

**Note:** Prisma is pinned to **v6** so `DATABASE_URL` stays in `schema.prisma` (Prisma 7 moves connection config).

## Phases

- **Phase 1** — Monorepo + Next.js (`apps/web`).
- **Phase 2** — Neon + Prisma (schema, initial migration `20260413140000_init`, seed). **Phase 3** (workflow / Zod) is next.
