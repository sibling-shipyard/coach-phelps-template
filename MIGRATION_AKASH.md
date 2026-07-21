# Migration: akash-coach-phelps (Akash)

See `WEBSITE_UNIFICATION_PLAN.md` for the full plan this executes. This doc lives in
`coach-phelps-template` (the repo the shared site deploys from) and describes what happens in
Akash's own repo, `akash-suresh/coach-phelps`, to make the shared site work for him.

## Status

Auth (GitHub App install + login) and repo resolution work for his account exactly the same as
Skanda's — generic, no repo-specific code needed. `data/aggregate.json` publishing is built and
merged (`akash-suresh/coach-phelps#149`). **What's not yet true: his real data hasn't actually
landed on the shared site**, because his `workflow_dispatch` sync pipeline currently fails at
Step 1 (Strava API returns `403 Forbidden`) before ever reaching the new steps — a separate,
pre-existing problem with his Strava auth, not a bug in any of this work. His real sync mechanism
is the iOS/HealthKit app (`ios/`), which commits directly to `training/history/` — that path is
untouched and unaffected by the Strava failure, but nothing currently re-triggers
`data/aggregate.json` publishing after an iOS-only commit (see step 6 below).

## Steps

1. **Wait for template-side prerequisites** — issue #14 (ui merge), issue #16/#25 (auth,
   migrated to a GitHub App), issue #17 (live data fetch) all landed and working in
   `coach-phelps-template`. **Done.**

2. **Confirm onboarding discoverability** — `akash-coach-phelps` has `SOUL.md` and
   `training/challenge_v2.json` at the expected paths. **Done, confirmed.**

3. **Rename `akash_won` at the source, in this repo.** Still **not done** — `scripts/
   parse_match_description.py`, `run_sync_pipeline.py`, and `generate_analytics_snapshot.py`
   all still use `akash_won`. Downgraded from "needed for the shared site" to **cosmetic tech
   debt in his own scripts only** — confirmed his real badminton match data reaches the shared
   dashboard through the `description`-text parsing path (`matchParser.ts`'s
   `parseDescription()`), not through `ebadders_history.json`/`leaderboard.json` (the files that
   actually use `akash_won`, both entirely internal to his own pipeline, never read by the
   shared site). No urgency; do whenever, doesn't block anything.

4. **Log into the shared site**, existing-repo onboarding branch, confirm the badminton
   match-analytics dashboard renders his data correctly. **Login itself works** (verified
   generically, same code path as Skanda's account). **Seeing real data is blocked** on step 6
   below — his `data/aggregate.json` doesn't exist yet.

5. **Add the `data/aggregate.json` publish step to `sync.yml`.** **Done**
   (`akash-suresh/coach-phelps#149`) — went further than originally scoped here: his repo was
   also missing `quest_history` generation entirely (no `scripts/generate_quest_history.py`) and
   `sleep_log` tracking (no `training/sleep_log.json` source file at all) compared to Skanda's
   repo — both added. `build-data.mjs` refactored the same way as
   `skanda-2003/coach-phelps#92`, adapted to preserve his repo-specific `current_week.json`
   handling. `sync.yml` change folded into his existing single commit step, not a separate one.

6. **Verify sync works through the shared site** — **blocked**, not on anything in this plan.
   His `workflow_dispatch` pipeline fails at Step 1 (Strava `403 Forbidden`) before reaching the
   aggregate-publish step added in #149. Separately: even once/if that's fixed, worth noting his
   iOS app committing directly to `training/history/` doesn't itself trigger `data/aggregate.json`
   regeneration — only a successful `workflow_dispatch` run does. Whether to fix the Strava
   token issue, or make Step 1 non-fatal so the rest of the pipeline (including aggregate
   publishing) runs regardless of Strava's state, is Akash's/Skanda's call — flagged, not
   decided or executed.

7. **[Decided] Remove `ui/` from `akash-coach-phelps`, sequenced last.** Still not done — no
   action needed until the shared site is confirmed working end to end **for his account
   specifically**, which needs step 6 resolved first.

8. **Decommission the Netlify deployment** for `akash-coach-phelps` — same, waiting on step 6.

9. **Leave untouched:** `SOUL.md`, `training/`, `sessions/`, `templates/`, `scripts/`, `strava/`,
   `ios/` (the HealthKit sync app — entirely orthogonal to website unification, keeps writing to
   `training/history/*` in the same shape it does today), `.github/workflows/`,
   `.github/agents/` (including `ios-builder.md` — still relevant to his sync mechanism), `docs/`,
   `skills/`, `tests/`, `CLAUDE.md`.

10. **Optional doc cleanup (low priority):** once the shared site is confirmed stable, update
    `SETUP.md`/`README.md` to drop Netlify references and point at "log into the shared site."

## What does NOT need to be added

No new files are needed in `akash-coach-phelps` for GitHub auth. The GitHub App and session
handling live in the shared site (`coach-phelps-template`) only — no persistent storage layer
needed either (Section 6's resolution is session-carried, not a KV lookup). This repo just needs
to stay discoverable (step 2, done) and dispatchable (step 6, blocked on his Strava auth).
