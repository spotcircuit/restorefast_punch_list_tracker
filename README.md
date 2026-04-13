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

## HTTP API (`apps/web`, base URL e.g. `http://localhost:3000`)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/projects` | List projects (`_count.items`) |
| `POST` | `/api/projects` | Create project — body: `{ name, address, status? }` |
| `GET` | `/api/projects/[projectId]` | Project + punch items |
| `PATCH` | `/api/projects/[projectId]` | Partial update — `{ name?, address?, status? }` |
| `GET` | `/api/projects/[projectId]/punch-items` | List items for project |
| `POST` | `/api/projects/[projectId]/punch-items` | Create item — body: `{ location, description, priority?, assignedTo?, photo? }` (always starts `open`) |
| `GET` | `/api/punch-items/[itemId]` | Single item (+ project id/name) |
| `PATCH` | `/api/punch-items/[itemId]` | Partial update; `status` must follow `open` → `in_progress` → `complete` |

`photo` must be a valid `http(s)` URL when provided. Validation errors return **400** with `issues` (Zod flatten).

### Punch item status (MVP)

Server-enforced transitions only: **open → in_progress → complete**. You cannot skip a step or move backward via the API; **`complete`** is terminal (no reopen in MVP).

## Production (Vercel)

The web app is intended to run on **[Vercel](https://vercel.com)** with the Next.js app root at **`apps/web`** (monorepo: set the Vercel project **Root Directory** to `apps/web`, or equivalent in your setup).

1. **Environment variables** — In the Vercel project, add **`DATABASE_URL`** with your **Neon** connection string (pooled URL recommended; include `sslmode=require`).
2. **Migrations** — After the first deploy (or any schema change), apply migrations to the **production** database, for example from your machine:

   ```bash
   cd apps/web
   set DATABASE_URL=postgresql://...   # Windows; use export on Unix
   npx prisma migrate deploy
   ```

3. **Live URL** — Replace with your deployment URL when you share the project:

   **`https://YOUR_PROJECT.vercel.app`**

Build command is effectively **`prisma generate`** (via `postinstall` / `build` in `apps/web`) plus **`next build`**.

## UI / UX (app)

- **Add project** and **Add punch item** open in **modals** (Escape, overlay click, or **Close** to dismiss).
- **Priority** is shown with **color cues**: low (slate), normal (amber), high (red) — on cards, dashboard “By priority”, and a small legend when editing priority.
- **Jobsite address** on new projects is labeled for the **physical job location**, not a user’s home address.

## Phases

- **Phase 1** — Monorepo + Next.js (`apps/web`).
- **Phase 2** — Neon + Prisma (schema, initial migration `20260413140000_init`, seed).
- **Phase 3** — Punch-item status workflow, priorities, Zod (`lib/domain`, `lib/validation`).
- **Phase 4** — REST-style Route Handlers under `app/api/**`.
- **Phase 5** — App UI: `/projects`, `/projects/[projectId]`.
- **Phase 6** — Dashboard metrics (`lib/dashboard`).
- **Phase 7** — Deploy on Vercel + this README handoff (**you’ve deployed**; keep **`DATABASE_URL`** and **migrate deploy** in sync).

### App routes (UI)

| Path | Description |
|------|-------------|
| `/` | Redirects to `/projects` |
| `/projects` | Project list (completion % per project); **+ Add project** opens modal |
| `/projects/[id]` | Dashboard, **+ Add punch item** modal, item cards with edit + workflow actions |

## How I’d enhance (post-MVP)

- **Auth** — sign-in, organizations, roles (GC, subs, owner read-only).
- **Real assignees** — `User` model, @mentions, email/push when items move or are due.
- **Photos** — uploads (e.g. Vercel Blob), thumbnails, not URL-only.
- **Field mode** — responsive/offline-first views; optional QR linking to a location on site.
- **Exports** — PDF punch list and CSV for job closeout.
- **Audit trail** — who changed status and when; threaded **comments** on items.
