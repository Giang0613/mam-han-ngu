"use client";

import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

// Dummy data generator to simulate 10,000 words
const generateWords = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    hanzi: i % 2 === 0 ? '学生' : '银行',
    pinyin: i % 2 === 0 ? 'xué shēng' : 'yín háng',
    meaning: i % 2 === 0 ? 'Học sinh' : 'Ngân hàng',
  }));
};

const massiveVocabulary = generateWords(10000);

export const DictionaryList = () => {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: massiveVocabulary.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72, // Fixed height for each row
    overscan: 5,
  });

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 mt-8 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50">
        <h3 className="text-xl font-bold text-slate-800">Từ Điển Offline (10,000 Từ)</h3>
        <p className="text-sm text-slate-500">Render ảo hóa siêu tốc, không giật lag trình duyệt.</p>
      </div>
      
      <div 
        ref={parentRef} 
        className="h-[400px] overflow-auto w-full custom-scrollbar"
      >
        <div
          className="w-full relative"
          style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const word = massiveVocabulary[virtualItem.index];
            return (
              <div
                key={virtualItem.key}
                className="absolute top-0 left-0 w-full px-6 py-4 border-b border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-colors"
                style={{
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <div className="flex items-baseline gap-4">
                  <div className="text-2xl font-black text-slate-800 w-24">{word.hanzi}</div>
                  <div className="text-sm font-medium text-slate-400 w-32">{word.pinyin}</div>
                </div>
                <div className="text-right text-slate-600 font-medium">{word.meaning}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
