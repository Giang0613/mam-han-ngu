# Full community source edition

Public repository: [Giang0613/mam-han-ngu](https://github.com/Giang0613/mam-han-ngu).

**Experimental preview · Bản thử nghiệm.** The supplied HSK 3.0 materials carry
the requested credit **Cre:Thompson HSK 3.0**. Code and third-party content retain
separate license scopes; see [credits](../CREDITS.md) and [resources](RESOURCE_SOURCES.md).

This edition contains all maintained application source and the supplied course
resources, including original PDFs, all page images, OCR/translations, answer
keys, lesson data, recordings, and preparation tools. Learner storage IDs are
preserved. Personal databases, saved drafts/history, personal recordings,
credentials, filled environments, caches, installed dependencies, builds, and
downloaded runtime/model files are excluded.

`EXPORT-MANIFEST.json` lists source/resource files and SHA-256 hashes. The exporter
creates a new directory, refuses to overwrite an existing directory, and never
reads or copies a learner database:

```sh
node scripts/export-open-source.mjs --output /absolute/path/to/new-community-source
```

It uses explicit project directories, skips private/generated files, renames the
book translation catalogs, and removes machine-specific import paths. After
editing a source file, refresh its manifest entry and run the relevant checks.
Do not stage files outside the manifest for a public source release.
