"use client";

import React, { useMemo, useState } from 'react';
import { segmentChinese } from '@/lib/pinyin';
import { motion, AnimatePresence } from 'framer-motion';

export const ClickableSentence = ({ text }: { text: string }) => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [meanings, setMeanings] = useState<Record<string, string>>({});
  const [segments, setSegments] = useState<{text: string, pinyin: string, isWord: boolean}[]>([]);

  React.useEffect(() => {
    setSegments(segmentChinese(text));
  }, [text]);

  const handleClick = async (idx: number, word: string, isWord: boolean) => {
    if (!isWord) return;
    
    // Toggle off if clicking the same word
    if (activeIdx === idx) {
      setActiveIdx(null);
      return;
    }

    setActiveIdx(idx);
    
    // Fetch meaning if not cached
    if (!meanings[word]) {
      try {
        const res = await fetch(`/api/dictionary?q=${encodeURIComponent(word)}`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          setMeanings(prev => ({ ...prev, [word]: data.results[0].meaning }));
        } else {
          setMeanings(prev => ({ ...prev, [word]: 'Không tìm thấy' }));
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="w-full mx-auto p-4 flex justify-center min-h-[5rem]">
      {segments.length === 0 ? (
        <div className="flex flex-wrap items-start justify-center gap-1">
          <span className="text-4xl font-medium text-slate-800">{text}</span>
        </div>
      ) : (
        <div className="flex flex-wrap items-start justify-center gap-1">
          {segments.map((seg, idx) => (
          <div
            key={idx}
            onClick={() => handleClick(idx, seg.text, seg.isWord)}
            className={`relative flex flex-col items-center justify-end rounded-xl transition-all cursor-pointer px-1 py-1
              ${activeIdx === idx && seg.isWord ? 'bg-blue-100/30' : ''}
            `}
          >
            {/* Pinyin */}
            {seg.isWord && (
              <span className={`text-base font-bold mb-1 transition-colors min-h-[1.5rem] ${activeIdx === idx ? 'text-blue-600' : 'text-slate-400'}`}>
                {seg.pinyin}
              </span>
            )}
            
            {/* Hanzi */}
            <span className={`text-4xl font-medium ${activeIdx === idx && seg.isWord ? 'text-blue-600' : 'text-slate-800'}`}>
              {seg.text}
            </span>

            {/* Translation (Inline Block, NOT Absolute) */}
            <AnimatePresence>
              {activeIdx === idx && seg.isWord && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 w-max max-w-[200px] bg-blue-600 text-white p-3 rounded-xl shadow-md flex flex-col items-center"
                >
                  <span className="text-sm font-bold text-blue-200 mb-1">{seg.pinyin}</span>
                  <span className="text-lg font-bold text-center leading-tight">
                    {meanings[seg.text] === undefined ? (
                      <span className="animate-pulse">Đang dịch...</span>
                    ) : (
                      meanings[seg.text]
                    )}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};
