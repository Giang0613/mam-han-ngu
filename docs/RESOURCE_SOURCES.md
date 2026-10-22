# Imported vocabulary and book audio

**Experimental preview.** Language content and learning features still need
editorial and usability review. These resources are included at the project
owner's request and retain their source attribution. The repository's MIT code
license does not relicense third-party definitions, examples, translations, or
recordings. No additional open-content license was identified in the local source
metadata; do not infer redistribution rights from the code license.

## Vocabulary

The corpus has **11,715 source records** organized into **812 vocabulary lessons**.
Records may have distinct readings or source entries; the record count is not a
claim of 11,715 unique Hanzi strings. App levels 7, 8, and 9 subdivide one shared
advanced source and do not establish separate official exam lists.

| Source | Records | Provenance |
| --- | ---: | --- |
| CGE, source levels 1–6 | 6,115 | [CGE](https://cge.edu.vn), learner-supplied vocabulary PDFs |
| Mandarin Bean, source band 7–9 | 5,600 | [Mandarin Bean](https://mandarinbean.com), learner-supplied vocabulary PDF |

`data/hsk-vocabulary-sources.json` retains source filenames, hashes, import date,
and record counts. The PDF files themselves are excluded. Entries retain IDs,
readings, source row/page references, examples, and translation status. Lesson
grouping and prerequisites are in `data/hsk-vocabulary-lessons.json`.

`src/lib/i18n/vocabulary.en.json` includes only translation keys matching this
vocabulary corpus or its generated practice prompts. The full private book-page
translation catalog is excluded. English translations can be drafts; matching
CC-CEDICT glosses keep CC-CEDICT provenance and its separate license.

## Audio

The community source includes **93 textbook MP3 recordings** and **491 workbook
listening clips** from the HSK 1 materials supplied with the local project.
Publisher/performer ownership remains unchanged. The source metadata does not
identify an open license for these recordings.

File IDs and URLs are retained in `src/lib/hsk/material-audio-index.json` and
`src/lib/hsk/workbook-audio-clips.json`. SHA-256 hashes for every included file
are recorded in `EXPORT-MANIFEST.json`. The archive is approximately 255 MiB.
The existing preference to hide recording `01-1` from study playback is preserved;
584 audio files are included and 583 appear in the listening library.

The audio library at `/hsk/1/audio` supports lesson filters, pagination, download,
playback speed, and one active player. Recordings load on demand.

## Excluded material

PDFs, book scans, OCR/page transcriptions, book-page translations, answer keys,
page layouts, learner databases, credentials, and personal recordings are not
included. The book-page routes remain unavailable; vocabulary and the standalone
audio library work independently of them.
