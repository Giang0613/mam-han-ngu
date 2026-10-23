# Handwriting library

The practice page now offers **3,039 distinct Hanzi**, replacing the former
42-character suggestion list. The characters are the complete union of Hanzi in
this project's 11,715 supplied vocabulary records. This is a vocabulary-derived
practice library, not a claim of official HSK character-syllabus coverage.

Search accepts characters, whole words, pinyin (including nǚ / nv3 / nu:3), and
vocabulary meanings. Filters use the source vocabulary bands HSK 1–6 and 7–9,
plus four stroke-count ranges. A character can appear in several bands. The API
returns 28 choices per page; the corpus remains on the server rather than being
bundled into the initial client code. Selected characters show stroke counts,
contextual word examples and common readings. Each character in a word can be
opened separately. Animations and guided tracing remain separate from grading.

## Sources and reproduction

- [Hanzi Writer documentation](https://hanziwriter.org/docs.html#loading-character-data)
  describes custom character-data loading and the single-character writer.
- [hanzi-writer-data](https://github.com/chanind/hanzi-writer-data), version **2.0.1**,
  supplies the unmodified stroke and median JSON files. The complete local set
  totals 8,531,887 bytes; only the selected character is fetched by the writer.
  The Arphic Public License is retained at `public/hanzi/LICENSE.txt`.
- Vocabulary provenance stays in `data/hsk-vocabulary-sources.json`.
  `public/hanzi/SOURCE.json` records the source version and vocabulary SHA-256.
- Display readings preserve the vocabulary spelling, filtered against pinyin-pro
  readings, with authored common-reading overrides. Erhua is not split into
  invented syllables. English example meanings use the existing translation
  pipeline and may still need editorial review.

Run `npm ci` and `npm run prepare:writing` to regenerate the index and copy stroke
files from the locked dependency. The maintained generator is
`scripts/prepare-strokes.ts`; there is no second competing stroke importer.

## Verification

`npm run test:writing` verifies every character, stroke file, upstream byte hash,
example, source band, all pagination pages, polyphones, neutral tone and ü search.
`npm run test:speech-reading` checks speech hints across the library; standalone
nasal ǹg keeps its spelling and uses the existing Hanzi speech path, because the
speech phone inventory does not support that explicit hint.

After a production build, point `STUDY_TEST_ORIGIN` at that server and run
`npm run test:writing-api`. It checks both interface languages, query validation,
missing characters, local stroke delivery and example translations. Local browser
checks also cover selection, filters and the missing-stroke error state. A failed
stroke request does not enable tracing or report a completed attempt.
