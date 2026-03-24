"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, X, CheckCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { formatRelative } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface NavbarProps {
  title?: string;
}

export function Navbar({ title }: NavbarProps) {
  const { user } = useAuth();
  const { notifications, unreadCount, fetchNotifications, markRead, markAllRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user, fetchNotifications]);

  // Poll notifications every 30 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  // Close panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const notifTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      NOUVELLE_SESSION: "📅",
      SESSION_SIGNEE: "✍️",
      RAPPORT_GENERE: "📋",
      RAPPORT_SIGNE: "✅",
    };
    return icons[type] || "🔔";
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-10 shadow-sm">
      <div>
        {title && <h1 className="text-lg font-semibold text-gray-800">{title}</h1>}
      </div>

      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <div ref={panelRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Panel */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800 text-sm">
                  Notifications{" "}
                  {unreadCount > 0 && (
                    <span className="ml-1 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <CheckCheck size={12} />
                      Tout lire
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 text-sm">
                    <Bell size={24} className="mx-auto mb-2 opacity-30" />
                    <p>Aucune notification</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => markRead(notif.id)}
                      className={cn(
                        "w-full text-left px-4 py-3 hover:bg-gray-50 transition border-b border-gray-50 last:border-0",
                        !notif.lu && "bg-blue-50/50"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg flex-shrink-0">
                          {notifTypeIcon(notif.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-xs text-gray-700 leading-snug", !notif.lu && "font-medium")}>
                            {notif.message}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {formatRelative(notif.createdAt)}
                          </p>
                        </div>
                        {!notif.lu && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
        {user && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
              {user.prenom.charAt(0)}{user.nom.charAt(0)}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-gray-800">
                {user.prenom} {user.nom}
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
