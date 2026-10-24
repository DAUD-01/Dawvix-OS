import { create } from "zustand";

export interface User {
  id: string;
  _id?: string;
  username: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;

  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem("token") || sessionStorage.getItem("token"),

  setUser: (user) => set({ user }),

  setToken: (token) => set({ token }),

  logout: () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");

    set({
      user: null,
      token: null,
    });
  },
}));
