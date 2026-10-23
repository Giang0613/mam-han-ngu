# Mandarin Sprout · Mầm Hán Ngữ

> **Experimental preview · Bản thử nghiệm. Nonprofit project · Dự án phi lợi nhuận.** Content and features are still being refined; this is not a stable release.

Learn Mandarin one small step at a time. Mandarin Sprout is a self-hosted,
open-source learning app in English and Vietnamese, built with Next.js, React,
TypeScript, SQLite, and Three.js. English is the default; switch languages from
the top bar.

![Mandarin Sprout home screen with its miniature Chinese study garden](../docs/images/study-garden.png)

**Cre:Thompson HSK 3.0** — credit for the supplied HSK 3.0 teaching materials.
See [credits](../CREDITS.md) and [resource provenance](../docs/RESOURCE_SOURCES.md).

## What you can study

- 48 foundation lessons, 189 foundation vocabulary items, and 120 grammar patterns.
- An additional 11,715 imported vocabulary records organized into 812 lessons across app levels 1–9.
- Full supplied HSK 1 materials: 3 original books, 3 publisher reference PDFs, 298 page images, OCR/translations,
  272 web learning parts, answer keys, and book-processing tools. Open `/hsk/1/materials`.
- 93 textbook recordings and 491 workbook listening clips; open `/hsk/1/audio`.
- HSK practice paths, contextual reading, and conversation practice.
- Spaced repetition with SM-2 scheduling and saved progress.
- Handwriting practice for 3,039 distinct Hanzi from the vocabulary corpus, with
  search, vocabulary-band/stroke filters, word examples and local stroke data.
  See [handwriting sources and checks](HANDWRITING.md).
- A 125,208-entry CC-CEDICT dictionary.
- English and Vietnamese interfaces, plus downloadable English text lessons.
- An original interactive 3D study garden with a static fallback and reduced-motion support.

The foundation course is originally authored with AI assistance. Advanced English
translations include drafts that need editorial review. The course is not an
official HSK syllabus or certified as equivalent to an HSK exam. Offline results
do not sync to server progress.

All maintained application source and supplied course resources are included. The
code's MIT license does not relicense third-party books, scans, translations,
answer keys, recordings, dictionary data, or fonts; original rights and notices
remain applicable. See [third-party notices](../THIRD_PARTY_NOTICES.md).

Learner databases, personal recordings, credentials, filled environment files,
caches, installed dependencies, generated builds, and downloaded model runtimes
are excluded. Optional runtimes can be installed with the included setup tools.

## Run locally

Use Node.js 24 (recommended) or Node.js 22 and npm:

```sh
git clone https://github.com/Giang0613/mam-han-ngu.git
cd mam-han-ngu
npm ci
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Open http://127.0.0.1:3000. Keep the same hostname when returning to your learner profile. Original lessons are under `/curriculum/1`; imported
vocabulary lessons are under `/hsk/1/vocabulary` through `/hsk/9/vocabulary`. Book
audio is under `/hsk/1/audio`. The full source and supplied resources occupy approximately 490 MiB before Git compression.
Progress is stored in a local SQLite database. No API key is needed for foundation
lessons, dictionary lookup, review, reading, or handwriting.

If installation attempts a native rebuild, check the Node.js version first.
The locked `better-sqlite3` package includes platform prebuilds; unsupported
platforms or rebuilds may require Python and C++ build tools. On Windows x64,
`npm ci --ignore-scripts` was also verified with this lockfile. Do not use that
workaround if your platform still needs a native build.

## Verify and build

```sh
npm run test:study
npm run test:writing
npm run test:speech-reading
npm run test:hsk
npm run test:i18n
npm run test:english-ui
npm run test:dictionary-format
npm run test:vocabulary
npm run test:resources
npm run test:hsk-materials
npm run test:hsk-native
npm run test:hsk-answer-grading
npm run test:source
npm run build
npm run start -- --hostname 127.0.0.1 --port 3000
```

Production output uses `.next-production`. Stop the dev server before reusing its
port. Never commit `local.db`, WAL files, `.env.local`, or recordings. Back up a
running database using SQLite backup or export learner progress from Settings.

## Optional services and deployment

Optional AI and speech providers use server-side environment variables described
in `.env.example`. Without configuration, guided practice and local recording
playback remain available. Microsoft sample speech requires an online service;
new lesson text is sent to that provider. Do not place API keys in client code.

This edition is designed for local study. Profiles use browser cookies with a separate recovery code available in Settings; account sign-in and cross-server sync are not implemented. Read [security](../SECURITY.md)
before running an Internet-facing instance. See the [verified review findings](CODE_REVIEW_2026-10-22.md) for unresolved reliability and deployment limits.

See [recovery, budgets, backups and Docker setup](BACKEND_RELIABILITY.md). Local dev/start commands back up and migrate existing storage before starting.

## Contribute and license

Code is MIT licensed. CC-CEDICT, stroke data, and fonts retain their own licenses
and attributions. Contributions improving English copy are welcome; see
[contributing](../CONTRIBUTING.md).

Report reproducible bugs through [GitHub Issues](https://github.com/Giang0613/mam-han-ngu/issues).
See [interface notes](../docs/INTERFACE.md), [verification](../docs/VERIFICATION.md),
and [community source scope](../docs/OPEN_SOURCE.md) for implementation details and
known limits.
