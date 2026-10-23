# Verification record — 23 October 2026

This record describes the checked community source. It is an experimental preview,
not a claim that all content, deployment scenarios or long-term behavior are correct.
See [review follow-up](CODE_REVIEW_2026-10-22.md) for remaining problems.

## Source and resources

- 5,108 source/resource files are listed with SHA-256 hashes in
  `EXPORT-MANIFEST.json`; the manifest itself is also committed.
- The corpus contains 11,715 imported vocabulary records in all 812 lessons.
- Included resources contain 3 supplied book PDFs, 3 publisher reference PDFs,
  298 page images, 272 native learning parts, OCR/translations, answer keys,
  93 textbook recordings and 491 workbook clips.
- Source checks reject private database/environment/recording/cache paths and
  verify blank example configuration, notices and the requested
  **Cre:Thompson HSK 3.0** credit.

## Checks passed locally

- `test:study`: grading, hints, duplicate XP, content versions, date boundaries,
  weakness recovery, empty/invalid progress totals, bounded percentages,
  empty-lesson completion and SM-2.
- `test:speech`: recording signal/WAV checks plus execution of the maintained
  hooks and speaking component with deterministic hook/media adapters. Checks
  cover replaced/revoked URLs, delayed permission/decode/fetch results, effect
  cleanup/replay, stale events, recorder/recognizer/SDK failures, tracks, timers,
  capture locks and AudioContext close after decode failure. These tests do not
  open a real microphone, run React in a browser or call a cloud provider.
- `test:writing`: all 3,039 vocabulary-derived characters, original stroke-file
  hashes, readings, examples, band/stroke filters and exhaustive pagination.
  `test:speech-reading` covers the expanded library and explicitly rejects an
  unsupported nasal speech hint. See [handwriting details](HANDWRITING.md).
- `test:hsk`, `test:vocabulary`: all 9 app levels, 812 lessons, 23,430 generated
  vocabulary questions, stable IDs, different readings and grading.
- `test:i18n`, `test:english-ui`, `test:dictionary-format`: translation mappings,
  Hanzi/pinyin preservation, learner-text preservation and readable definitions.
- `test:hsk-materials`, `test:hsk-native`, `test:reading-alignment`,
  `test:hsk-audio-alignment`, `test:hsk-workbook-audio`: page data, native parts,
  reading, recordings and source alignment.
- `test:hsk-answer-grading`: 792 source-aligned answers, pinyin/tones/ü,
  page-local keys, retries, Unicode input and exact publisher reference hashes.
- `test:resources`, `test:source`: actual audio files, resource counts, source
  hashes, credit and personal-data exclusion.
- `build`: optimized production build and TypeScript passed. Translation catalog
  paths are scoped to `data/` to avoid tracing the whole checkout into the output.

The production server was run on a separate loopback port with the community
checkout's test database. The existing API suites passed: `test:api`, `test:hsk-api`,
`test:vocabulary-api`, `test:i18n-api`, `test:hsk-materials-api`, and
`test:hsk-answer-api`. These cover server grading, repeat submissions, revision
conflicts, reload persistence, profile isolation, CSRF rejection, language cache
isolation, book draft validation, routes and audio delivery. They do not use the
original learner database or configured paid providers.

The added `test:writing-api` also passed against the production server in both
languages, including invalid input, missing characters and local stroke files.

CI now runs these integration suites after a production build and database
migration. Its GitHub Actions result must be checked for the published commit;
a local pass alone does not establish that a remote run succeeded.

## Limits

English coverage checks are structural and cannot certify translation quality.
They do not replace teacher review, live paid-provider tests, recovery/backup
testing, large-history benchmarks or a deployment-specific security review.
Historical response growth remains open work. The unused legacy store/component/API chain and Drizzle schema/configuration have been removed after an import audit. Recovery, backup, quota/proxy and audio scheduling changes have dedicated regression suites; see [runtime safeguards](BACKEND_RELIABILITY.md).

New checks: test:backend, test:audio-queue, test:recovery-api, plus a Node 22/24 matrix and Docker build/restart/persistence job. Check the published commit's CI result before claiming those remote jobs passed.

Legacy cleanup adds test:legacy for one-time adoption and rollback; the API suite now checks retired endpoint 404s and unchanged progress. See [cleanup details](CODE_CLEANUP.md).

Progress meters share one finite 0–100 calculation. The vocabulary API checks
missing, fractional, non-finite, duplicated and noncanonical HSK levels in both
languages. Maintenance instructions require checking imports/callers and removing
code made unused by each change before committing.
An isolated check temporarily withheld the community checkout's vocabulary file:
the active API returned JSON 503 in both languages, exposed no file path or stack,
and returned 200 after restoring the file with its original SHA-256 hash.
