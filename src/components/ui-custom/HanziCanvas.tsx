"use client";

import React, { useEffect, useRef, useState } from 'react';
import HanziWriter from 'hanzi-writer';
import { PlayCircle, RefreshCw } from 'lucide-react';

export const HanziCanvas = ({ character }: { character: string }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [writer, setWriter] = useState<any>(null);

  useEffect(() => {
    // Only render single Chinese characters
    if (!/[\u4e00-\u9fa5]/.test(character)) return;

    if (canvasRef.current) {
      // Clear previous canvas if character changes
      canvasRef.current.innerHTML = '';
      
      const newWriter = HanziWriter.create(canvasRef.current, character, {
        width: 150,
        height: 150,
        padding: 5,
        showOutline: true,
        strokeAnimationSpeed: 1.5,
        delayBetweenStrokes: 200,
        strokeColor: '#3b82f6', // blue-500
        outlineColor: '#e2e8f0', // slate-200
        drawingColor: '#22c55e', // green-500 (for quizzes)
      });
      setWriter(newWriter);
    }
  }, [character]);

  const handleAnimate = () => {
    if (writer) writer.animateCharacter();
  };

  const handleQuiz = () => {
    if (writer) writer.quiz();
  };

  if (!/[\u4e00-\u9fa5]/.test(character)) return null;

  return (
    <div className="flex flex-col items-center bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
      <div 
        ref={canvasRef} 
        className="cursor-crosshair bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200"
      />
      <div className="flex gap-2 mt-4">
        <button 
          onClick={handleAnimate}
          className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold rounded-xl flex items-center gap-2 text-sm transition-colors"
        >
          <PlayCircle className="w-4 h-4" /> Vẽ mẫu
        </button>
        <button 
          onClick={handleQuiz}
          className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 font-bold rounded-xl flex items-center gap-2 text-sm transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Luyện viết
        </button>
      </div>
    </div>
  );
};
