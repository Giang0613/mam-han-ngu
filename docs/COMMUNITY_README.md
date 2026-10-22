# Mầm Hán Ngữ

Ứng dụng mã nguồn mở học tiếng Trung dành cho người Việt. **Gieo một chữ, mở một thế giới.**

Bản cộng đồng kế thừa ứng dụng đã phát triển, có tên, biểu tượng mầm cây và nhận diện riêng. Đây là bản chạy trên máy của người học/người phát triển; chưa có một dịch vụ tài khoản công khai.

## Có gì trong bản này?

- 48 bài nền tảng, 8 chặng, 189 từ và 120 cấu trúc với giải thích tiếng Việt.
- Chọn đáp án, xếp câu, gõ chữ; máy chủ chấm theo đáp án, giữ phiên bản, chống gửi trùng và lưu tiến độ trong SQLite.
- Ôn từ bằng SM-2, thẻ đã lưu, sổ lỗi, mục tiêu học và xuất tiến độ JSON.
- Bộ bài luyện phân theo mục tiêu HSK, bài đọc và hội thoại tình huống tự biên soạn. Chưa được giáo viên thẩm định hoặc chứng nhận tương đương kỳ thi.
- Từ điển Trung–Anh CC-CEDICT và từ vựng tiếng Việt của khóa học; Hanzi Writer với dữ liệu nét cục bộ.
- Gói luyện chữ ngoại tuyến. Kết quả ngoại tuyến chưa đồng bộ vào tiến độ máy chủ.

**Không kèm học liệu sách của bản cá nhân.** PDF, ảnh quét, bản dịch/OCR, đáp án, audio sách và kho từ nhập từ PDF đã được tách khỏi bản nguồn. Các trang liên quan có thông báo rõ; người học vẫn dùng đầy đủ vòng học nền tảng. Xem [nguồn và giấy phép](../THIRD_PARTY_NOTICES.md).

## Bắt đầu

Yêu cầu Node.js 24, npm và hệ điều hành hỗ trợ `better-sqlite3`.

Trên Windows x64/Node.js 24, nếu `npm ci` chạy `node-gyp` không cần thiết và báo thiếu Python/compiler, có thể dùng `npm ci --ignore-scripts` với lockfile này: gói `better-sqlite3` đã có binary tương thích. Cách này được kiểm tra bằng cơ sở dữ liệu trong bộ nhớ và build từ bản nguồn. Nếu nền tảng không có binary phù hợp, cần Python và bộ công cụ biên dịch C++ theo hướng dẫn của thư viện. Không đưa `node_modules` hoặc binary cục bộ vào gói nguồn.

```sh
npm ci
npm run db:migrate
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Mở `http://localhost:3000`. Vào các bài nền tảng từ **Bài nền tảng** trên trang chủ hoặc `/curriculum/1`.

```sh
npm run test:study
npm run test:hsk
npm run test:source
npm run build
npm run start -- --hostname 127.0.0.1 --port 3000
```

Build dùng `.next-production` riêng. Dừng dev trước khi chạy production trên cùng cổng. `local.db` được tạo trên máy chạy; không đưa file này vào Git. Khi cần sao lưu, dùng SQLite backup hoặc chức năng xuất tiến độ; không sao chép đơn lẻ DB đang ghi WAL.

## Tùy chọn

Sao chép `.env.example` thành `.env.local` nếu cần cấu hình provider. Không dùng `NEXT_PUBLIC_*` cho khóa bí mật. Khi chưa cấu hình, ứng dụng không tạo điểm phát âm hoặc phản hồi AI giả.

Giọng mẫu Microsoft được thiết lập bằng `python scripts/setup-mandarin-audio.py` (Python 3.12+). Khi cache chưa có, văn bản học được gửi đến dịch vụ trực tuyến; dịch vụ có thể không sẵn sàng. Bản ghi micro không đi qua luồng TTS. Kiểm tra điều khoản provider trước khi vận hành dịch vụ cho người khác.

CC-CEDICT đi kèm có metadata ghi nhận bản tải. Có thể cập nhật bằng `node scripts/import-cedict.mjs`; dữ liệu cập nhật vẫn theo CC BY-SA 4.0.

Các định danh lưu trữ cũ được giữ có chủ đích để không mất tiến độ khi nâng cấp. Đổi tên thương hiệu không đổi chủ sở hữu của thành phần bên thứ ba hoặc tạo lịch sử người dùng mới.

## Tham gia

Đọc [CONTRIBUTING.md](../CONTRIBUTING.md) và [SECURITY.md](../SECURITY.md). Ưu tiên hiện tại: giáo viên rà soát nội dung, cải thiện khả năng tiếp cận, kiểm tra thiết bị thật, rồi bổ sung tài khoản và đồng bộ.

Mã và nội dung nguyên gốc: MIT. Thư viện, font và dữ liệu mở: giấy phép riêng trong [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md). Chưa có thống kê sử dụng công khai; không dùng số liệu thử nghiệm để mô tả người học thực tế.
