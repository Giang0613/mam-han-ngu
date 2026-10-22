# English and Vietnamese

English is the default interface language. The language selector saves a one-year
`mam_locale` cookie; Vietnamese remains available. Existing lesson URLs and learner
identifiers stay compatible with earlier versions.

The English interface is called **Mandarin Sprout**; the Vietnamese brand is
**Mầm Hán Ngữ**. English covers navigation, accessible labels, settings, dictionary
meanings, original foundation lessons, grammar, HSK practice, and offline text study.
The AI tutor requests explanations in the selected language when configured.

`src/lib/i18n/ui.en.json` contains interface copy. `lexicon.en.tsv` and `core.en.tsv`
contain manually authored foundation vocabulary, lesson titles, and grammar.
`npm run build:i18n` compiles overrides and regenerates the English offline pack.
`npm run test:i18n` checks 648 interface strings, 189 vocabulary meanings, 48 lessons,
120 grammar entries, 798 exercises, answer IDs, Hanzi/pinyin, form values, and stable
React keys. Run it with the study and HSK tests after changing content.

Broader English content in `content.en.json` includes machine-assisted drafts made
locally with Helsinki-NLP/opus-mt-vi-en, using the gaudi CTranslate2 conversion at
revision `5813c7d77fc31cf9bac8569ec655215750435b21`. Application text was not sent to a
translation service. Model weights and preparation caches are excluded from the
source release. The model is published under Apache-2.0:
https://huggingface.co/Helsinki-NLP/opus-mt-vi-en

Automated coverage is not linguistic certification. Advanced explanations and
personal textbook translations need editorial review. Keep Chinese examples and
the degree of certainty of each explanation intact when proposing corrections.
Neither HSK alignment nor translation quality is certified by an exam authority.

User names, written answers, drafts, and conversation history remain as entered.
English localization does not rewrite stored learner work or change grading keys.
Personal textbook translations live in the ignored server-only
`data/i18n-private.en.json`; publisher-derived translations are excluded from the
community export along with PDFs, recordings, and imported vocabulary.
Local editorial corrections use `data/i18n-private-overrides.en.json`, which is
also ignored and excluded from the release. English textbook lines retain the
assisted-translation label until their English copy has been reviewed.

Pinyin elements (`lang="zh-Latn"`, `.pinyin`, `.reading-pinyin`, and pinyin charts)
are protected from UI translation, including unmarked neutral tones such as `ba`.
Only authored templates may perform wildcard substitutions. Machine-generated
templates must never be used as global matching rules.

Dictionary English uses provided English or CC-CEDICT matched by Hanzi and the
selected, tone-sensitive reading. Proper-name capitalization is preserved; `ba`
is distinct from `bā`, and `bái` from `Bái`. Repeated glosses are deduplicated.
Dictionary provenance applies to the lexical meaning, not to draft example
translations. Missing exact matches retain an explicit draft label. Topic lesson
links use the translated topic and the original sequence number.

`hsk.en.tsv` contains authored English headings and notes for all 54 HSK grammar
entries. After starting a local server, `npm run test:i18n-api` performs read-only
checks of dictionary meanings, pinyin, lesson titles, English search, and cache
isolation; set `STUDY_TEST_ORIGIN` for a different port.

`dictionary-format.ts` builds a presentation view of the imported dictionary:
lexical definitions, measure words, and spelling/usage notes are separate fields.
References such as `漢字|汉字[han4 zi4]` display as `汉字 (hàn zì)`. Numeric readings
use the same pinyin formatter as headwords. Measure-word metadata is retained in
structured form, including traditional spelling, rather than discarded. This
does not rewrite imported records, learner data, or grading keys.

The source is the MDBG V1-compatible export identified in `cedict-meta.json`;
the presenter follows the documented [reference syntax](https://cc-cedict.org/wiki/references)
and [V1 classifier notation](https://cc-cedict.org/wiki/syntax#classifiers).
`npm run test:dictionary-format` checks the reported cases and scans all 125,208
included entries for raw notation leaking into display text.

The separate `reviewed.en.json` editorial layer corrects shared HSK instructions,
common-mistake descriptions, conversation scenarios, resource labels, and audio
errors. Reviewed exact strings and specific reviewed templates take precedence
over generated translations. Generic legacy templates do not override known UI
labels. Regenerating the translation catalog does not overwrite this layer.

`counts.ts` handles English singular/plural wording in key learning screens.
`npm run test:english-ui` audits accented UI literals as well as precedence,
count boundaries, pinyin preservation, and shared HSK practice guidance.
See [the interface notes](INTERFACE.md) for the dimensional design and motion
behavior.
