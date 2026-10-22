"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SentenceReorder, WordBlock } from './SentenceReorder';
import { VoiceRecorder } from './VoiceRecorder';
import { Volume2, ArrowRight, CheckCircle2, XCircle, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { useAudio } from '@/hooks/useAudio';
import { useChineseAudio } from '@/hooks/useChineseAudio';
import { ClickableSentence } from './ClickableSentence';
import { useUserStore } from '@/store/useUserStore';
import { playSound } from '@/lib/sfx';

export type QuestionType = 'MULTIPLE_CHOICE' | 'LISTENING' | 'SENTENCE_REORDER' | 'SPEAKING' | 'GRAMMAR_LESSON' | 'SHADOWING';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  // For MC / Listening
  options?: string[];
  correctOptionIdx?: number;
  audioText?: string; 
  // For Reorder
  words?: WordBlock[];
  correctOrderIds?: string[];
  // For Speaking / Shadowing
  targetSentence?: string;
  // For Grammar
  grammarExplanation?: string;
  grammarFormula?: string;
  // For Shadowing
  videoUrl?: string;
  // Feedback explanation
  explanation?: string;
}

export const QuizEngine = ({ questions }: { questions: QuizQuestion[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  const question = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  const {speak:handleSpeak} = useChineseAudio();

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedIdx(idx);
    setIsAnswered(true);
    if (idx === question.correctOptionIdx) {
      setIsCorrect(true);
      playSound('correct');
    } else {
      setIsCorrect(false);
      playSound('wrong');
    }
  };

  const { addXp } = useUserStore();

  const handleNext = async () => {
    setSelectedIdx(null);
    setIsAnswered(false);
    setIsCorrect(false);
    
    if (currentIndex === questions.length - 1) {
      // Award 50 XP for completing a lesson
      await addXp(50);
    }
    
    setCurrentIndex(prev => prev + 1);
  };

  if (currentIndex >= questions.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <BrainCircuit className="w-32 h-32 text-green-500 mb-6" />
        <h2 className="text-4xl font-black text-slate-800 mb-4">Hoàn Thành Bài Học!</h2>
        <p className="text-slate-500 text-lg mb-8">Bạn đã xuất sắc vượt qua các dạng bài tập HSK 3.0.</p>
        <Link href="/" className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-blue-700 transition-colors">
          Về Lộ Trình
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-[80vh]">
      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-4 rounded-full mb-10 overflow-hidden flex-shrink-0">
        <motion.div 
          className="h-full bg-green-500"
          initial={{ width: `${((currentIndex - 1) / questions.length) * 100}%` }}
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', stiffness: 50 }}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pb-32 flex flex-col items-center justify-center w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full flex flex-col items-center"
          >
            <div className="mb-10 w-full flex justify-center">
              <ClickableSentence text={question.prompt} />
            </div>

            {/* MULTIPLE CHOICE */}
            {question.type === 'MULTIPLE_CHOICE' && (
              <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
                {question.options?.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`p-4 text-2xl font-bold rounded-2xl border-4 transition-all flex justify-center items-center ${
                      isAnswered 
                        ? idx === question.correctOptionIdx 
                          ? 'bg-green-100 border-green-500 text-green-700' 
                          : idx === selectedIdx 
                            ? 'bg-red-100 border-red-500 text-red-700'
                            : 'bg-white border-slate-200 text-slate-400 opacity-50'
                        : 'bg-white border-slate-200 hover:border-blue-400 text-slate-700 hover:bg-blue-50'
                    }`}
                  >
                    <div className="pointer-events-none scale-75 origin-center">
                      <ClickableSentence text={opt} />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* LISTENING */}
            {question.type === 'LISTENING' && (
              <div className="w-full max-w-2xl flex flex-col items-center">
                <button 
                  onClick={() => handleSpeak(question.audioText || '')}
                  className="w-24 h-24 bg-blue-500 text-white rounded-full flex items-center justify-center mb-10 shadow-lg hover:scale-110 transition-transform"
                >
                  <Volume2 className="w-12 h-12" />
                </button>
                <div className="grid grid-cols-2 gap-4 w-full">
                  {question.options?.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      className={`p-4 text-2xl font-bold rounded-2xl border-4 transition-all flex justify-center items-center ${
                        isAnswered 
                          ? idx === question.correctOptionIdx 
                            ? 'bg-green-100 border-green-500 text-green-700' 
                            : idx === selectedIdx 
                              ? 'bg-red-100 border-red-500 text-red-700'
                              : 'bg-white border-slate-200 text-slate-400 opacity-50'
                          : 'bg-white border-slate-200 hover:border-blue-400 text-slate-700 hover:bg-blue-50'
                      }`}
                    >
                      <div className="pointer-events-none scale-75 origin-center">
                        <ClickableSentence text={opt} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SENTENCE REORDER */}
            {question.type === 'SENTENCE_REORDER' && (
              <div className="w-full pointer-events-auto">
                <SentenceReorder 
                  initialWords={question.words || []}
                  correctOrderIds={question.correctOrderIds || []}
                  onCorrect={() => {
                    setIsAnswered(true);
                    setIsCorrect(true);
                  }}
                />
              </div>
            )}

            {/* SPEAKING */}
            {question.type === 'SPEAKING' && (
              <div className="w-full max-w-2xl relative z-10 pointer-events-auto">
                <VoiceRecorder targetSentence={question.targetSentence || ''} />
                <div className="mt-8 flex justify-center">
                   <button 
                      onClick={() => { setIsAnswered(true); setIsCorrect(true); }}
                      className="px-6 py-2 text-blue-600 font-bold underline"
                   >
                     Tôi đã đọc xong (Giả lập vượt qua)
                   </button>
                </div>
              </div>
            )}

            {/* GRAMMAR LESSON */}
            {question.type === 'GRAMMAR_LESSON' && (
              <div className="w-full max-w-2xl bg-white border border-purple-200 rounded-3xl p-8 shadow-sm pointer-events-auto">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-purple-100 rounded-2xl text-purple-600">
                    <BrainCircuit className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800">Cấu trúc Ngữ pháp mới</h3>
                </div>
                <div className="bg-slate-50 rounded-2xl p-6 border-l-4 border-purple-500 mb-6 text-xl font-bold text-slate-700">
                  Công thức: <span className="text-purple-600 ml-2">{question.grammarFormula}</span>
                </div>
                <p className="text-lg text-slate-600 leading-relaxed mb-8">
                  {question.grammarExplanation}
                </p>
                <button 
                  onClick={() => { setIsAnswered(true); setIsCorrect(true); }}
                  className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xl rounded-2xl transition-colors shadow-md"
                >
                  Đã hiểu, chuyển sang bài tập!
                </button>
              </div>
            )}

            {/* SHADOWING (VIDEO RECORDING) */}
            {question.type === 'SHADOWING' && (
              <div className="w-full max-w-3xl flex flex-col items-center pointer-events-auto">
                {/* Video Player */}
                <div className="w-full aspect-video bg-slate-900 rounded-3xl relative shadow-xl mb-6 overflow-hidden z-20 flex">
                  {question.videoUrl ? (
                    <iframe 
                      src={question.videoUrl} 
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <img src="https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800&q=80" alt="Video frame" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                      <button 
                        onClick={() => handleSpeak(question.targetSentence || '')}
                        className="w-20 h-20 bg-white/20 hover:bg-blue-600 backdrop-blur-sm rounded-full flex items-center justify-center transition-all group-hover:scale-110 z-10"
                      >
                        <Volume2 className="w-10 h-10 text-white" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Subtitle (Moved below video to avoid clipping/overlapping) */}
                <div className="w-full text-center px-4 mb-8">
                  <div className="inline-block px-6 py-3 rounded-2xl bg-slate-100 shadow-sm border border-slate-200">
                    <ClickableSentence text={question.targetSentence || ''} />
                  </div>
                </div>

                {/* Voice Recorder for Shadowing */}
                <div className="w-full bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <h4 className="text-center font-bold text-slate-500 mb-4">Lặp lại câu bạn vừa nghe (Shadowing)</h4>
                  <VoiceRecorder targetSentence={question.targetSentence || ''} />
                  <div className="mt-4 flex justify-center">
                     <button 
                        onClick={() => { setIsAnswered(true); setIsCorrect(true); }}
                        className="px-6 py-2 text-slate-400 font-bold underline hover:text-slate-600"
                     >
                       Bỏ qua thu âm
                     </button>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Action Bar */}
      <AnimatePresence>
        {isAnswered && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className={`fixed bottom-0 left-0 w-full p-6 border-t-2 flex items-center justify-between z-50 pl-72 pr-10 ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                {isCorrect ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
              </div>
              <div>
                <h3 className={`text-2xl font-black ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {isCorrect ? 'Tuyệt vời!' : 'Chưa chính xác!'}
                </h3>
                {!isCorrect && question.type === 'MULTIPLE_CHOICE' && (
                  <p className="text-red-600 font-bold mt-1 text-lg">Đáp án đúng là: {question.options?.[question.correctOptionIdx || 0]}</p>
                )}
                
                {/* Explanation */}
                {question.explanation && (
                  <p className={`mt-2 font-medium max-w-xl text-lg ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                    <span className="font-bold">Giải thích: </span>{question.explanation}
                  </p>
                )}
              </div>
            </div>

            <button 
              onClick={handleNext}
              className={`px-10 py-4 text-white font-black text-xl rounded-2xl shadow-md hover:scale-105 transition-transform shrink-0 ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}
            >
              Tiếp tục <ArrowRight className="inline-block w-6 h-6 ml-2" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
