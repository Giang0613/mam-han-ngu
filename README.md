# Mandarin Sprout · Mầm Hán Ngữ

Learn Mandarin one small step at a time. Mandarin Sprout is a self-hosted,
open-source learning app in English and Vietnamese, built with Next.js, React,
TypeScript, SQLite, and Three.js. English is the default; switch languages from
the top bar.

![Mandarin Sprout home screen with its miniature Chinese study garden](docs/images/study-garden.png)

## What you can study

- 48 foundation lessons, 189 vocabulary items, and 120 grammar patterns.
- HSK practice paths, contextual reading, and conversation practice.
- Spaced repetition with SM-2 scheduling and saved progress.
- Handwriting practice with Hanzi Writer and a 125,208-entry CC-CEDICT dictionary.
- English and Vietnamese interfaces, plus downloadable English text lessons.
- An original interactive 3D study garden with a static fallback and reduced-motion support.

The foundation course is originally authored with AI assistance. Advanced English
translations include drafts that need editorial review. The course is not an
official HSK syllabus or certified as equivalent to an HSK exam. Offline results
do not sync to server progress.

Publisher PDFs, scans, translations, answer keys, textbook audio, imported PDF
vocabulary, credentials, and learner databases are excluded. See
[third-party notices](THIRD_PARTY_NOTICES.md) and [localization](docs/LOCALIZATION.md).

## Run locally

Use Node.js 24 and npm:

```sh
git clone https://github.com/Giang0613/mam-han-ngu.git
cd mam-han-ngu
npm ci
npm run db:migrate
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Open http://localhost:3000. Original lessons are under `/curriculum/1`.
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
npm run test:hsk
npm run test:i18n
npm run test:english-ui
npm run test:dictionary-format
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

This edition is designed for local study. Profiles use browser cookies; account
sign-in and cross-device sync are not implemented. Read [security](SECURITY.md)
before running an Internet-facing instance.

## Contribute and license

Code is MIT licensed. CC-CEDICT, stroke data, and fonts retain their own licenses
and attributions. Contributions improving English copy are welcome; see
[contributing](CONTRIBUTING.md).

Report reproducible bugs through [GitHub Issues](https://github.com/Giang0613/mam-han-ngu/issues).
See [interface notes](docs/INTERFACE.md), [verification](docs/VERIFICATION.md),
and [community source scope](docs/OPEN_SOURCE.md) for implementation details and
known limits.
