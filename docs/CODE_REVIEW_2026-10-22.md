# Code review follow-up — 22 October 2026

This experimental application still has reliability and deployment limitations.
Passing the existing checks does not establish production readiness. This review
checks the reported issues against the actual source; it does not claim that the
remaining architectural issues have been fixed.

Update: profile recovery, pre-migration backups, atomic installation/client quotas, explicit proxy origins, bounded audio scheduling and composite indexes are now implemented. Node 22/24 and Docker checks were added. See [implementation and deployment details](BACKEND_RELIABILITY.md). The original findings below record the review baseline; growing snapshots and legacy-store cleanup remain follow-up work.

| Finding | Verified state and next step |
| --- | --- |
| Profile recovery | Confirmed limitation. `getProfile()` depends on an HttpOnly cookie. Losing it can orphan access to an existing profile even while its rows remain in SQLite. Settings exports JSON, but there is no restore/import flow or account sync. Add explicit, authenticated recovery; never automatically expose another profile to a visitor without a cookie. |
| Database backups | Confirmed limitation. The migration preserves existing tables, but does not create automatic backups. Use SQLite's backup facility for a live database; exported progress is a partial safeguard, not an implemented restore feature. |
| Growing study responses | Confirmed. `snapshot()` reads the profile's complete attempts, cards and review timestamps on each study mutation. Move derived historical statistics to aggregation and use paginated history or deltas while preserving mastery, streaks and idempotency. Adding an arbitrary LIMIT would change those results. |
| Audio overload | Confirmed. The Mandarin worker rejects new work at four pending jobs; its diagnostics are discarded. Implement bounded scheduling with timeout/exit handling and diagnostics that do not log private learner text. |
| Paid-service quotas | Confirmed deployment limitation. Quotas are keyed by an anonymous profile; creating new profiles can bypass a per-profile cap. Do not expose configured paid services publicly without an instance budget and a trusted identity/rate-limit layer. |
| Reverse proxy Origin check | Configuration-dependent risk. `readBody()` compares Origin with a host/protocol-derived origin. Test the actual TLS proxy topology and configure trusted origins explicitly. Blindly trusting client-supplied forwarded headers is not a safe general fix. |
| Legacy XP store | Confirmed stale implementation. `useUserStore.addXp()` calls a disabled endpoint and reads the wrong response shape. The active routes use `useStudyStore`; references to the old stores remain in old `ui-custom` components. Trace and migrate or retire the complete unused component chain before deletion. |
| SM-2 factor multiplied by 1,000 | Not reproduced in the active flow. Legacy integer `ease_factor` is divided by 1,000 during adoption in `getProfile()`. Active `study_cards.ease` defaults to REAL 2.5 and the review route passes this value to SM-2. Keep migration coverage; the legacy schema alone does not demonstrate the reported scheduling bug. |
| Missing database indexes | Partly correct. Primary keys already start with `profile_id`; it is inaccurate to say every profile query scans the entire database. Composite indexes matching card due order and tutor lookup would still improve those queries. They do not solve unbounded history transfer. |
| No grading or SM-2 tests | Incorrect as a blanket statement. `test:study` already checks grading, hint handling, duplicate XP, content versions and SM-2. API isolation, idempotency, revision conflict and CSRF checks also exist. The actual gap was that API integration checks were not run by CI. This update adds them after the production build. |
| Node 24 and SQLite | Intentional local runtime choices, not evidence of a defect. The locked `better-sqlite3` version requires Node 22 or newer, so changing engines to include Node 20 would promise unsupported compatibility. Serverless deployment needs a separate storage/runtime design. |
| Changing localhost ports loses the cookie | Incorrect for the server cookie: cookies are not scoped by port. Changing the hostname, clearing cookies or using another browser can select another profile. Local storage is origin-scoped. Use a consistent hostname. |

Evidence: [`study-server.ts`](../src/lib/study-server.ts),
[`study route`](../src/app/api/study/route.ts),
[`migration`](../scripts/migrate-study.mjs),
[`audio worker`](../src/lib/server/mandarin-audio.ts),
[`settings`](../src/app/settings/page.tsx),
[`study checks`](../scripts/verify-study.ts),
[`API checks`](../scripts/verify-api.mjs), and
[`CI workflow`](../.github/workflows/ci.yml).

Priority: protect profile access and recovery, add safe backups, then address
bounded audio scheduling and historical data growth. Public paid-service hosting
requires its own deployment safeguards before it is supported.
