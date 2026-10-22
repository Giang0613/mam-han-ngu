export interface HSKBand {
  level: number;
  title: string;
  wordCount: number;
  description: string;
  color: string;
  isAdvanced?: boolean;
}

export const HSK3_CURRICULUM: HSKBand[] = [
  { level: 1, title: 'HSK 1 (Sơ Cấp)', wordCount: 500, description: 'Có thể hiểu và giao tiếp các câu đơn giản hàng ngày.', color: 'bg-green-500' },
  { level: 2, title: 'HSK 2 (Sơ Cấp)', wordCount: 772, description: 'Giao tiếp cơ bản về các chủ đề quen thuộc (Gia đình, mua sắm).', color: 'bg-green-600' },
  { level: 3, title: 'HSK 3 (Sơ Cấp)', wordCount: 973, description: 'Hoàn thành các nhiệm vụ giao tiếp thông thường trong sinh hoạt.', color: 'bg-green-700' },
  
  { level: 4, title: 'HSK 4 (Trung Cấp)', wordCount: 1000, description: 'Thảo luận về nhiều chủ đề, diễn đạt rành mạch, rõ ràng.', color: 'bg-blue-500' },
  { level: 5, title: 'HSK 5 (Trung Cấp)', wordCount: 1071, description: 'Đọc hiểu báo chí, xem phim ảnh và phát biểu ý kiến đầy đủ.', color: 'bg-blue-600' },
  { level: 6, title: 'HSK 6 (Trung Cấp)', wordCount: 1140, description: 'Dễ dàng nghe và đọc hiểu mọi thông tin, diễn đạt lưu loát.', color: 'bg-blue-700' },
  
  { level: 7, title: 'HSK 7 (Cao Cấp)', wordCount: 1500, description: 'Tham gia các buổi hội thảo chuyên môn học thuật bằng tiếng Trung.', color: 'bg-purple-600', isAdvanced: true },
  { level: 8, title: 'HSK 8 (Cao Cấp)', wordCount: 1500, description: 'Đọc hiểu tác phẩm văn học, dịch thuật tài liệu chuyên sâu.', color: 'bg-purple-700', isAdvanced: true },
  { level: 9, title: 'HSK 9 (Phiên Dịch)', wordCount: 2636, description: 'Trình độ tiếng Trung tương đương người bản xứ có học thức.', color: 'bg-purple-900', isAdvanced: true },
];

// Tổng số từ: 500 + 772 + 973 + 1000 + 1071 + 1140 + 5636 = 11,092 từ vựng
