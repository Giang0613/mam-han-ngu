import { QuizQuestion } from '@/components/ui-custom/QuizEngine';

export const getLessonQuestions = (lessonId: string): QuizQuestion[] => {
  if (lessonId === '1') {
    return [
      {
        id: 'l1_g1',
        type: 'GRAMMAR_LESSON',
        prompt: 'Bài 1: Giới thiệu bản thân cơ bản',
        grammarFormula: 'Chủ ngữ + 是 (shì) + Danh từ',
        grammarExplanation: 'Động từ "是" (shì) nghĩa là "là", dùng để khẳng định thân phận, quốc tịch, hoặc nghề nghiệp. Trong tiếng Trung, cấu trúc câu rất giống tiếng Việt: Chủ ngữ + Động từ + Tân ngữ. Ví dụ: 我是学生 (Tôi là học sinh).',
      },
      {
        id: 'l1_q1',
        type: 'MULTIPLE_CHOICE',
        prompt: 'Chọn từ có nghĩa là "Tôi, Tớ, Mình":',
        options: ['你', '我', '他', '她'],
        correctOptionIdx: 1,
        explanation: '"我" (wǒ) là đại từ nhân xưng ngôi thứ nhất, dùng để xưng "Tôi". Các từ còn lại: 你 (Bạn), 他 (Anh ấy), 她 (Cô ấy).',
      },
      {
        id: 'l1_q2',
        type: 'MULTIPLE_CHOICE',
        prompt: 'Chọn đáp án đúng điền vào chỗ trống: "我 ___ 学生。"',
        options: ['有', '叫', '是', '好'],
        correctOptionIdx: 2,
        explanation: 'Từ "是" (shì) dùng để kết nối chủ ngữ và danh từ, mang nghĩa là "là". Câu hoàn chỉnh là "我是学生" (Tôi là học sinh).',
      },
      {
        id: 'l1_l1',
        type: 'LISTENING',
        prompt: 'Lắng nghe đoạn băng và chọn câu tương ứng:',
        audioText: '你好，我是老师。',
        options: ['Xin chào, tôi là học sinh.', 'Xin chào, tôi là giáo viên.', 'Tạm biệt, tôi là học sinh.', 'Tạm biệt, tôi là giáo viên.'],
        correctOptionIdx: 1,
        explanation: '"你好" (nǐ hǎo) = Xin chào. "我是老师" (wǒ shì lǎo shī) = Tôi là giáo viên.',
      },
      {
        id: 'l1_s1',
        type: 'SHADOWING',
        prompt: 'Luyện tập Phản xạ nhại âm (Shadowing)',
        targetSentence: '你好，我是学生。',
        explanation: 'Kỹ thuật Shadowing giúp bạn cải thiện ngữ điệu. Hãy cố gắng bắt chước chính xác cao độ và trường độ của AI.',
        videoUrl: 'https://www.youtube.com/embed/151ngrS_J04?start=45&end=60'
      },
      {
        id: 'l1_r1',
        type: 'SENTENCE_REORDER',
        prompt: 'Sắp xếp câu: "Bạn là giáo viên"',
        words: [
          { id: 'w1', text: '你', pinyin: 'nǐ' },
          { id: 'w3', text: '老师', pinyin: 'lǎo shī' },
          { id: 'w2', text: '是', pinyin: 'shì' },
        ],
        correctOrderIds: ['w1', 'w2', 'w3'],
        explanation: 'Cấu trúc câu khẳng định cơ bản: Chủ ngữ (你 - Bạn) + Động từ (是 - là) + Tân ngữ (老师 - giáo viên).',
      },
      {
        id: 'l1_r2',
        type: 'SENTENCE_REORDER',
        prompt: 'Sắp xếp câu: "Cô ấy là học sinh"',
        words: [
          { id: 'w2', text: '是', pinyin: 'shì' },
          { id: 'w1', text: '她', pinyin: 'tā' },
          { id: 'w3', text: '学生', pinyin: 'xué shēng' },
        ],
        correctOrderIds: ['w1', 'w2', 'w3'],
        explanation: 'Chủ ngữ (她 - Cô ấy) + Động từ (是 - là) + Tân ngữ (学生 - học sinh).',
      },
      {
        id: 'l1_sp1',
        type: 'SPEAKING',
        prompt: 'Luyện nói: Hãy đọc to câu sau',
        targetSentence: '我是中国学生。',
        explanation: '"我是中国学生" (wǒ shì zhōng guó xué shēng) nghĩa là "Tôi là học sinh Trung Quốc". Lưu ý thanh 1 trong từ 中国 (Trung Quốc).',
      }
    ];
  }

  if (lessonId === '2') {
    return [
      {
        id: 'l2_g1',
        type: 'GRAMMAR_LESSON',
        prompt: 'Bài 2: Hỏi Tên và Quốc tịch',
        grammarFormula: 'Chủ ngữ + 叫 + 什么 + 名字？',
        grammarExplanation: 'Để hỏi tên ai đó, ta dùng cấu trúc này. "叫" (jiào) nghĩa là gọi/tên là, "什么" (shén me) nghĩa là cái gì, "名字" (míng zì) nghĩa là tên.',
      },
      {
        id: 'l2_q1',
        type: 'LISTENING',
        prompt: 'Nghe và chọn nghĩa tương ứng:',
        audioText: '你叫什么名字？', 
        options: ['Bạn khỏe không?', 'Bạn tên là gì?', 'Xin lỗi', 'Cảm ơn'],
        correctOptionIdx: 1,
        explanation: '"你叫什么名字？" (Nǐ jiào shén me míng zi) là mẫu câu chuẩn để hỏi tên một người. Dịch sát nghĩa: "Bạn được gọi là cái tên gì?".',
      },
      {
        id: 'l2_s1',
        type: 'SHADOWING',
        prompt: 'Shadowing: Hỏi tên đối tác',
        targetSentence: '你好，你叫什么名字？',
        explanation: 'Nhớ ngắt nhịp sau "你好" (Xin chào).',
        videoUrl: 'https://www.youtube.com/embed/TaNktqkbQ2M?start=52&end=65'
      },
      {
        id: 'l2_q2',
        type: 'MULTIPLE_CHOICE',
        prompt: 'Pinyin của từ "名字" (Tên) là gì?',
        options: ['míng zì', 'míng tiān', 'mǎi dōng xi', 'miàn bāo'],
        correctOptionIdx: 0,
        explanation: '"名字" đọc là "míng zì", mang nghĩa là Tên. Lưu ý chữ "字" (zì) đọc thanh 4, nhưng trong ghép từ này thường đọc thanh nhẹ (míng zi).',
      },
      {
        id: 'l2_r1',
        type: 'SENTENCE_REORDER',
        prompt: 'Sắp xếp câu: "Tôi tên là David"',
        words: [
          { id: 'w1', text: '我', pinyin: 'wǒ' },
          { id: 'w3', text: '大卫', pinyin: 'dà wèi' },
          { id: 'w2', text: '叫', pinyin: 'jiào' },
        ],
        correctOrderIds: ['w1', 'w2', 'w3'],
        explanation: 'Chủ ngữ (我) + Động từ (叫) + Tân ngữ (大卫).',
      },
      {
        id: 'l2_l2',
        type: 'LISTENING',
        prompt: 'Lắng nghe quốc tịch:',
        audioText: '我是越南人。',
        options: ['Tôi là người Trung Quốc', 'Tôi là người Việt Nam', 'Tôi là người Mỹ', 'Tôi là người Nhật'],
        correctOptionIdx: 1,
        explanation: '"越南人" (yuè nán rén) nghĩa là người Việt Nam. (越南: Việt Nam, 人: Người).',
      },
      {
        id: 'l2_sp1',
        type: 'SPEAKING',
        prompt: 'Luyện nói: Tự giới thiệu tên và quốc tịch',
        targetSentence: '我叫大卫，我是美国人。',
        explanation: 'Tôi tên là David, tôi là người Mỹ (美国人 - měi guó rén).',
      }
    ];
  }

  // Fallback for lessons 3+
  return [
    {
      id: 'l3_g1',
      type: 'GRAMMAR_LESSON',
      prompt: `Bài mở rộng: Gia đình và Lượng từ (Bài ${lessonId})`,
      grammarFormula: 'Số từ + 口 / 个 + 人',
      grammarExplanation: 'Khi nói về số lượng thành viên gia đình, người Trung Quốc dùng lượng từ "口" (kǒu) thay vì "个" (gè). Ví dụ: 我家有四口人 (Nhà tôi có 4 người).',
    },
    {
      id: 'l3_r1',
      type: 'SENTENCE_REORDER',
      prompt: 'Sắp xếp câu: "Nhà tôi có 3 người"',
      words: [
        { id: 'w1', text: '我', pinyin: 'wǒ' },
        { id: 'w2', text: '家', pinyin: 'jiā' },
        { id: 'w3', text: '有', pinyin: 'yǒu' },
        { id: 'w4', text: '三', pinyin: 'sān' },
        { id: 'w5', text: '口', pinyin: 'kǒu' },
        { id: 'w6', text: '人', pinyin: 'rén' },
      ],
      correctOrderIds: ['w1', 'w2', 'w3', 'w4', 'w5', 'w6'],
      explanation: 'Cấu trúc sở hữu gia đình: Chủ ngữ (我家 - Nhà tôi) + Động từ (有 - có) + Số từ (三 - 3) + Lượng từ (口) + Danh từ (人 - người).',
    },
    {
      id: 'l3_q1',
      type: 'MULTIPLE_CHOICE',
      prompt: 'Lượng từ nào dùng để đếm số thành viên trong gia đình?',
      options: ['个 (gè)', '只 (zhī)', '口 (kǒu)', '本 (běn)'],
      correctOptionIdx: 2,
      explanation: '"口" (Khẩu/Miệng) là lượng từ đặc thù dành cho số lượng nhân khẩu trong một gia đình. Ví dụ: 三口人 (3 người).',
    },
    {
      id: 'l3_s1',
      type: 'SHADOWING',
      prompt: 'Luyện tập Shadowing: Giới thiệu gia đình',
      targetSentence: '我家有三口人。',
      explanation: 'Chú ý biến điệu thanh 3: 我家 (wǒ jiā -> wó jiā), 有三口人 (yǒu sān kǒu rén).',
      videoUrl: 'https://www.youtube.com/embed/sj_rANR3ii0?start=115&end=130'
    }
  ];
};
