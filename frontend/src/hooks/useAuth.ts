"use client";

import { create } from "zustand";
import { User } from "@/types";
import { authApi } from "@/lib/api";
import { clearAuth, setStoredUser, getStoredUser } from "@/lib/auth";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    nom: string;
    prenom: string;
    email: string;
    password: string;
    role: string;
    entrepriseId?: string;
  }) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const response = await authApi.login(email, password);
    const { user, accessToken, refreshToken } = response.data.data;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    setStoredUser(user);
    set({ user, isAuthenticated: true });
  },

  register: async (data) => {
    const response = await authApi.register(data);
    const { user, accessToken, refreshToken } = response.data.data;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    setStoredUser(user);
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    clearAuth();
    set({ user: null, isAuthenticated: false });
  },

  fetchMe: async () => {
    try {
      set({ isLoading: true });
      const storedUser = getStoredUser();
      if (storedUser) {
        set({ user: storedUser, isAuthenticated: true, isLoading: false });
      }
      const response = await authApi.me();
      const user = response.data.data;
      setStoredUser(user);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      clearAuth();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateUser: (updates) => {
    const current = get().user;
    if (current) {
      const updated = { ...current, ...updates };
      setStoredUser(updated);
      set({ user: updated });
    }
  },
}));
