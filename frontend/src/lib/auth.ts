import { User } from "@/types";

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User): void {
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}
