# Rebar findings: requirements vs implementation spec

**Project:** punch-list-tracker  
**Review focus:** `requirements.md` vs `specs/mvp-implementation.md` (and `expertise.yaml`)  
**Date:** 2026-04-13

## Rebar usage

- **`rebar_read_file`** on `apps/punch-list-tracker/requirements.md` — authoritative take-home brief.
- **`rebar_read_file`** on `apps/punch-list-tracker/specs/mvp-implementation.md` — MVP implementation plan produced by **`rebar_plan`**.

## Findings

### Aligned

- The spec’s **Requirements** summary and **R1–R5** / implementation phases match the brief:
  - TypeScript monorepo, **Next.js** on **Vercel**, **Neon** (Postgres) with **Prisma** and the given **Project** / **PunchItem** shape.
  - Punch items: **location**, **description**, **priority**, **photo** (URL or upload → URL).
  - **Assign** via `assignedTo`; status flow **open → in_progress → complete** with server-side enforcement (addresses the “hidden workflow” note in the brief).
  - **Dashboard:** completion **%**; breakdowns by **location**, **priority**, **assignee** (including unassigned).
  - **Deploy** with a public, **clickable URL**; README **enhancement** ideas beyond MVP.

### Drift (spec document)

- The implementation spec previously embedded a **static copy** of `expertise.yaml` under “Project Context.” That snapshot had **fallen behind** the live file (e.g. missing `requirements_source`, `implementation_plan`, updated `technical_stack`, and the second `key_decision`).

**Mitigation:** The spec now points at live **`apps/punch-list-tracker/expertise.yaml`** and instructs using **`rebar_read_file`** there instead of duplicating YAML (avoids future drift).

### Mismatch (`expertise.yaml` vs `requirements.md`)

- **`implementation_patterns.punch_item_lifecycle`** in `expertise.yaml` had listed extra example statuses (**blocked**, **ready_for_review**, **closed**) that the take-home schema does **not** define. The brief allows only **`open`**, **`in_progress`**, and **`complete`**.

**Mitigation:** `expertise.yaml` was updated so `punch_item_lifecycle` matches **`requirements.md`** (three statuses only, server-enforced transitions for MVP).

## Traceability in the spec

The implementation spec includes a **Requirements consistency** section: a table mapping each part of **`requirements.md`** to phases and success criteria in **`mvp-implementation.md`**, plus notes on **complete** vs “closed”, **priority** default **normal**, and **photo** as a string URL.

## Related paths

| Artifact | Path |
|----------|------|
| Brief | `apps/punch-list-tracker/requirements.md` |
| Implementation plan | `apps/punch-list-tracker/specs/mvp-implementation.md` |
| Live Rebar context | `apps/punch-list-tracker/expertise.yaml` |
| This findings log | `apps/punch-list-tracker/specs/rebar-requirements-consistency-findings.md` |
