# Note for the M0 thread — wiring KB enforcement into the validator

Context: M0 splits the engine and upgrades `validate-data.yml` from JSON-parse-only to full
file contracts. The KB (`kdb/decisions/` + `AGENTS.md`) should ride that same gate so it
stays bounded and doesn't rot — enforced mechanically where possible, by review where not.

## What CAN be enforced mechanically (add to the M0 validator pass)

A cheap `validate-kb` job (or a step in `validate-data.yml`) over `kdb/decisions/`:

- Every `NNNN-*.md` (excluding `README.md`, `0000-template.md`) has all required fields:
  `Status`, `Area`, `Context`, `Decision`, `Why`, `Rejected`.
- Filenames are `NNNN-kebab.md`; numbers are unique and zero-padded.
- Any `Superseded by NNNN` points at a file that exists.
- `AGENTS.md` stays lean (soft cap ~150 lines) — warn, don't fail.

These are mechanical format checks, same spirit as the data contracts M0 already adds.

## What CANNOT be enforced mechanically (keep as a review-gate convention)

CI can't detect an *unrecorded* decision — "you made an architectural choice and didn't write
an ADR" is invisible to a linter. So this stays a Tech-Lead review rule, added to the PR
checklist in `.github/agents/issue-template.md`:

- [ ] Does this PR change a locked/architectural decision? If yes, it adds or supersedes an
      ADR in `kdb/decisions/`.

## Why no worklog / "update on close" hook

We deliberately dropped a session worklog: git history + PR descriptions already carry
"what changed and why," so there's no per-session KB write to enforce. Engine Layer B's
commit protocol therefore does **not** need a KB step — the only standing KB discipline is
"durable decisions become ADRs," covered by the review gate above. Revisit only if a project
develops genuine multi-session, half-finished handoffs that git doesn't capture.
