"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { sessionsApi, modulesApi, usersApi } from "@/lib/api";
import { Session, Module, User, SessionStatut } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, formatDuration } from "@/lib/utils";
import { Plus, Search, Filter, Edit, Trash2, Eye, Calendar } from "lucide-react";

export default function FormateurSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [apprenants, setApprenants] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState<SessionStatut | "">("");
  const [filterModule, setFilterModule] = useState("");
  const [total, setTotal] = useState(0);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const params: Record<string, string> = {};
      if (filterStatut) params.statut = filterStatut;
      if (filterModule) params.moduleId = filterModule;

      const response = await sessionsApi.getAll(params);
      setSessions(response.data.data);
      setTotal(response.data.total);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    modulesApi.getAll().then((r) => setModules(r.data.data)).catch(console.error);
    usersApi.getAll({ role: "APPRENANT" }).then((r) => setApprenants(r.data.data)).catch(console.error);
  }, [filterStatut, filterModule]);

  const handleDelete = async (id: string) => {
    if (!confirm("Archiver cette session ?")) return;
    try {
      await sessionsApi.delete(id);
      fetchSessions();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.module?.nom.toLowerCase().includes(q) ||
      s.apprenant?.nom.toLowerCase().includes(q) ||
      s.apprenant?.prenom.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes sessions</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} session(s) au total</p>
        </div>
        <Link
          href="/formateur/sessions/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition shadow-sm"
        >
          <Plus size={16} />
          Nouvelle session
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Rechercher une session..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm outline-none text-gray-700 placeholder-gray-400"
          />
        </div>

        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value as SessionStatut | "")}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous les statuts</option>
          <option value="A_VENIR">À venir</option>
          <option value="EN_COURS">En cours</option>
          <option value="TERMINEE">Terminée</option>
        </select>

        <select
          value={filterModule}
          onChange={(e) => setFilterModule(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous les modules</option>
          {modules.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nom}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
          <Calendar size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">Aucune session trouvée</p>
          <p className="text-gray-400 text-sm mt-1">Créez votre première session pour commencer</p>
          <Link
            href="/formateur/sessions/new"
            className="inline-flex items-center gap-2 mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            <Plus size={14} />
            Créer une session
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">
                    Module
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">
                    Apprenant
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">
                    Date
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">
                    Durée
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">
                    Statut
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">
                    Signatures
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-800">
                        {session.module?.nom || "-"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{session.type || "Individuelle"}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
                          {session.apprenant?.prenom?.charAt(0)}{session.apprenant?.nom?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {session.apprenant?.prenom} {session.apprenant?.nom}
                          </p>
                          <p className="text-xs text-gray-400">{session.apprenant?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatDate(session.dateDebut, "dd/MM/yyyy HH:mm")}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatDuration(session.dureeMinutes)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={session.statut} />
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-600">
                        {session.signatures?.length || 0}/2
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/formateur/sessions/${session.id}`}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Voir"
                        >
                          <Eye size={15} />
                        </Link>
                        <Link
                          href={`/formateur/sessions/${session.id}/edit`}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Modifier"
                        >
                          <Edit size={15} />
                        </Link>
                        <button
                          onClick={() => handleDelete(session.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Archiver"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
