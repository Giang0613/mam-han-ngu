"use client";

import React from 'react';
import Link from 'next/link';
import { HSK3_CURRICULUM } from '@/lib/curriculum/hsk3';
import { Lock, PlayCircle, Star } from 'lucide-react';

export const CurriculumMap = () => {
  // Mock user progress
  const currentLevel = 2; 

  return (
    <div className="w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100 mt-8">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Lộ Trình HSK 3.0 (Băng 1-9)</h2>
        <p className="text-slate-500 text-sm mt-2">Hệ thống giáo trình chuẩn mới nhất 2021 với 11,092 từ vựng.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {HSK3_CURRICULUM.map((band) => {
          const isUnlocked = band.level <= currentLevel;
          const isCurrent = band.level === currentLevel;

          return (
            <div 
              key={band.level} 
              className={`relative rounded-3xl p-6 border-2 transition-all ${
                isCurrent ? 'border-blue-500 shadow-lg bg-blue-50/30' : 
                isUnlocked ? 'border-slate-200 hover:border-slate-300 bg-white' : 
                'border-slate-100 bg-slate-50 opacity-70'
              }`}
            >
              {!isUnlocked && (
                <div className="absolute top-4 right-4 text-slate-400">
                  <Lock className="w-6 h-6" />
                </div>
              )}
              
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-md mb-4 ${isUnlocked ? band.color : 'bg-slate-300'}`}>
                {band.level}
              </div>
              
              <h3 className={`text-xl font-bold mb-1 ${isUnlocked ? 'text-slate-800' : 'text-slate-400'}`}>
                {band.title}
              </h3>
              <div className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-1">
                <Star className="w-4 h-4 fill-current text-yellow-400" /> {band.wordCount} Từ vựng
              </div>
              <p className={`text-sm ${isUnlocked ? 'text-slate-600' : 'text-slate-400'}`}>
                {band.description}
              </p>

              {isUnlocked && (
                <Link 
                  href={`/curriculum/${band.level}`}
                  className={`mt-6 w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
                    isCurrent ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <PlayCircle className="w-5 h-5" /> 
                  {isCurrent ? 'Học ngay' : 'Vào xem chi tiết'}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
