# Third-party sources and licenses

The root MIT license covers code and original content that Mandarin Sprout
contributors are entitled to license. It does not relicense third-party data,
fonts, libraries, teaching materials, or services. The product name does not
imply ownership of these components.

| Component | Source | License and scope |
| --- | --- | --- |
| CC-CEDICT Chinese–English dictionary | [MDBG](https://www.mdbg.net/chinese/dictionary?page=cedict) | CC BY-SA 4.0. Retain provenance and transformation notes in `data/cedict-meta.json` and `data/cedict-source.txt`. The JSON conversion preserves original English meanings. This data is not MIT licensed. |
| Hanzi Writer stroke data | [hanzi-writer-data](https://github.com/chanind/hanzi-writer-data) | Arphic Public License. Retain `public/hanzi/LICENSE.txt` and `SOURCE.json`. |
| Manrope font | [Google Fonts](https://github.com/google/fonts/tree/main/ofl/manrope) | SIL Open Font License. Retain `public/fonts/OFL-Manrope.txt`. |
| Three.js 0.186.1 | [Three.js](https://threejs.org/) | MIT. Retain the complete notice in `docs/three-LICENSE.txt`. The garden geometry and textures are original app content. |
| JavaScript libraries | Dependencies pinned in `package-lock.json` | Each package retains its own license. `npm ci` installs the locked versions. |
| Optional audio tools | License copies in `docs/mandarin-audio-licenses` | Python `edge-tts` is GPLv3. A library license does not grant permission to use Microsoft's services. Tools are installed separately; Python environments and audio caches are excluded. |

The dictionary UI separates lexical definitions, measure words, and spelling or
usage notes, and converts inline numeric pinyin references to tone marks. These
display transformations do not replace original records in `data/cedict.json`.
CC-CEDICT attribution and CC BY-SA 4.0 still apply.

## Imported vocabulary and audio

At the project owner's request, this edition also includes 11,715 imported
vocabulary records organized into 812 lessons, selected vocabulary translations,
93 textbook recordings, and 491 workbook audio clips. Vocabulary sources include
CGE and Mandarin Bean; recordings come from the supplied HSK 1 course/workbook
materials. Original rights remain with their respective creators. No open-content
license for these materials was identified in the local source metadata; they
are not relicensed under MIT. See [resource provenance](docs/RESOURCE_SOURCES.md).

PDFs, scans, OCR/page transcriptions, book-page translations, answer keys, and
page layouts remain excluded, along with private models, Python environments,
caches, learner profiles, personal recordings, and credentials. The full private
translation catalog is excluded; only vocabulary-related translation keys are
selected for this release.

The original foundation course and practice paths remain available. Content was
authored with AI assistance and has not been fully certified by teachers. This
is an experimental preview, not an official or endorsed examination course.
