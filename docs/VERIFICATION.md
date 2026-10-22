# Kết quả kiểm tra — 22/10/2026

Kiểm tra trên Windows x64, Node.js 24.19.0, với bản nguồn cộng đồng và cơ sở dữ liệu mới.

| Kiểm tra | Kết quả |
| --- | --- |
| Cài mới theo lockfile | `npm ci --ignore-scripts` thành công, 658 gói; `better-sqlite3` mở và truy vấn DB trong bộ nhớ được. Lệnh `npm ci` thông thường gặp bước rebuild native/Python trên máy này; cách thay thế có trong README. |
| `npm run test:study` | Qua: 48 bài, 120 cấu trúc, 189 từ, 384 bài tập nền tảng; kiểm tra đáp án, ü, gợi ý, chống cộng XP trùng, phiên bản và lịch SM-2. |
| `npm run test:hsk` | Qua: 9 bậc mục tiêu, 80 phần, 278 câu tự chấm, 67 nhiệm vụ mở; ID, đáp án và tiến độ. Đây là xác minh cấu trúc/kỹ thuật, không chứng nhận ngôn ngữ hay kỳ thi. |
| `npm run build` | Qua biên dịch, TypeScript và tạo trang production. |
| `npm run test:api` | Qua trên server production với DB mới: hồ sơ tách biệt, chấm phía server, gửi trùng, xung đột revision, tiếp tục sau tải lại, từ điển, CSRF, provider chưa cấu hình và chặn ghi XP trực tiếp. |
| `npm run test:source` | Qua: hash của các tệp nguồn, loại dữ liệu riêng, schema từ PDF rỗng, cấu hình mẫu không có giá trị và đầy đủ tệp ghi công. |
| Trình duyệt | Tên/logo mới ở chiều rộng mặc định và 390 px; mở bài nền tảng trong bản cộng đồng; chọn sai được giải thích và lưu; tải lại còn lượt đã làm; trang sách có thông báo và đường dẫn quay lại học. |

Kiểm tra DB mới đã tìm và sửa lỗi khởi tạo hồ sơ khi chưa tồn tại bảng `users`/`flashcards` cũ. Luồng chuyển dữ liệu cũ chỉ đọc các bảng thực sự tồn tại; các định danh cookie và phiên bản nội dung được giữ để tương thích.

Chưa kiểm tra microphone/IME trên điện thoại thật, chất lượng phát âm, provider AI/Azure trực tiếp hoặc chạy workflow trên GitHub. Không có khóa dịch vụ, dữ liệu người học, môi trường Python, node_modules hoặc sách/audio riêng trong ZIP nguồn. Hồ sơ QA chỉ dùng ở bản thử riêng; không lấy thống kê QA làm người học thực.

## English localization verification

English is the default, with a persistent Vietnamese language option. The English coverage suite passed for 648 UI entries, 189 meanings, 48 lesson titles, 120 grammar entries, and 798 exercises. Hanzi, pinyin, grading keys, React keys, and learner input were checked.

The community production build and API suite passed, including server grading, idempotency, reload persistence, and profile isolation. Additional HTTP checks confirmed English/Vietnamese dictionary results, English errors, private cache headers, English HTML language, and empty publisher vocabulary in the community edition.

Browser checks covered the main navigation routes, English lesson choices, retaining a selected answer while switching languages, and downloading the English offline pack. A fresh production reading page had no console errors or hydration warnings. Advanced English translations remain editorial drafts; technical coverage does not certify language quality.

## Translation regression fixes — 22 October 2026

Regression checks cover the reported dictionary, HSK grammar, and tone-card issues. Rendered pinyin preserves neutral tones and tone marks. Authored English covers all 54 HSK grammar headings and notes. Dictionary lookup matches Hanzi and the selected tone-sensitive reading, deduplicates glosses, retains lexical provenance, builds lesson titles from topic/sequence, and refreshes fetched vocabulary when the locale changes.

Study, HSK, i18n unit tests and read-only dictionary API tests passed. Browser checks confirmed all nine HSK levels, the five tone cards, and switching Vietnamese/English dictionary results while preserving IDs and pinyin. Other main navigation screens were scanned for remaining Vietnamese UI text and accessible labels.

## Dictionary notation presentation — 22 October 2026

The format regression suite scanned all 125,208 CC-CEDICT entries and retained 2,092 classifier references. Display text contains no raw CL: metadata, numeric pinyin brackets, or traditional/simplified reference separators. Tests retain grammatical qualifiers, parenthesized semicolons, alternative spellings, and tone marks. Source records remain unchanged.

The dictionary UI separates measure words and spelling notes from the main meaning, and spaces attribution from the Save button. Read-only API tests check structured classifier data as well as clean English meanings.

## English editorial review and dimensional interface - 22 October 2026

The editorial layer corrects shared guidance across all 80 HSK practice units, six conversation scenarios, lesson names, reading text, audio errors, and interface labels. Reviewed templates override stale generated full sentences; broad legacy templates cannot shadow known labels. English counts handle zero, one, and multiple items.

The English UI suite checked 737 accented interface strings and regressions for translation priority, plural wording, pinyin, and HSK guidance. Existing i18n, dictionary API, and full-corpus dictionary formatting tests passed. The canonical production build passed; it retains a pre-existing Turbopack warning about the local generated audio cache.

Browser checks used the default desktop viewport and a temporary 390 x 844 viewport. Home, grammar, review, dictionary, HSK, HSK 1, a listening unit, reading, a reading detail, a grammar exercise, speaking/writing practice, conversation, placement, progress, and settings were checked. Mobile overflow found in progress and recall ratings was corrected and rechecked. Switching English to Vietnamese and back preserved a selected Chinese sentence tile without submitting an attempt. Dictionary measure words remained separate and raw notation was absent. The viewport was reset after verification.

The decorative CSS 3D scene is hidden from assistive technology, uses no canvas or perpetual animation loop, and respects reduced-motion and touch preferences. This was a responsive browser check, not microphone/IME certification on physical devices.

## Chinese study garden redesign - 22 October 2026

The home composition now includes an original Three.js miniature garden, an editorial heading, carved Hanzi path details, and a paper vocabulary card. All learning links, profile counters, and saved data remain connected to the existing learning flow.

The canonical production build, TypeScript check, English UI audit (740 accented literals), and i18n regression suite passed. Browser checks confirmed English and Vietnamese at the default desktop size and 390 x 844. Both phone headlines fit without clipping, and the study CTA is visible before the scene. The temporary viewport override was reset.

The live garden reports 37 draw calls and 58,982 rendered triangles. Static geometry is merged by material. Navigating to the dictionary removes the canvas; returning home recreates one canvas. The original saved word, zero XP, and study counts were preserved. The static vector loading illustration was also inspected. Context loss and OS reduced-motion preferences are handled in code; physical-device GPU failure was not fault-injected.

Three.js 0.186.1 and matching type definitions are pinned. The current PCFShadowMap API is used; the deprecated PCFSoftShadowMap option was removed after browser diagnostics. The full Three.js MIT notice is included in the source package.
