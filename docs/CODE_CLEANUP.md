# Legacy code cleanup

The application now uses one SQLite connection from **src/db/index.ts** and the
study schema defined in **scripts/migrate-study.mjs**. The unused Drizzle wrapper,
old ORM schema and Drizzle configuration were removed.

An import audit found no active page or route using the retired UI prototype.
The cleanup removes 23 files: nine old UI components, two stores, two adapter
hooks, two prototype curriculum files, an old pinyin adapter, the mock PostgreSQL
seed, the ORM schema/configuration, and four obsolete API route files.

Eight unused direct dependencies were removed: drizzle-orm, drizzle-kit,
framer-motion, howler, @types/howler, @hello-pangea/dnd, @tanstack/react-virtual and
@tanstack/react-query. The installed dependency graph shrank by 26 packages.

## Current interfaces

| Retired route, now HTTP 404 | Current interface |
| --- | --- |
| /api/user | GET /api/study for the profile and study state; XP is derived from validated attempts. |
| /api/flashcards | GET /api/study for cards; POST /api/study with a published word ID to save a card. |
| /api/flashcards/review | POST /api/study with a review event ID and card revision. |
| /api/pronunciation | The speaking UI uses /api/speech/token when Azure is configured, plus local recording/playback. |

The active speaking, audio, dictionary, handwriting, study and review components
remain in use. The four retired routes had no callers outside the removed
prototype and the API regression check.

## Existing databases

Removing an ORM definition does not delete a database table. The compatibility
module **src/lib/server/legacy-profile.ts** adopts optional old users/flashcards
once when initializing the first study profile. It preserves source tables,
converts the old integer ease factor from 2500 to 2.5, and copies saved cards and
legacy XP in one transaction.

**npm run test:legacy** verifies fresh databases, either old table independently,
both old tables together, no duplicate adoption, and rollback if invalid source
data prevents migration. The API suite verifies that retired endpoints return
404 without changing existing attempts or review state.
