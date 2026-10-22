# Verification record — 22 October 2026

This record describes the checked community source. It is an experimental preview,
not a claim that all content, deployment scenarios or long-term behavior are correct.
See [review follow-up](CODE_REVIEW_2026-10-22.md) for remaining problems.

## Source and resources

- 2,415 source/resource files are listed with SHA-256 hashes in
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
  weakness recovery and SM-2.
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
checkout's test database. All six API suites passed: `test:api`, `test:hsk-api`,
`test:vocabulary-api`, `test:i18n-api`, `test:hsk-materials-api`, and
`test:hsk-answer-api`. These cover server grading, repeat submissions, revision
conflicts, reload persistence, profile isolation, CSRF rejection, language cache
isolation, book draft validation, routes and audio delivery. They do not use the
original learner database or configured paid providers.

CI now runs these integration suites after a production build and database
migration. Its GitHub Actions result must be checked for the published commit;
a local pass alone does not establish that a remote run succeeded.

## Limits

English coverage checks are structural and cannot certify translation quality.
They do not replace teacher review, live paid-provider tests, recovery/backup
testing, large-history benchmarks or a deployment-specific security review.
Historical response growth and legacy-store cleanup remain open work. Recovery, backup, quota/proxy and audio scheduling changes have dedicated regression suites; see [runtime safeguards](BACKEND_RELIABILITY.md).

New checks: test:backend, test:audio-queue, test:recovery-api, plus a Node 22/24 matrix and Docker build/restart/persistence job. Check the published commit's CI result before claiming those remote jobs passed.
