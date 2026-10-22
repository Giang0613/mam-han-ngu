import { create } from 'zustand';

interface UserState {
  xp: number;
  level: number;
  name: string;
  fetchUser: () => Promise<void>;
  addXp: (amount: number) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  xp: 0,
  level: 1,
  name: 'Học viên',
  
  fetchUser: async () => {
    try {
      const res = await fetch('/api/user');
      const data = await res.json();
      if (data.success) {
        set({ xp: data.data.xp, level: data.data.level, name: data.data.name });
      }
    } catch (e) {
      console.error(e);
    }
  },

  addXp: async (amount: number) => {
    if (amount <= 0) return;
    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xpGain: amount })
      });
      const data = await res.json();
      if (data.success) {
        set({ xp: data.xp, level: data.level });
      }
    } catch (e) {
      console.error(e);
    }
  }
}));
