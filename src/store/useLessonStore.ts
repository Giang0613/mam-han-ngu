import { create } from 'zustand';

interface LessonState {
  currentQuestionIndex: number;
  totalXP: number;
  isAudioMuted: boolean;
  nextQuestion: () => void;
  addXP: (amount: number) => void;
  toggleAudio: () => void;
}

export const useLessonStore = create<LessonState>((set) => ({
  currentQuestionIndex: 0,
  totalXP: 0,
  isAudioMuted: false,
  nextQuestion: () => set((state) => ({ currentQuestionIndex: state.currentQuestionIndex + 1 })),
  addXP: (amount) => set((state) => ({ totalXP: state.totalXP + amount })),
  toggleAudio: () => set((state) => ({ isAudioMuted: !state.isAudioMuted })),
}));
