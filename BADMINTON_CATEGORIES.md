# Badminton categorization: two schemes, two pages

This repo ships two badminton dashboard pages built on two different, incompatible ways of categorizing a badminton activity. This file explains the conflict and how to fully switch the template over to the other scheme if you want to.

## The two pages

- **`/badminton`** (`ui/client/src/pages/BadmintonAnalytics.tsx`) - the active page, built around three categories: `badminton_club`, `badminton_drills`, `badminton_casual`. This is what the template's classification logic (`getTrainingCategory()` in `ui/client/src/lib/activities.ts`) actually produces from real Strava data right now.
- **`/badminton-match-analytics`** (`ui/client/src/pages/BadmintonMatchAnalytics.tsx`) - a second, separate page restored from an earlier version of this project. It's built around a different set of categories: `badminton_ranked`, `badminton_league`, `badminton_friendly`, `badminton_casual`, plus a Ranked/All game-mode filter and match-score parsing (win/loss records, partners, opponents).

Both pages are wired into the app and reachable from the nav bar. **`/badminton-match-analytics` will not show meaningful data out of the box** - the template's activities never get classified into `badminton_ranked`/`badminton_league`/`badminton_friendly`, only `badminton_club`/`badminton_drills`/`badminton_casual`, so its Ranked/All filter has almost nothing to match against (the one exception is `badminton_casual`, which exists in both schemes and happens to overlap). This is intentional - it ships as reference/dormant code for anyone who wants to switch to this categorization scheme later.

## Why not just merge them?

A single Strava activity can only be classified one way. The two schemes represent genuinely different ways of thinking about badminton training (club/drills/casual = training context; ranked/league/friendly/casual = competitive format), so you have to pick one as your actual source of truth. Running both pages fully live with real data at the same time would require two separate classification pipelines and two separate sets of Strava activity naming conventions feeding them - more complexity than most users need. Pick one scheme, treat the other page as reference.

## How to switch to the ranked/league/friendly/casual scheme

If you want `/badminton-match-analytics` to be your real, working badminton page instead of `/badminton`:

1. **Update the type.** In `ui/client/src/lib/activities.ts`, change the `TrainingCategory` union (around line 51-53):
   ```ts
   | "badminton_ranked"
   | "badminton_league"
   | "badminton_friendly"
   | "badminton_casual"
   ```
   in place of `badminton_club` / `badminton_drills` / `badminton_casual`.

2. **Update `CATEGORY_CONFIG`.** Same file, around line 78-80 - add label/color entries for the new category keys (`badminton_ranked`, `badminton_league`, `badminton_friendly`), matching the pattern of the existing entries.

3. **Update `GROUP_CONFIG`.** Around line 99 - update the `badminton` group's `categories` array to list the new keys instead.

4. **Update the classification logic.** `getTrainingCategory()` (starting around line 105) currently detects `badminton_club`/`badminton_drills`/`badminton_casual` from Strava activity name patterns (e.g. `/^Badminton: Club\s*#/i`, around lines 130-146). Replace these regex checks with whatever naming convention distinguishes ranked/league/friendly matches for you - this is the part that actually needs real-world Strava activity names to work against, so decide your naming convention first (e.g. `Ranked #12`, `League #3`, `Friendly #7`) and match the regexes to it.

5. **`/badminton` will break once you do this.** It's built directly on `badminton_club`/`badminton_drills` and will show empty/broken data after step 1-4, since those categories no longer exist. If you want to keep both pages meaningfully working, you'd need to keep both sets of categories in the type (not swap one for the other) and make sure your Strava naming convention can distinguish all of them from each other - more categories, more naming discipline required, but both pages would work. Simpler is to just pick one and treat the other page as dead/removable.

6. **`matchParser.ts` needs real match data.** `/badminton-match-analytics` also parses win/loss/score data out of Strava activity descriptions (`ui/client/src/lib/matchParser.ts`), expecting either an "enriched" description format or an eBadders-style structured description. Getting real content on this page requires your Strava descriptions to be in one of those formats, not just correct categorization - see `matchParser.ts`'s top-of-file comment for the exact formats it parses.

## If you just want to remove one of the pages instead

Since both pages are just reference implementations for a new user's own sport/setup:
- To remove `/badminton-match-analytics`: delete `ui/client/src/pages/BadmintonMatchAnalytics.tsx`, `ui/client/src/components/badminton-match-analytics/`, `ui/client/src/lib/matchParser.ts`, and its route + nav link in `App.tsx` / `CommandStrip.tsx`.
- To remove `/badminton`: delete `ui/client/src/pages/BadmintonAnalytics.tsx`, `ui/client/src/components/badminton-analytics/`, and its route + nav link.
