"use client";

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUserStore } from '@/store/useUserStore';
import { Flame } from 'lucide-react';

export const ProgressDashboard = () => {
  const { xp, level, name, fetchUser } = useUserStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const nextLevelXp = level * 500;
  const levelProgress = (xp % 500) / 500 * 100;

  const masteryData = [
    { skill: 'Từ vựng (HSK 1)', progress: 85, color: 'bg-green-500' },
    { skill: 'Ngữ pháp cơ bản', progress: 60, color: 'bg-blue-500' },
    { skill: 'Thanh điệu (Tone)', progress: 40, color: 'bg-orange-500' },
    { skill: 'Độ lưu loát (Voice)', progress: 70, color: 'bg-purple-500' },
  ];

  return (
    <div className="w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100 mt-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-8 border-b border-slate-100 gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            Hồ Sơ Năng Lực 
          </h2>
          <p className="text-slate-500 mt-1">Chào mừng <span className="font-bold text-blue-500">{name}</span>! AI Agent liên tục phân tích trình độ của bạn.</p>
        </div>

        <div className="flex flex-col min-w-[250px]">
          <div className="flex justify-between items-end mb-2">
            <div className="text-sm font-bold text-slate-400">CẤP ĐỘ {level}</div>
            <div className="flex items-center text-orange-500 font-black text-lg gap-1">
              <Flame className="w-5 h-5 fill-current" /> {xp} XP
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${levelProgress}%` }}
              transition={{ duration: 1, type: 'spring' }}
              className="h-full rounded-full bg-orange-400"
            />
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white/50 mix-blend-difference">
              {xp} / {nextLevelXp}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {masteryData.map((item, idx) => (
          <div key={idx} className="relative">
            <div className="flex justify-between mb-2">
              <span className="font-bold text-slate-700">{item.skill}</span>
              <span className="font-bold text-slate-400">{item.progress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.progress}%` }}
                transition={{ duration: 1.5, delay: idx * 0.2, type: 'spring' }}
                className={`h-full rounded-full ${item.color}`}
              />
            </div>
            
            {/* AI Warning for low progress */}
            {item.progress < 50 && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 2 }}
                className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1"
              >
                ⚠️ AI Tự động: Phát hiện điểm yếu. Sẽ chèn bài tập phụ đạo vào lộ trình ngày mai.
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
