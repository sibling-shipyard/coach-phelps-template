# 0003 — Fresh skeleton repo; original archived

- **Status:** Accepted · 2026-07-24 · Tech Lead
- **Area:** cross-cutting
- **Context:** New instances need a clean, propagatable base. The original hand-built repo
  has entangled layers and single-tenant assumptions.
- **Decision:** New instances are stamped from a fresh `coach-engine` skeleton (Soul A +
  Engine B + skeleton tree + workflows + validators). The original repo is archived at M1,
  not evolved in place.
- **Why:** A clean skeleton is the source for provisioning and propagation; carrying the
  original's baggage forward would leak single-tenant assumptions into every new instance.
- **Rejected:** Fork/evolve the original → drags entangled layers + history into every user.
  Keep original live as template → two sources of truth.
