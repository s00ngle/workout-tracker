import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  nickname: string;
}

interface UIState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

interface ExerciseStore {
  // User
  user: User | null;
  setUser: (user: User | null) => void;

  // UI State
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  success: string | null;
  setSuccess: (success: string | null) => void;
  clearMessages: () => void;
}

export const useStore = create<ExerciseStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),

  error: null,
  setError: (error) => set({ error }),

  success: null,
  setSuccess: (success) => set({ success }),

  clearMessages: () => set({ error: null, success: null }),
}));
