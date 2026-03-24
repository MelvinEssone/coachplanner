"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
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
        router.replace("/profile");
    }
  }, [user, router]);

  return (
    <div className="flex justify-center py-16">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );
}
