# Contributing to Mandarin Sprout

Mandarin Sprout helps learners study Chinese through short lessons, clear
explanations, and progress they can revisit. English and Vietnamese contributions
are welcome.

## Development

Use Node.js 24 and npm. Follow the installation notes in [README](README.md).

```sh
npm ci
npm run db:migrate
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Core lessons, review, reading, dictionary lookup, and handwriting do not need an
API key. AI and speech providers are optional; see `.env.example`.

## Useful contributions

- Report bugs with the page URL, steps, expected result, and actual result. Remove
  personal information from screenshots.
- Correct pinyin, meanings, translations, or examples with a reason and a source.
  Do not copy publisher exercises, scans, translations, or audio without permission.
- Keep content IDs stable. Introduce a revision when a change affects grading;
  distinguish answer changes from wording changes.
- Check incorrect answers, accepted variants, Chinese IME input, hints, duplicate
  submissions, and resuming after reload when changing exercises.
- Check that retries do not create duplicate review events or XP when changing
  review or progress behavior.
- Preserve labels identifying original content, dictionary data, and editorial
  drafts. Technical checks do not replace a teacher's language review.

Run the checks relevant to your change:

```sh
npm run test:study
npm run test:hsk
npm run test:i18n
npm run test:english-ui
npm run test:dictionary-format
npm run build
```

`npm run test:source` verifies the source manifest. If a source file changes,
refresh its SHA-256 entry in `EXPORT-MANIFEST.json`; add entries for new source
files and remove entries for deleted source files. Never add databases, secrets,
personal recordings, caches, or credentials to the manifest.
The included book audio has separate provenance and is not licensed under MIT.

Keep each pull request focused and describe its behavior and validation.
Code contributions are submitted under MIT. Third-party data retains the
licenses listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
