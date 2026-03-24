"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { usersApi, sessionsApi } from "@/lib/api";
import { User, Session } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, formatDuration } from "@/lib/utils";
import { ArrowLeft, Mail, Phone, Calendar, Clock, BookOpen, Users } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function FormateurFichePage() {
  const params = useParams();
  const formateurId = params.id as string;

  const [formateur, setFormateur] = useState<User | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      usersApi.getById(formateurId),
      sessionsApi.getAll({ formateurId }),
    ])
      .then(([userRes, sessionsRes]) => {
        setFormateur(userRes.data.data);
        setSessions(sessionsRes.data.data);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [formateurId]);

  if (isLoading) {
    return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  }

  if (!formateur) {
    return <div className="text-center py-16 text-gray-500">Formateur introuvable.</div>;
  }

  const totalMinutes = sessions.filter((s) => s.statut === "TERMINEE").reduce((acc, s) => acc + s.dureeMinutes, 0);
  const uniqueApprenants = new Set(sessions.map((s) => s.apprenantId)).size;
  const sessionsFutures = sessions.filter((s) => s.statut === "A_VENIR").length;

  // Group sessions by month for chart (last 6 months)
  const monthlyData = sessions.reduce<Record<string, number>>((acc, s) => {
    if (s.statut === "TERMINEE") {
      const key = format(new Date(s.dateDebut), "MMM yyyy", { locale: fr });
      acc[key] = (acc[key] || 0) + s.dureeMinutes / 60;
    }
    return acc;
  }, {});

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/responsable/formateurs" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Fiche formateur</h1>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-5">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {formateur.prenom.charAt(0)}{formateur.nom.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {formateur.prenom} {formateur.nom}
                </h2>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                  <a href={`mailto:${formateur.email}`} className="flex items-center gap-1.5 hover:text-blue-600">
                    <Mail size={14} />
                    {formateur.email}
                  </a>
                  {formateur.formateurProfil?.telephone && (
                    <span className="flex items-center gap-1.5">
                      <Phone size={14} />
                      {formateur.formateurProfil.telephone}
                    </span>
                  )}
                </div>
              </div>
              <span className={`text-sm font-medium px-3 py-1.5 rounded-xl ${
                formateur.formateurProfil?.statut === "Actif"
                  ? "bg-green-50 text-green-700"
                  : formateur.formateurProfil?.statut === "En congé"
                  ? "bg-yellow-50 text-yellow-700"
                  : "bg-gray-100 text-gray-600"
              }`}>
                {formateur.formateurProfil?.statut || "Actif"}
              </span>
            </div>

            {formateur.formateurProfil?.dateEntree && (
              <p className="text-xs text-gray-400 mt-2">
                Dans le centre depuis le {format(new Date(formateur.formateurProfil.dateEntree), "d MMMM yyyy", { locale: fr })}
              </p>
            )}

            {formateur.formateurProfil?.matieres && formateur.formateurProfil.matieres.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formateur.formateurProfil.matieres.map((m) => (
                  <span key={m} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                    {m}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-5 border-t border-gray-100">
          {[
            { icon: Users, label: "Apprenants", value: uniqueApprenants, color: "text-blue-600" },
            { icon: Clock, label: "Heures totales", value: `${Math.round(totalMinutes / 60)}h`, color: "text-indigo-600" },
            { icon: BookOpen, label: "Sessions terminées", value: sessions.filter(s => s.statut === "TERMINEE").length, color: "text-green-600" },
            { icon: Calendar, label: "Sessions planifiées", value: sessionsFutures, color: "text-orange-600" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="text-center">
              <Icon size={20} className={`mx-auto mb-1 ${color}`} />
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly chart */}
      {Object.keys(monthlyData).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Volume horaire mensuel</h3>
          <div className="flex items-end gap-2 h-32">
            {Object.entries(monthlyData).slice(-6).map(([month, hours]) => {
              const maxH = Math.max(...Object.values(monthlyData));
              const pct = Math.round((hours / maxH) * 100);
              return (
                <div key={month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-500">{Math.round(hours)}h</span>
                  <div className="w-full bg-blue-100 rounded-t-md" style={{ height: `${pct}%` }}>
                    <div className="w-full h-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md" />
                  </div>
                  <span className="text-[10px] text-gray-400 capitalize">{month}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sessions history */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Historique des sessions</h3>
        </div>
        {sessions.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">Aucune session</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Module</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Apprenant</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Date</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Durée</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sessions.slice(0, 20).map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3.5 text-sm text-gray-800 font-medium">{s.module?.nom}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">
                    {s.apprenant?.prenom} {s.apprenant?.nom}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600 capitalize">
                    {format(new Date(s.dateDebut), "d MMM yyyy", { locale: fr })}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{formatDuration(s.dureeMinutes)}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={s.statut} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
