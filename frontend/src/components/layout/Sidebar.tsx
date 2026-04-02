"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, getRoleLabel } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Users,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  GraduationCap,
  BarChart3,
  Download,
  PenLine,
  History,
  UserCheck,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
}

const navByRole: Record<string, NavItem[]> = {
  FORMATEUR: [
    { href: "/formateur/dashboard", label: "Tableau de bord", icon: BarChart3 },
    { href: "/formateur/sessions", label: "Mes sessions", icon: Calendar },
    { href: "/formateur/agenda", label: "Mon agenda", icon: LayoutDashboard },
    { href: "/formateur/modules", label: "Modules", icon: BookOpen },
  ],
  APPRENANT: [
    { href: "/apprenant/agenda", label: "Mon agenda", icon: Calendar },
    { href: "/apprenant/historique", label: "Historique", icon: History },
  ],
  MANAGER_RH: [
    { href: "/manager/dashboard", label: "Tableau de bord", icon: BarChart3 },
    { href: "/manager/rapports", label: "Rapports horaires", icon: FileText },
    { href: "/manager/parametres", label: "Paramètres", icon: Settings },
  ],
  RESPONSABLE_CENTRE: [
    { href: "/responsable/dashboard", label: "Tableau de bord", icon: BarChart3 },
    { href: "/responsable/formateurs", label: "Formateurs", icon: UserCheck },
    { href: "/responsable/export", label: "Exporter", icon: Download },
  ],
};

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const navItems = navByRole[user.role] || [];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-full fixed left-0 top-0 z-20 shadow-sm">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-base font-bold text-gray-900">CoachPlanner</span>
            <p className="text-[10px] text-gray-400 font-medium">{getRoleLabel(user.role)}</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon
                size={18}
                className={cn(isActive ? "text-blue-600" : "text-gray-400")}
              />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight size={14} className="text-blue-400" />}
            </Link>
          );
        })}

        {/* Divider */}
        <div className="border-t border-gray-100 my-2" />

        {/* Profile */}
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
            pathname === "/profile"
              ? "bg-blue-50 text-blue-700"
              : "text-gray-600 hover:bg-gray-50"
          )}
        >
          <Users size={18} className="text-gray-400" />
          <span>Mon profil</span>
        </Link>
      </nav>

      {/* User info & logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user.prenom.charAt(0)}{user.nom.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">
              {user.prenom} {user.nom}
            </p>
            <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
          </div>
          <button
            onClick={logout}
            className="text-gray-400 hover:text-red-500 transition flex-shrink-0"
            title="Se déconnecter"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
