"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { Mic, Square, Loader2, CheckCircle2 } from 'lucide-react';

export const VoiceRecorder = ({ targetSentence }: { targetSentence: string }) => {
  const { isRecording, startRecording, stopRecording } = useAudioRecorder();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleToggleRecord = async () => {
    if (isRecording) {
      const audioBlob = await stopRecording();
      if (audioBlob) {
        setIsAnalyzing(true);
        // Send to API
        try {
          const formData = new FormData();
          formData.append('audio', audioBlob);
          formData.append('targetSentence', targetSentence);
          const res = await fetch('/api/pronunciation', { method: 'POST', body: formData });
          const data = await res.json();
          setResult(data.data);
        } catch (error) {
          console.error("API Error", error);
        } finally {
          setIsAnalyzing(false);
        }
      }
    } else {
      setResult(null);
      await startRecording();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl p-8 shadow-xl border border-slate-100 flex flex-col items-center">
      <div className="text-sm font-medium text-slate-400 mb-2 uppercase tracking-widest">Đọc câu sau</div>
      <div className="text-4xl font-bold text-slate-800 mb-8">{targetSentence}</div>

      {/* Record Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggleRecord}
        disabled={isAnalyzing}
        className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-colors shadow-lg
          ${isRecording ? 'bg-red-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}
          ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {isRecording && (
          <motion.div
            className="absolute inset-0 border-4 border-red-500 rounded-full"
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        )}
        
        {isAnalyzing ? <Loader2 className="w-10 h-10 animate-spin" /> : 
         isRecording ? <Square className="w-8 h-8 fill-current" /> : 
         <Mic className="w-10 h-10" />}
      </motion.button>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 w-full p-6 bg-slate-50 rounded-2xl border border-slate-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-700 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" /> Kết quả phân tích
              </h4>
              <div className="text-green-600 font-black text-2xl">{result.scores.accuracy}/100</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white p-3 rounded-lg border text-sm">
                <span className="text-slate-400 block mb-1">Độ lưu loát</span>
                <span className="font-bold">{result.scores.fluency}/100</span>
              </div>
              <div className="bg-white p-3 rounded-lg border text-sm">
                <span className="text-slate-400 block mb-1">Thanh điệu</span>
                <span className="font-bold">{result.scores.prosody}/100</span>
              </div>
            </div>

            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm font-medium">
              🤖 AI: "{result.aiFeedbackText}"
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
