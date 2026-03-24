"use client";

import { useState, useEffect } from "react";
import { sessionsApi } from "@/lib/api";
import { Session } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, formatDuration } from "@/lib/utils";
import { History, PenLine, Shield, Clock, BookOpen } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function ApprenantHistoriquePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalMinutes, setTotalMinutes] = useState(0);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const r = await sessionsApi.getAll({ statut: "TERMINEE" });
        const data: Session[] = r.data.data;
        setSessions(data);
        setTotalMinutes(data.reduce((acc, s) => acc + s.dureeMinutes, 0));
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const totalH = Math.floor(totalMinutes / 60);
  const totalMin = totalMinutes % 60;
  const signedCount = sessions.filter((s) => s.signatures && s.signatures.length > 0).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Historique</h1>
        <p className="text-sm text-gray-500 mt-0.5">Toutes vos sessions terminées</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <BookOpen size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
              <p className="text-xs text-gray-500">Sessions terminées</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Clock size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {totalH}h{totalMin > 0 ? `${totalMin}m` : ""}
              </p>
              <p className="text-xs text-gray-500">Heures de formation</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {signedCount}/{sessions.length}
              </p>
              <p className="text-xs text-gray-500">Sessions signées</p>
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
          <History size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500 font-medium">Aucune session terminée</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Module</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Formateur</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Date</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Durée</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Signature</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sessions.map((session) => {
                const isSigned = session.signatures && session.signatures.length > 0;
                return (
                  <tr key={session.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-800">{session.module?.nom}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{session.type || "—"}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {session.formateur?.prenom} {session.formateur?.nom}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 capitalize">
                      {format(new Date(session.dateDebut), "d MMM yyyy", { locale: fr })}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatDuration(session.dureeMinutes)}
                    </td>
                    <td className="px-5 py-4">
                      {isSigned ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                          <Shield size={11} />
                          Signée
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full">
                          En attente
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {!isSigned && (
                        <Link
                          href={`/apprenant/signature/${session.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
                        >
                          <PenLine size={12} />
                          Signer
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
