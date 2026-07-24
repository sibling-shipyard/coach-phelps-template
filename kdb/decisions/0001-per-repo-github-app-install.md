# 0001 — Per-repo GitHub App install (no shared PAT)

- **Status:** Accepted · 2026-07-24 · Tech Lead
- **Area:** cross-cutting
- **Context:** ~10 users on one shared UI, each with a private repo. Need read/write to the
  right repo and only theirs; app-only install matching once leaked a collaborator into the
  owner's install (#30).
- **Decision:** Every GitHub call uses the signed-in user's own token, via a GitHub App
  installed per user, scoped to that one repo (Contents R/W + Actions R/W).
- **Why:** Structurally forbids cross-user access — the permanent no-social-features non-goal
  is enforced by the install model, not by app code.
- **Rejected:** Shared org PAT → one credential spans all users' data. App-only matching →
  leaked collaborator→owner (#30); now match on app_slug AND account.login.
