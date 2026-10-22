# Từ vựng PDF · nhập ngày 07/10/2026

Kho từ vựng gồm 11.715 mục nguồn, được giữ riêng theo cấp, thứ tự và cách đọc. Đây không phải số từ độc nhất hoặc chứng nhận bao phủ toàn bộ đề cương CTI hiện hành.

| Bậc học trên web | Mục từ | Bài theo chủ đề |
| --- | ---: | ---: |
| HSK 1 | 499 | 42 |
| HSK 2 | 772 | 59 |
| HSK 3 | 973 | 69 |
| HSK 4 | 1.000 | 72 |
| HSK 5 | 1.071 | 74 |
| HSK 6 | 1.800 | 124 |
| HSK 7 | 1.874 | 125 |
| HSK 8 | 1.866 | 124 |
| HSK 9 | 1.860 | 123 |
| Tổng | 11.715 | 812 |

## Nguồn và cách phân bổ

Sáu file CGE/Phạm Ngọc Vân giữ cấp người học đã cung cấp, pinyin, nghĩa Việt, từ loại và ví dụ khi có. File HSK 1 đánh số đến 500 nhưng không có STT 265, nên nhập 499 dòng thật. HSK 3 có hai lỗi đánh STT: 634 thay 624 và 658 lặp thay 659; giữ mọi dòng và dùng số thứ tự trích xuất làm ID riêng. Các ô gộp được khôi phục; không xóa mục đồng hình hay nhiều nghĩa. Các lỗi và sửa lỗi giải mã chữ 口 của PDF được lưu trong báo cáo JSON.

`New-HSK-Vocabulary-Level-7-9.pdf` của Mandarin Bean có 235 trang, 5.600 mục chữ/pinyin/từ loại, không có nghĩa Anh hoặc Việt. Web đối chiếu cùng chữ và cách đọc với PDF cấp thấp; nghĩa Anh còn lại lấy từ CC-CEDICT, rồi chuẩn bị nghĩa Việt. Các mục khác cách đọc như 挨 āi/ái được giữ riêng, không trộn nghĩa.

Nguồn 7–9 không chỉ ra ba cấp từ vựng riêng. Mỗi chủ đề được xếp theo tần suất tương đối (từ điển Jieba có sẵn), độ dài và dấu hiệu thành ngữ/văn viết, rồi chia ba bước từ nền tảng đến chuyên sâu. Đây là đề xuất học `superweb-study-allocation-v1`, chưa được giáo viên duyệt. Mỗi mục vào đúng một bài; mỗi bài tối đa 16 mục, có liên kết tới bài tiếp theo. Quan hệ trước/sau là hướng dẫn, không khóa quyền xem bài.

19 chủ đề gồm ẩm thực, sức khỏe, đi lại, giáo dục, công nghệ, kinh tế, pháp luật, môi trường, văn hóa, truyền thông, nghiên cứu, công việc, nhà cửa, con người, thời gian/số lượng, cảm xúc, thể thao, hành động và diễn đạt/thành ngữ. Từ thường gặp được gán chủ đề thủ công; phần còn lại dùng nghĩa để gợi ý chủ đề. Chủ đề và độ khó vẫn cần thẩm định sư phạm.

## Nghĩa và cách đọc

- `provided`: 6.226 mục giữ/đối chiếu nghĩa từ các PDF người học.
- `adapted`: 341 mục trợ lý biên soạn hoặc bổ sung; chưa được giáo viên duyệt.
- `draft`: 5.148 mục dịch tự động, hiện nhãn rõ trong từ điển. Giữ đầy đủ nghĩa Anh để đối chiếu; bản Việt thường chọn hai nghĩa chính, không cam kết đầy đủ mọi nghĩa chuyên ngành.

Model dịch NLLB-200 distilled 600M chạy trên CPU cục bộ, ONNX q8, revision `261c31d1a5732c67cdd16d80e8d6088507c7ccea`, qua Transformers.js 3.8.1. Đã lọc dẫn chiếu/tên họ/nghĩa đen trước một lượt sửa 86 bản dịch và biên soạn bổ sung các mục thiếu nghĩa, một số thuật ngữ/thành ngữ. Không sử dụng dịch vụ trả phí hoặc gửi PDF tới dịch vụ dịch bên ngoài. Chưa thẩm định thủ công toàn bộ 5.148 bản nháp.

Giữ `pinyinSource`, chữ gốc, trang và STT trong dữ liệu. Chữ hiển thị được chuẩn hóa Unicode và tách chú thích; sửa âm nhẹ cho chín từ thông dụng (包子, 本子, 帽子, 袜子, 椅子, 桌子, 杯子, 儿子, 名字) và nối phụ âm bị ngắt do xuống dòng PDF. Không tự thay dấu ü thành u. Các ví dụ nguồn và cách đọc đa âm vẫn cần rà soát chuyên môn.

Nút nghe dùng Kokoro TTS cục bộ đã có, có trạng thái chuẩn bị/phát/dừng; không phải audio đề thi. Chữ đa âm đứng riêng có thể cần nghe trong một câu để đúng nghĩa. Không suy ra điểm phát âm của người học từ chức năng này.

## Học và lưu kết quả

Mỗi mục tạo hai câu: chữ → nghĩa Việt và nghĩa Việt → chữ. Lựa chọn có pinyin và nút nghe khi là tiếng Trung. Đáp án dùng ID của mục, chấm trên máy chủ và lưu theo cookie hồ sơ. Lượt trùng mã không cộng XP lặp; dùng gợi ý không tính đúng độc lập. Có tiếp tục lần học, xem kết quả và lưu từ để ôn SM-2. Kho từ đầy đủ chỉ đọc trên server; danh sách phân trang 24 mục/bài, không đưa 11.715 mục vào JavaScript client.

## Kiểm tra

`npm run test:vocabulary`: đủ dòng nguồn, 9 cấp, không trùng ID, không bỏ/sử dụng lặp mục trong bài, tối đa 16 từ, chuỗi bài, cách đọc riêng, 23.430 câu có 4 lựa chọn riêng và chấm đúng/sai, tìm pinyin/ü/Việt/Anh, nguồn và thống kê.

`npm run test:vocabulary-api`: lọc từng cấp, trang cuối 7–9, lưu thẻ/SM-2, chấm trên server, sự kiện trùng/xung đột, gợi ý/XP, tải lại, hai hồ sơ độc lập, CSRF, đường dẫn sai. Test tạo và xóa chính các hồ sơ QA của nó, không sửa dữ liệu người học.

`npm run test:study` xác nhận các luồng trước đó vẫn hoạt động. Production build sử dụng `.next-production`, giữ server dev và dữ liệu cá nhân.

## Giấy phép và dữ liệu

CC-CEDICT / MDBG theo CC BY-SA 4.0; nghĩa Anh và bản dịch dẫn xuất giữ nguồn này. Các PDF giữ quyền của CGE/Phạm Ngọc Vân và Mandarin Bean. [NLLB-200](https://huggingface.co/facebook/nllb-200-distilled-600M) / [Xenova ONNX](https://huggingface.co/Xenova/nllb-200-distilled-600M) ghi model CC BY-NC 4.0, phạm vi nghiên cứu. Model và cache dịch nằm trong thư mục công việc của Codex, không được nhúng hoặc cung cấp qua website.

Các file dữ liệu: `data/hsk-vocabulary.json`, `data/hsk-vocabulary-lessons.json`, `data/hsk-vocabulary-sources.json`, `src/lib/hsk/vocabulary-summary.json`, `docs/hsk-vocabulary-import-report.json`. Quy trình trích xuất, bản dịch gốc và bản sửa nằm tại workspace Codex `work/hsk-vocabulary` để đối chiếu và tiếp tục biên tập.
