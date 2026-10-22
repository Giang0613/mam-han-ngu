# HSK 1 workbook recordings

Source: [FLTRP Global, 新HSK教程1 学练手册](https://global.unipus.cn/textbook/detail?id=_W505WsDRt-rmIrFUXc3Cw), public supplementary resource **新HSK教程1 学练手册-音频**, retrieved 7 October 2026. The public resource is linked under `complementResourceList` in the publisher's book detail response.

The downloaded ZIP contains 34 original MP3s. Its SHA-256 is `44b7f47d3d154d3fb5dde68b8857153d0253f932f214b167552ba6d0fd6e1283`. Metadata, original member names and individual file hashes are retained in `data/hsk1-materials/editorial/workbook-audio-source.json`.

The lesson UI uses 491 excerpts from 28 source recordings, covering 93 sections on 61 workbook pages: missing-initial/final exercises, tone dictation, syllable and tone comparisons, vocabulary matching, intonation, simulated listening and the complete mock listening test. The six foundation-phonetics recordings are preserved in the local source archive.

`workbook-audio-plan.json` binds excerpts to existing item IDs, table rows or section headers. Source section instructions and waveform boundaries establish the mapping. Local ASR helps locate section instructions; it does not supply answer keys or pronunciation scores. Lesson 5 has unusually short pauses, so its ten test questions use explicit reviewed boundaries. The reading order of two reference tables differs from their displayed row order; their bindings explicitly compensate for that difference.

To regenerate MP3 excerpts from the verified originals in `.cache/hsk-workbook-source/original`, run the project's Python environment against `scripts/compile-hsk1-workbook-audio.py`. It preserves source channels and sample rate, includes onset/final padding, checks that every excerpt is audible and unclipped, and confirms that all native lesson files stay unchanged. `npm run test:hsk-workbook-audio` verifies assets, coverage and target bindings.

The frontend offers local recording buttons adjacent to the question or table row. It never synthesizes a blank/question as listening content. All controls share the existing playback owner, stop on navigation or microphone capture, obey mute and allow replay. The supplementary source and audit metadata stay out of the learner interface.

Browser verification covered workbook pages 18–19 and 23–24: individual pinyin blanks, tone dictation, dialogue matching, simulated questions and instructions/examples all played local MP3s. Switching recordings stopped the previous audio; navigating to the next page stopped playback. Listening mode retained one control per excerpt. Question controls remain visible beside Vietnamese instructions when the original Chinese instruction is collapsed. No learner answers or settings were changed during verification.
