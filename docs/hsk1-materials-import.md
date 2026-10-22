# HSK 1 supplied learning materials

Import revision: `hsk1-books-2026-10-07-v1`. The learner supplied three scanned PDFs and the textbook MP3 archive. All operations used local OCR and local translation; no document content was exported to an OCR/translation service.

## Coverage and lesson mapping

- Textbook: 144 PDF pages; printed page 1 is PDF page 16.
- Workbook: 139 PDF pages; printed page 1 is PDF page 8.
- Separate writing file: 15 pages for lessons 8–15. Writing sections elsewhere in the books are retained with those books. This file contains no separate worksheets for lessons 1–7.
- Original audio ZIP: 93 MP3s, 7 each for lessons 1–3 and 6 each for lessons 4–15. The ZIP is textbook audio. Workbook listening references are a distinct recording set and must not be linked to textbook tracks just because their numbers coincide.
- The archive maps all 298 original pages exactly once. The learner flow now contains 15 lessons and a review section: 272 content parts, excluding book introductions, blank pages, intermission and back covers. The former introduction URL redirects to lesson 1.
- Original PDFs and MP3s are byte-identical copies with SHA-256 checks in `data/hsk1-materials/manifest.json`. Original page images are under `public/hsk1-materials/pages`.

## Native web lessons

The learner interface renders HTML text, tables, dialogues, vocabulary and directly editable answer fields. It does not display page scans or PDF downloads. Original assets remain in the archive for provenance and internal comparison. Picture choices have Vietnamese scenario descriptions; handwriting grids use the existing Hanzi Writer stroke player.

OCR sidecars retain every recognized box, original text and confidence. Native DTOs under `data/hsk1-materials/native` are compiled from the cleaned content plus visually checked edits. Dialogue vocabulary sidebars are read as separate columns. Phonetics tables, Latin-only listening choices, tone marking, neutral tone, tone sandhi, ü, syllable separation and handwriting content have explicit typed representations. `native-coverage.json` records each included part. Pinyin and Vietnamese translations can be toggled; low-confidence unreviewed OCR audio is disabled.

`translations-edited.json` and `scripts/hsk1-native-*.ts` contain editorial corrections. The subsequent language/layout revision uses the frozen `translation-audit.json` and `editorial/translations.tsv` ledger to revise 1,557 unique previously automatic translations. It also corrects contextual senses (time 点/分, money 元/块/角/毛/分, 想 as “miss” in lesson 3), restores sentence continuations, and retypes the number/time/money tables from the source. The final native DTOs contain no unrevised machine translations. This is an AI editorial pass, not a claim of review or certification by a human Chinese teacher; the method is recorded in `editorial/review.json`.

Pinyin is centered directly under each word or character group. The alignment preserves supplied tones, neutral syllables, names, apostrophes and erhua; the fixed course word list ensures the server and browser produce the same layout. Instructions and grammar explanations are shown in Vietnamese with optional Chinese detail. Initial/final inventories are independent lists, not misleading row-to-row compatibility tables.

Audio alignment revision `hsk1-audio-2026-10-07-v2` uses the 93 explicit dialogue, vocabulary and tongue-twister markers in the textbook. It excludes bonus video IDs (e.g. `4-1`) and group sizes (e.g. `3–4`), and recognizes markers adjoining `NewWords` without a space. `src/lib/hsk/material-audio-index.json` records the content type, dialogue number, marker page and continuation pages. `editorial/audio-alignment-audit.json` retains the source rows and confirms all 93 original MP3 SHA-256 hashes. This is source-marker/file-integrity verification, not an acoustic transcription claim.

The reading screen places each vocabulary recording immediately before its word group, with the recording ID and content label. The vocabulary table-of-contents link lands on the player so both player and words stay together. Dialogue/phonetic recordings keep their original position above the content. The two missed vocabulary sidebars on textbook parts 40 and 46 are regrouped using their original item IDs. The learner requested removal of recording 01-1 from all study modes: `materialAudio` excludes this exact ID, leaving all other 92 recordings unchanged. The original asset/index remains in the archive, and native page metadata uses only playable recordings. Textbook part 16 retains vocabulary 01-2; part 19 retains the tongue-twister recording 01-7. The listening tab shows only recordings relevant to the current textbook part, with separate dialogue/vocabulary labels. Speaking shows matching dialogue recordings, never the first recording of the entire lesson or a vocabulary track. Workbook/writing parts do not inherit textbook recordings. Only one set of players is visible in each mode. Playback stops when switching modes or leaving the part. Speaker labels use explicit Vietnamese names. Visual content edits separate restaurant-screen text and grammar sidebars from spoken dialogue; joined sentences are translated as complete utterances rather than concatenated dictionary glosses.

No phonetic question is auto-graded from OCR. Native question fields save responses, notes and learner-marked completion with the existing server-side learner cookie. Old numeric answer fields remain readable and editable. They do not award exam scores or skill mastery. Microphone recordings remain ephemeral, using the existing recording component. Workbook listening tasks explicitly disclose that the matching workbook recording set was not supplied; textbook tracks are never substituted.

At the learner's request, pair/group/role-play activities and their worked role-play examples are omitted from the displayed lesson and its table of contents. No replacement activity label or explanatory banner is displayed. Their source content remains archived with `practiceMode: with-others`. Previously mistaken response fields are retired, and existing saved values remain in the learner record without being rendered as answer inputs. Independent phonetics/review sections that OCR placed in the same block are split out and retained; vocabulary mixed with group instructions is regrouped. Mixed exercise blocks retain actual comprehension questions and their answer fields.

For textbook part 27, the original ZIP contains `HSK 1 Textbook/Lesson 03/03-3.mp3`; its supplied SHA-256 matches the app copy. The printed marker 3-3 is attached to Text 2 (Annie and Chen Tianzhong discussing the girlfriend photo). Block `textbook-027-block-2` explicitly binds track 3, and the reader places its player immediately before that dialogue rather than above the preceding grammar drills. The 谁 tip is separate from the four spoken turns. The first four phrases (我老师、我学生、你同学、我妈妈) are possessive phrases continuing the 的 grammar section; the supplied ZIP has no separate recording for that drill. The existing individual synthesized-reading buttons remain available. Explicit block bindings take priority over page-header placement, and the block navigation link includes the corresponding player.

`reading-overrides.json` records specific corrections checked visually against the scan. For example, workbook page 8 teaches 啊 as `á`, rather than the dictionary's neutral `a`; its example playback uses a synthesized, isolated rising a2 reference from the Microsoft voice carrier 啊？你说什么？. Only the target syllable is played; the carrier words are excluded by WordBoundary timing. `editorial/a2-reference-audit.json` records waveform/rising-pitch checks and provenance. This sample is not the original workbook audio or a learner pronunciation assessment. The vegetables label misrecognized as 莱 is restored to 菜 (`cài`). Original OCR confidence remains recorded; visual corrections have a separate flag. Uncertain rows retain their source context without promoting an unreliable pinyin or audio sample.

## Local processing dependencies

- RapidOCR ONNX runtime 1.4.4 (PaddleOCR v4 models), PyMuPDF 1.26.7.
- [Helsinki-NLP Chinese/Vietnamese OPUS model](https://huggingface.co/Helsinki-NLP/opus-mt-zh-vi), converted with CTranslate2 4.6.0 to int8; SentencePiece 0.2.1. The original CSC archive `opus-2020-06-17.zip` SHA-256 is `4051997e89f4a016fd043eb4a59603868f70e1200331c11169de7ee0e91911bf`. The archive includes a CC BY 4.0 license; preserved in `docs/hsk1-model-licenses`. Model metadata and original README are also retained there. No provider API key is needed to read the precomputed translations.
- Model weights and processing environments stay in ignored `.cache`; precomputed lesson JSON and learning assets remain beside the checkout used to run the web server.

## Re-import and verification

```powershell
.cache/mandarin-audio/venv/Scripts/python.exe -m pip install -r scripts/hsk1-import-requirements.txt
.cache/mandarin-audio/venv/Scripts/python.exe -X utf8 scripts/import-hsk1-materials.py --source ./source-materials
.cache/mandarin-audio/venv/Scripts/python.exe -X utf8 scripts/translate-hsk1-materials.py
npx tsx scripts/compile-hsk1-materials.ts
.cache/mandarin-audio/venv/Scripts/python.exe -X utf8 scripts/extract-hsk1-blanks.py
npx tsx scripts/compile-hsk1-native.ts
npx tsx scripts/compile-hsk1-audio-index.ts
npx tsx scripts/compile-hsk1-native.ts
npx tsx scripts/verify-hsk1-materials.ts
npx tsx scripts/verify-hsk1-native.ts
npx tsx scripts/verify-reading-alignment.ts
npx tsx scripts/verify-hsk1-audio-alignment.ts
node scripts/verify-hsk1-materials-api.mjs
```

The translation re-import expects the local CT2 model, `source.spm`, and `target.spm` in `.cache/hsk1-translator`. The app's learner-facing page reader uses precomputed files, without loading these models. Original MP3 delivery uses the existing server, without TTS generation or a third-party playback request.
