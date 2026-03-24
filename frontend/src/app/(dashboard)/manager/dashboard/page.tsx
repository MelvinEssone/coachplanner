"use client";

import { useState, useEffect } from "react";
import { dashboardApi, assignmentsApi } from "@/lib/api";
import { User } from "@/types";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, formatDuration } from "@/lib/utils";
import {
  Users,
  Clock,
  Calendar,
  Shield,
  AlertTriangle,
  Search,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ApprenantStat {
  apprenant: User;
  sessionCount: number;
  totalHeures: number;
  prochaineSession: string | null;
  sessionSignees: number;
  sessionEnAttente: number;
}

interface DashboardData {
  stats: {
    totalApprenants: number;
    totalSessions: number;
    totalHeures: number;
    sessionsEnAttente: number;
  };
  apprenants: ApprenantStat[];
}

export default function ManagerDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const r = await dashboardApi.manager();
        setData(r.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  const filteredApprenants = (data?.apprenants || []).filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.apprenant.nom.toLowerCase().includes(q) ||
      a.apprenant.prenom.toLowerCase().includes(q) ||
      a.apprenant.entreprise?.nom.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-sm text-gray-500 mt-0.5">Suivi de vos apprenants</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Apprenants suivis"
              value={data?.stats.totalApprenants || 0}
              icon={<Users size={20} />}
              color="blue"
            />
            <StatCard
              title="Sessions effectuées"
              value={data?.stats.totalSessions || 0}
              icon={<Calendar size={20} />}
              color="indigo"
            />
            <StatCard
              title="Heures de formation"
              value={`${Math.round((data?.stats.totalHeures || 0))}h`}
              icon={<Clock size={20} />}
              color="purple"
            />
            <StatCard
              title="Signatures en attente"
              value={data?.stats.sessionsEnAttente || 0}
              icon={<AlertTriangle size={20} />}
              color="orange"
            />
          </div>

          {/* Search */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5 flex items-center gap-2">
            <Search size={16} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Rechercher un apprenant ou une entreprise..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-sm outline-none text-gray-700 placeholder-gray-400"
            />
          </div>

          {/* Apprenants table */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Apprenant</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Sessions</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Heures</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Prochaine session</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Signatures</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredApprenants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm">
                      Aucun apprenant trouvé
                    </td>
                  </tr>
                ) : (
                  filteredApprenants.map((item) => (
                    <tr key={item.apprenant.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold flex-shrink-0">
                            {item.apprenant.prenom.charAt(0)}{item.apprenant.nom.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {item.apprenant.prenom} {item.apprenant.nom}
                            </p>
                            <p className="text-xs text-gray-400">{item.apprenant.entreprise?.nom || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-gray-800">
                        {item.sessionCount}
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-blue-600">
                        {Math.round(item.totalHeures)}h
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {item.prochaineSession ? (
                          <span className="capitalize">
                            {format(new Date(item.prochaineSession), "d MMM yyyy", { locale: fr })}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {item.sessionEnAttente > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full">
                            <AlertTriangle size={10} />
                            {item.sessionEnAttente} en attente
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                            <Shield size={10} />
                            À jour
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/manager/rapports?apprenantId=${item.apprenant.id}`}
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Voir
                          <ChevronRight size={12} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
