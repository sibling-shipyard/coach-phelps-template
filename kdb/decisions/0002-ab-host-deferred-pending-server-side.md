# 0002 — A+B physical host deferred; BYO-Claude is a stop-gap

- **Status:** Accepted (deferred decision) · 2026-07-24 · Tech Lead
- **Area:** cross-cutting
- **Context:** Soul A + Engine B could live server-side or ship into each user repo
  (BYO-Claude). Only server-side gives a real IP boundary, but its value depends on whether
  Gemini / metered-Claude coaching proves worth it.
- **Decision:** Do not fix the A+B host yet. Ship BYO-Claude as an explicit stop-gap; make
  the call at M3 from M2 feedback.
- **Why:** Local BYO-Claude and "hide the engine" are mutually exclusive; committing now
  would pre-empt a decision that needs real usage data.
- **Rejected:** Commit server-only now → premature, unproven cost/benefit. Commit BYO-only →
  forecloses the IP boundary.
