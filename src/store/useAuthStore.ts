import { create } from 'zustand';
import { secureStorage } from '../services/secureStore';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null, token: string | null) => void;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user, token) => {
    set({ user, token, isAuthenticated: !!token });
  },

  logout: async () => {
    await secureStorage.clearAll();
    set({ user: null, token: null, isAuthenticated: false });
  },

  initialize: async () => {
    try {
      // Clear storage on startup to force login every time
      await secureStorage.clearAll();
    } catch (error) {
      console.error('Failed to initialize auth store', error);
    } finally {
      set({ isLoading: false, isAuthenticated: false, user: null, token: null });
    }
  },
}));
