import { User } from "@/types";

const USER_KEY = "cp_user";

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const user = localStorage.getItem(USER_KEY) || localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem("user", JSON.stringify(user)); // compatibilité
}

export function clearAuth(): void {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("user");
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}
