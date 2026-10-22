# Supplied learning resources

**Experimental preview · Bản thử nghiệm.** Content and features are still being
refined. The project owner requested publication of all supplied project learning
materials, with personal data excluded.

**Cre:Thompson HSK 3.0**

This credit applies to the supplied HSK 3.0 teaching materials. Original rights
remain with their respective creators; attribution does not relicense books,
scans, definitions, examples, translations, answers, or recordings under MIT.
No additional open-content license was identified in the local source metadata.

## Included materials

- 11,715 vocabulary records organized into all 812 vocabulary lessons.
- 3 byte-identical supplied HSK 1 PDFs: textbook, workbook, and writing book.
- 3 publisher reference PDFs with extracted text and minimal source metadata,
  included under `public/hsk1-materials/reference` so answer verification works
  from a fresh clone without a private cache. Their hashes are checked against
  `data/hsk1-materials/editorial/answer-key-audit.json`.
- All 298 page images, OCR sidecars, reading data, translations, editorial
  corrections, audio associations, answer keys, and layouts.
- 272 web learning parts across 15 lessons and a review section.
- 93 textbook recordings and 491 workbook clips. The existing preference to hide
  recording 01-1 from study playback is preserved; its source file remains archived.
- Import, compilation, audit, and verification tools, with model license notices.

Vocabulary retains CGE and Mandarin Bean source references in
`data/hsk-vocabulary-sources.json`. Advanced source band 7–9 is subdivided for
app learning paths; this does not establish separate official exam lists.

The book catalogs are published as `data/materials.en.json` and
`data/materials-overrides.en.json`. Their former local filenames used the word
private to distinguish book content; they contain course translations rather than
learner progress. English translations may be editorial drafts.

Original PDF/audio hashes are retained in `data/hsk1-materials/manifest.json`;
`EXPORT-MANIFEST.json` records the hash of every published source/resource file.
Use `/hsk/1/materials` for the web lessons, `/hsk/1/audio` for standalone listening,
and `/hsk/1/vocabulary` through `/hsk/9/vocabulary` for vocabulary lessons.

## Private and generated files excluded

Learner databases, saved personal answers/drafts/history, personal recordings,
credentials, filled .env files, private Git history, caches, installed packages,
generated builds, and downloaded Python/model runtimes are excluded. Source
setup tools and dependency lockfiles remain available.
