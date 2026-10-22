"use client";

import { motion } from 'framer-motion';
import { useState } from 'react';

export const Flashcard = ({ frontHanzi, frontPinyin, backMeaning }: { frontHanzi: string, frontPinyin: string, backMeaning: string }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="w-80 h-96 cursor-pointer" 
      onClick={() => setIsFlipped(!isFlipped)}
      style={{ perspective: 1000 }} // Tailwind perspective utility requires extra config sometimes, inline is safer
    >
      <motion.div
        className="w-full h-full relative"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* Front Face */}
        <div 
          className="absolute w-full h-full bg-white shadow-2xl rounded-3xl flex flex-col items-center justify-center border-4 border-slate-100"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="text-2xl text-slate-500 font-medium mb-4">{frontPinyin}</div>
          <div className="text-8xl font-black text-slate-800">{frontHanzi}</div>
        </div>
        
        {/* Back Face */}
        <div 
          className="absolute w-full h-full bg-red-500 shadow-2xl rounded-3xl flex items-center justify-center border-4 border-red-600 p-8 text-center"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="text-4xl font-bold text-white">{backMeaning}</div>
        </div>
      </motion.div>
    </div>
  );
};
