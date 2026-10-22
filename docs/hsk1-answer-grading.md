# HSK 1 answer submission and feedback

The native lesson player now submits answers, grades fixed questions locally and saves the submission with the existing page draft. The initial release covers **697 controls / 792 answer slots**, including the complete workbook listening/reading tests and mock test, pinyin blanks, tone comparisons, matching, intonation, textbook objective questions, number writing and clock times. Free production, personal dialogues and handwriting retain an ungraded response; an arbitrary alternative sentence is not declared wrong.

## Frozen sources

Retrieved from FLTRP's public resource catalogue on 7 October 2026, with `isFree=0` documented by its frontend as free. PDF preview is public; no account, payment, gate or access token was used.

- [Workbook answer key, 新HSK教程1 学练手册-习题答案](https://www.fltrp-clt.com/pages/resource/sigleResource.jsp?modelType=res&resId=21626595b0be4f4e83fd57ada7601b9a&resFormat=4001003), 28 pages, SHA-256 `7220b767e1343502772b52d8b79ca2f68a21a4f819d9f6f44d162e99fc2d999c`.
- [Textbook objective answers, 《新HSK教程1》客观题答案](https://www.fltrp-clt.com/pages/resource/sigleResource.jsp?modelType=res&resId=ad0849f4a58042ffa3757e47f5a50ad2&resFormat=4001003), 13 pages, SHA-256 `9e783c9deb889231a778d6776b65dbc04fc734eeca0fdfda1c9d99eb793104e5`.
- [Publisher listening transcript](https://www.fltrp-clt.com/pages/resource/sigleResource.jsp?modelType=res&resId=75d2071a7a464fbbab6bd8917a63ae62&resFormat=4001003), 50 pages, SHA-256 `be92bfe1c3f64f804ede63c7a9ccec30f53a2f3c1d4ab1c37c308f7ba3f06a79`.

Original publisher reference PDFs and extracted text are included under `public/hsk1-materials/reference`. `answer-key-audit.json` records a source and PDF page for every binding. The displayed Vietnamese explanations are editorial explanations written for the app, not a claim that the publisher supplied Vietnamese solutions. Number-writing keys apply the user-provided textbook number table deterministically. Worked-example blanks use the explicitly printed C / 名字 answer in the user-provided workbook. Clock and warm-up answer pictures were visually inspected; adapted meaning prompts bind by the corresponding word, not by their new position on the website.

## Boundaries and rendering corrections

`compile-hsk1-answer-keys.py` maps the exact question sequence and checks counts. The printed textbook page offset is 15; split question sets and blanks continuing on the next/previous page have explicit bindings. Pinyin in PDF images was read visually and cross-checked with the publisher transcript. No ASR output or LLM answer is used as a grading key.

The raw native JSON remains unchanged. `material-answer-layout.json` and its rendering adapter repair only validated exercise-field defects: long OCR underlines no longer create duplicate answer fields; missing continuation-page input controls are represented by their existing stable text IDs; an image caption mislabelled as a fourth question on workbook page 43 is not graded; option-label inputs, missing input keys and a decoration misread as 4色心 are handled explicitly. Corrected pinyin cells are frozen in the layout file after comparison with workbook pages 22, 55 and 73. Existing answers, including retired field keys, remain in storage.

## Answer and submission policy

- Each answer key is scoped by both **page ID and response key**, because old native IDs such as `native-mark-0` repeat on different pages.
- Pinyin accepts NFC/decomposed equivalents and tone digits; u/ü remain distinct. Tone-writing questions reject a missing or incorrect tone. Initial/final blanks accept the missing written part or complete recorded syllable; final-only unmarked spelling is accepted because that task tests the final.
- Choices accept upper/lowercase and full-width ASCII labels. Fixed Chinese text ignores ordinary spacing and sentence punctuation; it does not silently convert arbitrary Traditional characters.
- Empty, correct, incorrect and ungraded remain distinct. Input is not rewritten during composition. Submit uses an explicit button with a composition guard, not Enter while choosing Chinese candidates.
- Submission stores content revision, first independent answer, last submitted answer, attempt count and timestamp. Identical resubmission does not increment the attempt count. Editing a submitted answer hides stale feedback until it is submitted again. Old drafts without submissions still load.
- Feedback is reconstructed from the frozen key on reload. Saving is awaited and failures are reported while preserving the input. Components are keyed by page ID; late save responses from an unmounted page cannot replace the next page's feedback. There is no XP or ranking award from this practice grading.
- Next can normalize an incoming loopback alias to localhost in `Request.url`. Same-origin validation now compares the Origin to the actual Host header plus the request scheme; a foreign Origin still fails with 403.

## Verification

`test:hsk-answer-grading` checks all source files and bindings, wrong/empty answers, numeric and decomposed pinyin, wrong/missing tones, ü, colliding page-local IDs, multiple blanks, first attempts/retries, repeated submission, JSON resume and the IME guard. `test:hsk-answer-api` uses newly created isolated profiles for save/reload, idempotence, profile isolation, invalid submission fields, legacy drafts, unchanged XP/attempt events and same-origin validation. Existing material API and audio-placement checks remain applicable.

Browser testing uses the 127.0.0.1 hostname to keep test drafts separate from the learner's localhost cookies. It verified incorrect/correct feedback, editing feedback reset, two independent Chinese blanks, saved feedback after reload and navigation. Chinese text entry and the composition guard were exercised separately; this is not a real-device Chinese mobile keyboard test. Learner settings and their existing answers were not changed.
