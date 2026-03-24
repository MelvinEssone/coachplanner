"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function HomePage() {
  const router = useRouter();
  const { fetchMe, isAuthenticated, user, isLoading } = useAuth();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        // Redirect based on role
        switch (user.role) {
          case "FORMATEUR":
            router.replace("/formateur/sessions");
            break;
          case "APPRENANT":
            router.replace("/apprenant/agenda");
            break;
          case "MANAGER_RH":
            router.replace("/manager/dashboard");
            break;
          case "RESPONSABLE_CENTRE":
            router.replace("/responsable/dashboard");
            break;
          default:
            router.replace("/login");
        }
      } else {
        router.replace("/login");
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
          <span className="text-white text-2xl font-bold">CP</span>
        </div>
        <p className="text-gray-500 text-sm">Chargement de CoachPlanner...</p>
      </div>
    </div>
  );
}
