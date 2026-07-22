# Migration: akash-coach-phelps (Akash)

See `docs/website-unification-history.md` for the full story of how the shared site came
together. This doc lives in `coach-phelps-template` (the repo the shared site deploys from) and
describes what happens in Akash's own repo, `akash-suresh/coach-phelps`, to make the shared
site work for him.

## Status

**Done, verified end to end with real data.** Auth (GitHub App install + login) and repo
resolution work for his account exactly the same as Skanda's — generic, no repo-specific code
needed (hardened further by `coach-phelps-hq/coach-phelps-template#30`/`#31`/`#33`, see
`docs/website-unification-history.md` for the full story). `data/aggregate.json` publishing is
built and merged (`akash-suresh/coach-phelps#149`).

His `workflow_dispatch` sync pipeline's Step 1 (Strava) still fails — expected and permanent,
he's fully moved to the iOS/HealthKit app and isn't going back to Strava (would require paying
for Premium for no benefit he'd use). That's no longer a blocker: `akash-suresh/coach-phelps#151`
made Step 1's failure non-fatal (caught, logged as a warning, steps 4-7 still run against
whatever's already in `training/history/`) and fixed `sync.yml`'s push trigger to actually watch
the paths the iOS app commits to (it previously watched none of them — confirmed via
`GitHubAPIClient.swift`/`HealthKitSyncManager.swift`, not a guess). **Verified against a real
iOS sync**: his app's push auto-triggered a GitHub Actions run, which regenerated
`quest_history`/`sleep_log`/`data/aggregate.json` with zero manual steps.

Also fixed: the shared dashboard crashed on his real data on first load, because his
`challenge_v2.json` uses a genuinely different coaching model (`season`/`phase`/
`current_block`/`milestones`, not Skanda's single fixed-duration `challenge`) —
`coach-phelps-hq/coach-phelps-template#34` made every consumer of that shape tolerate a repo
without it, and `akash-suresh/coach-phelps#153` derives a real `challenge` block from
`phase.current_block` so his header shows meaningful dates instead of omitting the widget.
Confirmed working by Akash directly.

**Incident, resolved:** local testing of the `#151` fix accidentally leaked Skanda's own Strava
credentials into this repo (a shared-machine home-directory fallback in `strava_api.py`, not a
bug in the actual fix) and one real sync pulled Skanda's activities into this repo. Reverted
cleanly (`training/history/`, photos, `data/aggregate.json` etc. confirmed to match his last
legitimate commit exactly), `strava/strava_tokens.json` is now gitignored and untracked, and the
leaked credential is rotated. No further Strava-related code changes needed — see decision in
`SCALING_PLAN.md`'s incident note for why the broader "fix both repos' code" option was
considered and correctly rejected as unnecessary now that Strava is fully dead for this account.

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

6. **Verify sync works through the shared site** — **done**, verified against a real iOS sync
   (`akash-suresh/coach-phelps#151`). Decision made: not fixing the Strava token issue (he's
   fully off Strava, not going back), instead made Step 1's failure non-fatal so steps 4-7 and
   the aggregate publish run regardless, and fixed `sync.yml`'s push trigger to actually watch
   the paths the iOS app writes to. His iOS commits now auto-trigger the full pipeline with zero
   manual step.

7. **[Decided] Remove `ui/` from `akash-coach-phelps`, sequenced last.** Still not done, but now
   unblocked — step 6 is resolved. Sequenced with retiring both standalone deployments (the
   last open item from the unification work — see `docs/website-unification-history.md`), not
   before.

8. **Decommission the Netlify deployment** for `akash-coach-phelps` — same, unblocked, sequenced
   with Milestone 4.

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
