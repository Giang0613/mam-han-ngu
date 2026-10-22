# Community source edition

The public repository is [Giang0613/mam-han-ngu](https://github.com/Giang0613/mam-han-ngu).
The application is called **Mầm Hán Ngữ** in Vietnamese and **Mandarin Sprout** in
English. Its sprout-and-book mark and study-garden scene are original app assets.

## Included source

The community edition contains the application, original foundation lessons,
open dictionary and stroke data with their notices, an empty environment template,
contribution documentation, and CI checks. Publisher book pages show an explanatory
message; PDF-derived vocabulary is replaced with valid empty arrays.

`EXPORT-MANIFEST.json` records included source files and SHA-256 hashes, excluded
material categories, and export transformations. It excludes personal Git history,
learner databases, credentials, recordings, and caches. This is an independent
community source release; it does not rewrite the private project's history.

## Releasing changes

1. Review content rights, the manifest, and third-party notices.
2. Follow the README to install dependencies and run the relevant checks and build.
3. Test with a new local database; do not copy a real learner database or secrets.
4. Refresh source manifest entries for changed, added, or removed files, then run
   `npm run test:source`.
5. Commit only community source and keep all required license notices.

The export script can produce a new directory outside the source checkout:

```sh
node scripts/export-open-source.mjs --output /absolute/path/to/new-community-source
```

It refuses to overwrite an existing directory. It copies an explicit set of
application files and performs community transformations; it does not upload data
or modify the source learner database.

## Provenance and claims

Next.js, React, and other dependencies retain their upstream licenses. Course
content includes AI-assisted authorship and still needs editorial review. The
project does not claim acceptance into Codex for OSS, official HSK endorsement,
or unmeasured user adoption.

Existing cookie names, content IDs, and cache keys are retained for compatibility
with saved learning progress.
