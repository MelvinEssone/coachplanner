"use client";

import { useState, useEffect } from "react";
import { usersApi } from "@/lib/api";
import { User } from "@/types";
import { Search, UserCheck, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function ResponsableFormateursPage() {
  const [formateurs, setFormateurs] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("");

  useEffect(() => {
    usersApi.getAll({ role: "FORMATEUR" })
      .then((r) => setFormateurs(r.data.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = formateurs.filter((f) => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      f.nom.toLowerCase().includes(q) ||
      f.prenom.toLowerCase().includes(q) ||
      f.formateurProfil?.matieres.some((m) => m.toLowerCase().includes(q));
    const matchStatut = !filterStatut || f.formateurProfil?.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Formateurs</h1>
        <p className="text-sm text-gray-500 mt-0.5">{formateurs.length} formateur(s) rattaché(s)</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Rechercher par nom ou matière..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm outline-none text-gray-700 placeholder-gray-400"
          />
        </div>
        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous les statuts</option>
          <option value="Actif">Actif</option>
          <option value="Inactif">Inactif</option>
          <option value="En congé">En congé</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
          <UserCheck size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500 font-medium">Aucun formateur trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((formateur) => (
            <Link
              key={formateur.id}
              href={`/responsable/formateurs/${formateur.id}`}
              className="bg-white rounded-xl border border-gray-100 p-5 hover:border-blue-200 hover:shadow-sm transition block"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {formateur.prenom.charAt(0)}{formateur.nom.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {formateur.prenom} {formateur.nom}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{formateur.email}</p>
                  <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                    formateur.formateurProfil?.statut === "Actif"
                      ? "bg-green-50 text-green-700"
                      : formateur.formateurProfil?.statut === "En congé"
                      ? "bg-yellow-50 text-yellow-700"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {formateur.formateurProfil?.statut || "Actif"}
                  </span>
                </div>
                <ChevronRight size={16} className="text-gray-300 flex-shrink-0 mt-1" />
              </div>

              {formateur.formateurProfil?.matieres && formateur.formateurProfil.matieres.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formateur.formateurProfil.matieres.slice(0, 3).map((m) => (
                    <span key={m} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                      {m}
                    </span>
                  ))}
                  {formateur.formateurProfil.matieres.length > 3 && (
                    <span className="text-xs text-gray-400">
                      +{formateur.formateurProfil.matieres.length - 3}
                    </span>
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
