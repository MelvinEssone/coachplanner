"use client";

import { create } from "zustand";
import { User } from "@/types";
import { authApi } from "@/lib/api";
import { clearAuth, setStoredUser, getStoredUser } from "@/lib/auth";

import { DEMO_USERS_MAP, DEMO_PASSWORD } from "@/lib/mockData";

// Fusion des anciens comptes démo + nouveaux utilisateurs
const DEMO_USERS: Record<string, User & { password: string }> = {
  // Anciens comptes démo génériques
  "formateur@demo.fr":   { id: "demo-formateur",   nom: "Martin",  prenom: "Sophie", email: "formateur@demo.fr",   role: "FORMATEUR",          emailVerified: true, password: "demo1234", createdAt: new Date().toISOString() },
  "apprenant@demo.fr":   { id: "demo-apprenant",   nom: "Dupont",  prenom: "Lucas",  email: "apprenant@demo.fr",   role: "APPRENANT",          emailVerified: true, password: "demo1234", createdAt: new Date().toISOString() },
  "manager@demo.fr":     { id: "demo-manager",     nom: "Bernard", prenom: "Claire", email: "manager@demo.fr",     role: "MANAGER_RH",         emailVerified: true, password: "demo1234", createdAt: new Date().toISOString() },
  "responsable@demo.fr": { id: "demo-responsable", nom: "Leroy",   prenom: "Marc",   email: "responsable@demo.fr", role: "RESPONSABLE_CENTRE", emailVerified: true, password: "demo1234", createdAt: new Date().toISOString() },
  // Nouveaux comptes démo personnalisés
  ...Object.fromEntries(
    Object.entries(DEMO_USERS_MAP).map(([email, u]) => [
      email,
      { ...u, password: DEMO_PASSWORD } as User & { password: string },
    ])
  ),
};

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
    // Demo mode
    const demoUser = DEMO_USERS[email];
    if (demoUser && demoUser.password === password) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...user } = demoUser;
      localStorage.setItem("accessToken", "demo-token");
      localStorage.setItem("refreshToken", "demo-refresh");
      setStoredUser(user);
      set({ user, isAuthenticated: true });
      return;
    }
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
      // Demo mode: if stored user is a demo account, skip API call
      if (storedUser) {
        if (storedUser.id?.startsWith("demo-")) {
          set({ user: storedUser, isAuthenticated: true, isLoading: false });
          return;
        }
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
