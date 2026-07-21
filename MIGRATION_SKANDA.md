# Migration: coach-phelps (Skanda)

See `WEBSITE_UNIFICATION_PLAN.md` for the full plan this executes. This doc lives in
`coach-phelps-template` (the repo the shared site deploys from) and describes what happens in
Skanda's own repo, `skanda-2003/coach-phelps`, to make the shared site work for him.

## Steps

1. **Wait for template-side prerequisites** — issue #14 (ui merge), issue #16 (auth +
   onboarding), issue #17 (live data fetch) all landed and working in `coach-phelps-template`
   before anything here happens.

2. **Confirm onboarding discoverability** — `coach-phelps` already has `SOUL.md` and
   `training/challenge_v2.json` at the expected paths, so `list-my-repos.ts`'s heuristic (issue
   #16) will pick it up automatically. Nothing to change.

3. **Log into the shared site** with the GitHub account that owns `coach-phelps`, choose it via
   the existing-repo onboarding branch, confirm the dashboard renders real data via the live
   fetch path (issue #17).

4. **Add the `data/aggregate.json` publish step to `sync.yml`.** Reconciled with Akash's design
   (issue #138): `sync.yml` gains a small, mechanical step that reuses `build-data.mjs`'s merge
   logic (refactored to also support this output path) to produce and commit
   `data/aggregate.json` at the repo root — `activities`, `challenge_v2`, `current_week`,
   `workouts`, `sync_status`, plus `schema_version` + `generated_at`. Idempotent — no-op commit
   when nothing changed, mirroring `apply-coach-patch.yml`'s existing guard pattern. This
   corrects an earlier version of this doc that claimed `sync.yml` stays fully unchanged — it
   doesn't, but the change is small and contained.

5. **Verify sync works through the shared site** — trigger a sync from the shared site's UI,
   confirm `.github/workflows/sync.yml`'s `workflow_dispatch` trigger fires correctly using the
   shared bot token, now resolving the target repo from session instead of a static env var
   (issue #18 — no new OAuth scope needed, see `WEBSITE_UNIFICATION_PLAN.md` Section 8.7).

6. **[Decided] Remove `ui/` from `coach-phelps`, sequenced last.** Confirmed with Akash — once
   the shared site is stable, a personal deployment is redundant. Remove `ui/client`, `ui/api`,
   `vercel.json`, `package.json`/`package-lock.json`, `ui/scripts`, `tsconfig.json`,
   `vite.config.ts`, `ui/dist`. No action needed on this step until the shared site (Milestones
   1-4) is confirmed working end to end — don't touch `ui/` in this repo before then.

7. **Decommission Skanda's personal Vercel project** for `coach-phelps` (account-level action, not
   a file change) — only after steps 3-5 confirm the shared site fully replaces it.

8. **Leave untouched:** `SOUL.md`, `training/`, `sessions/`, `templates/`, `scripts/`, `strava/`,
   `.github/workflows/`, `.github/agents/`, `docs/`, `CLAUDE.md`, and Skanda's personal
   history/notes docs (`STRAVA_SYNC_STATUS.md`, `SOUL_PLAN.md`, `SOUL_HISTORY.md`,
   `rename_review.md`). None of this is affected by the unification work.

9. **Optional doc cleanup (low priority):** once the shared site is confirmed stable, update
   `SETUP.md`/`README.md` references from "deploy to your own Vercel" to "log into the shared
   site."

## What does NOT need to be added

No new files are needed in `coach-phelps` for GitHub auth. The OAuth App and session handling
live in the shared site (`coach-phelps-template`) only — no persistent storage layer needed
either (Section 6's resolution is session-carried, not a KV lookup). This repo just needs to
stay discoverable (step 2) and dispatchable (step 5) — both already true today.
