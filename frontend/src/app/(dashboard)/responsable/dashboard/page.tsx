"use client";

import { useState, useEffect } from "react";
import { dashboardApi } from "@/lib/api";
import { StatCard } from "@/components/ui/StatCard";
import { Users, Clock, Calendar, TrendingUp, ChevronRight } from "lucide-react";
import Link from "next/link";

interface FormateurStat {
  formateur: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    formateurProfil?: { matieres: string[]; statut: string };
  };
  apprenantCount: number;
  heuresSemaine: number;
  heuresMois: number;
  heuresTotales: number;
  sessionsPlanifiees: number;
  sessionsRealisees: number;
}

interface DashboardData {
  stats: {
    totalFormateurs: number;
    totalApprenants: number;
    totalHeuresMois: number;
    totalSessionsMois: number;
  };
  formateurs: FormateurStat[];
}

export default function ResponsableDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"heuresMois" | "apprenantCount" | "sessionsRealisees">("heuresMois");

  useEffect(() => {
    dashboardApi.responsable()
      .then((r) => setData(r.data.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const sortedFormateurs = [...(data?.formateurs || [])].sort((a, b) => b[sortBy] - a[sortBy]);
  const maxHeures = Math.max(...(data?.formateurs || []).map((f) => f.heuresMois), 1);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-sm text-gray-500 mt-0.5">Activité globale de votre centre de formation</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard title="Formateurs actifs" value={data?.stats.totalFormateurs || 0} icon={<Users size={20} />} color="blue" />
            <StatCard title="Apprenants suivis" value={data?.stats.totalApprenants || 0} icon={<Users size={20} />} color="indigo" />
            <StatCard title="Heures ce mois" value={`${Math.round(data?.stats.totalHeuresMois || 0)}h`} icon={<Clock size={20} />} color="purple" />
            <StatCard title="Sessions ce mois" value={data?.stats.totalSessionsMois || 0} icon={<Calendar size={20} />} color="green" />
          </div>

          {/* Comparison chart */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp size={16} className="text-blue-600" />
                Volume horaire par formateur (mois en cours)
              </h2>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none text-gray-600"
              >
                <option value="heuresMois">Trier par heures</option>
                <option value="apprenantCount">Trier par apprenants</option>
                <option value="sessionsRealisees">Trier par sessions</option>
              </select>
            </div>

            <div className="space-y-3">
              {sortedFormateurs.map((item) => (
                <div key={item.formateur.id} className="flex items-center gap-3">
                  <div className="w-28 text-xs text-gray-600 font-medium truncate flex-shrink-0">
                    {item.formateur.prenom} {item.formateur.nom}
                  </div>
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.round((item.heuresMois / maxHeures) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-12 text-right flex-shrink-0">
                    {Math.round(item.heuresMois)}h
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Formateurs table */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Tous les formateurs</h2>
              <Link href="/responsable/formateurs" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                Voir tous <ChevronRight size={12} />
              </Link>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Formateur</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Matières</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Apprenants</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Heures / semaine</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Heures / mois</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sortedFormateurs.map((item) => (
                  <tr key={item.formateur.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
                          {item.formateur.prenom.charAt(0)}{item.formateur.nom.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {item.formateur.prenom} {item.formateur.nom}
                          </p>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                            item.formateur.formateurProfil?.statut === "Actif"
                              ? "bg-green-50 text-green-600"
                              : item.formateur.formateurProfil?.statut === "En congé"
                              ? "bg-yellow-50 text-yellow-600"
                              : "bg-gray-100 text-gray-500"
                          }`}>
                            {item.formateur.formateurProfil?.statut || "Actif"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(item.formateur.formateurProfil?.matieres || []).slice(0, 2).map((m) => (
                          <span key={m} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{m}</span>
                        ))}
                        {(item.formateur.formateurProfil?.matieres || []).length > 2 && (
                          <span className="text-xs text-gray-400">+{(item.formateur.formateurProfil?.matieres || []).length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-gray-800">{item.apprenantCount}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-indigo-600">{Math.round(item.heuresSemaine)}h</td>
                    <td className="px-5 py-4 text-sm font-semibold text-blue-600">{Math.round(item.heuresMois)}h</td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/responsable/formateurs/${item.formateur.id}`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Fiche →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
