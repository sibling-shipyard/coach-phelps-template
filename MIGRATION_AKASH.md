# Migration: akash-coach-phelps (Akash)

See `WEBSITE_UNIFICATION_PLAN.md` for the full plan this executes. This doc lives in
`coach-phelps-template` (the repo the shared site deploys from) and describes what happens in
Akash's own repo, `akash-suresh/coach-phelps`, to make the shared site work for him.

## Steps

1. **Wait for template-side prerequisites** — issue #14 (ui merge), issue #16 (auth +
   onboarding), issue #17 (live data fetch), and issue #12 (`akash_won` → `player_won` in the
   template's `ui/matchParser.ts`) all landed and working in `coach-phelps-template` before
   anything here happens.

2. **Confirm onboarding discoverability** — `akash-coach-phelps` already has `SOUL.md` and
   `training/challenge_v2.json` at the expected paths, so `list-my-repos.ts`'s heuristic (issue
   #16) will pick it up automatically. Nothing to change.

3. **Rename `akash_won` at the source, in this repo.** Issue #12 fixes the template's
   `ui/matchParser.ts`, but Akash's own upstream pipeline scripts (`parse_match_description.py`,
   `generate_analytics_snapshot.py`, wherever they live under `scripts/`/`strava/`) still produce
   `akash_won` in the `training/history/*` data his sync pipeline writes — that data flows into
   the shared site regardless of what happens to `ui/`. This is real work in this repo,
   independent of step 6, and should land alongside issue #12's template-side fix so the field
   name matches end to end.

4. **Log into the shared site**, existing-repo onboarding branch, confirm the badminton
   match-analytics dashboard renders his data correctly post-rename.

5. **Add the `data/aggregate.json` publish step to `sync.yml`.** This is Akash's own design
   (issue #138): `sync.yml` gains a small, mechanical step that reuses `build-data.mjs`'s merge
   logic (refactored to also support this output path) to produce and commit
   `data/aggregate.json` at the repo root — `activities`, `challenge_v2`, `current_week`,
   `workouts`, `sync_status`, plus `schema_version` + `generated_at`. Idempotent — no-op commit
   when nothing changed, mirroring `apply-coach-patch.yml`'s existing guard pattern. Akash owns
   the supported `schema_version` range policy. This corrects an earlier version of this doc that
   claimed `sync.yml` stays fully unchanged — it doesn't, but the change is small and contained.

6. **Verify sync works through the shared site** — trigger a sync from the shared site's UI,
   confirm `.github/workflows/sync.yml`'s `workflow_dispatch` trigger fires correctly using the
   shared bot token, now resolving the target repo from session instead of a static env var
   (issue #18 — no new OAuth scope needed, see `WEBSITE_UNIFICATION_PLAN.md` Section 8.7).

7. **[Decided] Remove `ui/` from `akash-coach-phelps`, sequenced last.** Confirmed — once the
   shared site is stable, a personal deployment is redundant. Remove `ui/client`, `ui/netlify/`,
   `netlify.toml`, `pnpm-lock.yaml`, `package.json`, `ui/scripts`, `tsconfig.json`,
   `vite.config.ts`. No action needed on this step until the shared site (Milestones 1-4) is
   confirmed working end to end — don't touch `ui/` in this repo before then.

8. **Decommission the Netlify deployment** for `akash-coach-phelps`, once confirmed redundant.

9. **Leave untouched:** `SOUL.md`, `training/`, `sessions/`, `templates/`, `scripts/`, `strava/`,
   `ios/` (the HealthKit sync app — entirely orthogonal to website unification, keeps writing to
   `training/history/*` in the same shape it does today), `.github/workflows/`,
   `.github/agents/` (including `ios-builder.md` — still relevant to his sync mechanism), `docs/`,
   `skills/`, `tests/`, `CLAUDE.md`.

10. **Optional doc cleanup (low priority):** once the shared site is confirmed stable, update
    `SETUP.md`/`README.md` to drop Netlify references and point at "log into the shared site."

## What does NOT need to be added

No new files are needed in `akash-coach-phelps` for GitHub auth. The OAuth App and session
handling live in the shared site (`coach-phelps-template`) only — no persistent storage layer
needed either (Section 6's resolution is session-carried, not a KV lookup). This repo just needs
to stay discoverable (step 2) and dispatchable (step 6) — both already true today.
