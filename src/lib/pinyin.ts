import { pinyin } from 'pinyin-pro';

export function getPinyin(hanzi: string): string {
  // Returns pinyin with tone marks (e.g. xué shēng)
  return pinyin(hanzi, { toneType: 'symbol' });
}

export function segmentChinese(text: string): { text: string, pinyin: string, isWord: boolean }[] {
  const isChineseWord = (str: string) => /[\u4e00-\u9fa5]/.test(str);

  if (typeof Intl === 'undefined' || !Intl.Segmenter) {
    return text.split('').map(char => ({
      text: char,
      pinyin: isChineseWord(char) ? getPinyin(char) : '',
      isWord: isChineseWord(char)
    }));
  }

  const segmenter = new Intl.Segmenter('zh-CN', { granularity: 'word' });
  const segments = Array.from(segmenter.segment(text));
  
  return segments.map(seg => {
    const isWord = isChineseWord(seg.segment);
    return {
      text: seg.segment,
      pinyin: isWord ? getPinyin(seg.segment) : '',
      isWord: isWord
    };
  });
}
