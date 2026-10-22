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

## Materials excluded from the community edition

Publisher PDFs, scans, OCR/transcriptions, translations, answer keys, textbook
audio, and vocabulary imported from those PDFs are excluded. A learner providing
a file does not grant permission to redistribute it.

The export excludes:

- `data/hsk1-materials/**` and `public/hsk1-materials/**`.
- PDF-derived `data/hsk-vocabulary*.json` content, replaced with empty schemas.
- Book audio indexes, answer keys, and book-specific editorial scripts.
- Private models, Python environments, caches, learner profiles, and credentials.

The original foundation course and practice paths remain available. Content was
authored with AI assistance and has not been fully certified by teachers. It is
not an official examination course or endorsed by an examination provider.
