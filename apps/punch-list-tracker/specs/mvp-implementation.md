# Mvp Implementation

Created: 2026-04-13
Project: punch-list-tracker

## Requirements

Punch list tracker for construction (take-home).

Stack: TypeScript monorepo, Next.js on Vercel, Neon Postgres if DB needed (yes — relational schema given). Use Prisma with models below.

Prisma schema:
- Project: id uuid, name, address, status default "active", createdAt, items PunchItem[]
- PunchItem: id uuid, projectId, location, description, status default "open" (values: open, in_progress, complete), priority default "normal", assignedTo optional string, photo optional string URL, createdAt

Functional requirements:
1. Create/manage projects.
2. Add punch items: location, description, priority, photo.
3. Assign to workers (assignedTo); status workflow open → in_progress → complete. Spec hints at hidden workflow constraints — enforce valid transitions server-side.
4. Dashboard: completion percentage; breakdown by location, priority, assignee.
5. Deploy live with a public clickable URL.

Also: document how you would enhance the product after MVP.

Non-functional: enforce status machine; assignedTo is free text not User FK; photo needs URL or upload strategy; normalize priority values for consistent dashboards.

## Project context (Rebar)

**Live file:** `apps/punch-list-tracker/expertise.yaml` — use `rebar_read_file` on that path for current architecture, decisions, and patterns. A full YAML snapshot is **not** embedded here so this spec cannot drift from expertise.

## Requirements consistency (`requirements.md`)

Cross-check after `rebar_read_file` on `apps/punch-list-tracker/requirements.md` (authoritative brief).

| Requirement doc | Covered in this spec |
|-----------------|----------------------|
| **Stack:** TS monorepo, Next.js, Vercel, Neon if DB needed | Phase 1–2; Prisma models match given schema |
| **Project model:** `id`, `name`, `address`, `status` default active, `createdAt`, `items[]` | Prisma schema summary; Phase 4–5 (create project includes **name + address**) |
| **PunchItem model:** relation, `location`, `description`, `status` default open (`open` / `in_progress` / `complete`), `priority` default normal, `assignedTo?`, `photo?`, `createdAt` | Prisma summary; Phases 3–5; **only these three statuses** for MVP (no extra states unless brief changes) |
| **R1** Create projects | Phase 1–2, 4–5; Success **R1** |
| **R2** Items: location, description, priority, photo | Phase 4–5; Success **R2** |
| **R3** Assign workers; status **open → in_progress → complete** | Phase 3–5; Success **R3**; “hidden workflow” = enforce transitions server-side (Phase 3) |
| **R4** Dashboard: **%** complete; breakdown by **location / priority / assignee** | Phase 6; Success **R4** |
| **R5** Deploy live; **clickable URL** | Phase 7; Success **R5** |
| **Narrative:** build, deploy, **how you’d enhance** | Phase 7 README + Success **Spec** |

**Explicit non-contradictions:** The brief allows only **`complete`** (not “closed”). Optional priority set in Phase 3 must include **`normal`** to match schema default. Photo is a **string URL** in schema; URL field vs upload is an implementation choice, not a change to the model.

## Implementation Plan

**Source brief:** `apps/punch-list-tracker/requirements.md`

### Phase 1 — Monorepo and Next.js shell

**Status: complete.** Used **npm** workspaces (`pnpm` not available in this environment).

- [x] **TypeScript monorepo** — root `package.json` with `workspaces: ["apps/web"]`; root `.gitignore` for `node_modules` / `.next`.
- [x] **`apps/web`** — **Next.js** 16 (App Router), **strict** `tsconfig`, **ESLint** (`eslint-config-next`). Turborepo not added (optional per plan).
- [x] Root scripts: `dev`, `build`, `start`, `lint`, `typecheck` → workspace `web`.

### Phase 2 — Neon + Prisma

**Status: complete** (you still create the Neon project and run `db:migrate` / `db:seed` with your `DATABASE_URL`.)

- [x] **Prisma v6** in `apps/web` (`@prisma/client`, `prisma`) — v7 avoided so `DATABASE_URL` remains in `schema.prisma`.
- [x] **`prisma/schema.prisma`** — `Project` and `PunchItem` per `requirements.md` (defaults, relation, `onDelete: Cascade`, index on `projectId`).
- [x] **Initial migration** — `prisma/migrations/20260413140000_init/migration.sql`.
- [x] **`lib/prisma.ts`** — singleton `PrismaClient` for Next.js dev hot reload.
- [x] **`.env.example`** — Neon-style `DATABASE_URL` placeholder.
- [x] **Seed** — `prisma/seed.ts` (demo project + two items); `npm run db:seed`.
- [x] **Scripts** — `postinstall` / `build` run `prisma generate`; root + `web`: `db:migrate`, `db:deploy`, `db:studio`, `db:seed`.

### Phase 3 — Workflow and validation

**Status: complete.**

- [x] **Punch item statuses** — `open` | `in_progress` | `complete` in `lib/domain/punch-item-status.ts` (`PUNCH_ITEM_STATUSES`, `allowedNextStatuses`, `assertValidStatusTransition`, `InvalidStatusTransitionError`). MVP: linear transitions only; `complete` is terminal (no reopen).
- [x] **Priorities** — `low` | `normal` | `high` in `lib/domain/priority.ts` (matches dashboard normalization; DB default remains `normal`).
- [x] **Project status** — `active` | `archived` in `lib/domain/project-status.ts` for validation (schema still string).
- [x] **Zod** — `lib/validation/project.ts` (`createProjectSchema`, `updateProjectSchema`); `lib/validation/punch-item.ts` (`createPunchItemSchema`, `updatePunchItemSchema`, `parseUpdatePunchItem` applies workflow when `status` is updated). Dependency: `zod`.
- [x] **Create punch items** — always start **open** (status not accepted on create).

### Phase 4 — Data layer and API surface

**Status: complete** — App Router **Route Handlers** (JSON), Prisma, Phase 3 Zod + `parseUpdatePunchItem` for status.

- [x] **Projects** — `GET/POST /api/projects`; `GET/PATCH /api/projects/[projectId]` (read includes items; PATCH supports `status: archived` via `updateProjectSchema`).
- [x] **Punch items** — `GET/POST /api/projects/[projectId]/punch-items`; `GET/PATCH /api/punch-items/[itemId]`. Create always `open`; updates use workflow rules on `status`.
- [x] **Photo MVP** — `photo` is optional **http(s) URL** string in JSON (same as Phase 3 validation). No blob upload in this phase.
- [x] **Errors** — `lib/api/handle-route-error.ts` maps `ZodError` → 400, Prisma `P2025` / `P2003` → 404 / 400.

### Phase 5 — UI

**Status: complete.**

- [x] **`/` → `/projects`** — home redirects to project list.
- [x] **`/projects`** — list all projects (link to detail + item counts); **create project** form (name, address) via `POST /api/projects` + `router.refresh()`.
- [x] **`/projects/[projectId]`** — project header; **add punch item** (location, description, priority, assignee, photo URL); list of **punch item cards** with **Edit** (PATCH fields) and **legal next-step** actions (**Start work** / **Mark complete**) using `allowedNextStatuses` from `lib/domain`.
- [x] **Styling** — shared `components/projects/punch-list.module.css` + `globals.css` tokens (teal accent, cards, forms).
- [x] **Helpers** — `lib/api-client.ts` (fetch + error formatting), `lib/serializers.ts` (ISO dates for RSC → client props).

### Phase 6 — Dashboard

**Status: complete.**

- [x] **Per project** — `getProjectDashboardStats` in `lib/dashboard/project-dashboard.ts`; **Dashboard** panel on `/projects/[projectId]` with **completion %** (one decimal), open/in-progress/complete counts, and bar **breakdowns** by **location**, **priority**, and **assignee** (null/empty string → **Unassigned**).
- [x] **Global list** — `getProjectListSummaries` using `Prisma.groupBy` by `projectId` + `status`; `/projects` shows **"{n}% complete"** per project when items exist.

### Phase 7 — Deploy and handoff

**Status: complete** (deploy is on **your** Vercel account; paste the real URL in README where noted).

- [x] **Vercel** — repo connected; production **`DATABASE_URL`**; **`prisma migrate deploy`** documented for prod (run locally or in CI when schema changes).
- [x] **README** — local setup, env vars, placeholder **production URL**, **UI/UX** notes (modals, priority colors), **status workflow** documented, **“How I’d enhance this”** section.

## Files to Create/Modify

| Area | Paths (typical) |
|------|------------------|
| Monorepo | `package.json`, `pnpm-workspace.yaml`, optional `turbo.json` |
| Web app | `apps/web/package.json`, `apps/web/next.config.ts`, `apps/web/app/**`, `apps/web/components/**` |
| Database | `apps/web/prisma/schema.prisma`, `apps/web/prisma/migrations/**`, optional `prisma/seed.ts` |
| Env | `.env.example` with `DATABASE_URL` (and blob keys if used) |
| Quality | `tsconfig.json` (root + app), ESLint/Prettier as needed |
| Docs | Root `README.md` (run, deploy, URL, enhancements) |

Concrete filenames will land under `apps/web/` once the app is generated; keep Prisma schema as the single source of truth for the models in the requirements.

## Success Criteria

- [x] **R1** — Users can create projects (TS monorepo, Next.js, Neon in use).
- [x] **R2** — Users can add punch items with location, description, priority, and photo (**URL** in MVP; upload → URL is a documented enhancement).
- [x] **R3** — Items support `assignedTo` and status changes following **open → in_progress → complete** with **server-enforced** transitions.
- [x] **R4** — Dashboard shows **completion %** and breakdowns by **location**, **priority**, and **assignee**.
- [x] **R5** — App is **deployed** with a **working public URL** (replace README placeholder with yours).
- [x] **Spec** — README includes **enhancement ideas** beyond MVP; workflow rules are **documented** (API + **Punch item status (MVP)** in README).
