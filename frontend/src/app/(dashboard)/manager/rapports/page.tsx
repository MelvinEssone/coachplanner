"use client";

import { useState, useEffect } from "react";
import { rapportsApi, usersApi } from "@/lib/api";
import { RapportHoraire, User } from "@/types";
import { formatDate } from "@/lib/utils";
import { FileText, Plus, Eye, PenLine, Check, Clock, Archive } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const statutLabel: Record<string, { label: string; color: string }> = {
  EN_ATTENTE: { label: "En attente", color: "bg-orange-50 text-orange-700" },
  SIGNE: { label: "Signé", color: "bg-green-50 text-green-700" },
  ARCHIVE: { label: "Archivé", color: "bg-gray-100 text-gray-600" },
};

export default function ManagerRapportsPage() {
  const [rapports, setRapports] = useState<RapportHoraire[]>([]);
  const [apprenants, setApprenants] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);
  const [generateData, setGenerateData] = useState({
    apprenantId: "",
    periodeDebut: "",
    periodeFin: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState("");

  const fetchRapports = async () => {
    try {
      setIsLoading(true);
      const r = await rapportsApi.getAll();
      setRapports(r.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRapports();
    usersApi.getAll({ role: "APPRENANT" }).then((r) => setApprenants(r.data.data));
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generateData.apprenantId || !generateData.periodeDebut || !generateData.periodeFin) {
      setGenError("Tous les champs sont obligatoires.");
      return;
    }
    try {
      setIsGenerating(true);
      await rapportsApi.generate({
        apprenantId: generateData.apprenantId,
        periodeDebut: new Date(generateData.periodeDebut).toISOString(),
        periodeFin: new Date(generateData.periodeFin).toISOString(),
      });
      setShowGenerate(false);
      fetchRapports();
    } catch (e: any) {
      setGenError(e.response?.data?.message || "Erreur lors de la génération.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports horaires</h1>
          <p className="text-sm text-gray-500 mt-0.5">{rapports.length} rapport(s)</p>
        </div>
        <button
          onClick={() => { setShowGenerate(true); setGenError(""); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition shadow-sm"
        >
          <Plus size={16} />
          Générer un rapport
        </button>
      </div>

      {/* Generate modal */}
      {showGenerate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Générer un rapport horaire</h2>
            </div>
            <form onSubmit={handleGenerate} className="p-6 space-y-4">
              {genError && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg">{genError}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Apprenant *</label>
                <select
                  value={generateData.apprenantId}
                  onChange={(e) => setGenerateData({ ...generateData, apprenantId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un apprenant</option>
                  {apprenants.map((a) => (
                    <option key={a.id} value={a.id}>{a.prenom} {a.nom}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Période début *</label>
                  <input
                    type="date"
                    value={generateData.periodeDebut}
                    onChange={(e) => setGenerateData({ ...generateData, periodeDebut: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Période fin *</label>
                  <input
                    type="date"
                    value={generateData.periodeFin}
                    onChange={(e) => setGenerateData({ ...generateData, periodeFin: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowGenerate(false)} className="flex-1 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                  Annuler
                </button>
                <button type="submit" disabled={isGenerating} className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
                  {isGenerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={15} />}
                  Générer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : rapports.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
          <FileText size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500 font-medium">Aucun rapport généré</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Apprenant</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Période</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Généré le</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Statut</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rapports.map((r) => {
                const st = statutLabel[r.statut] || statutLabel.EN_ATTENTE;
                return (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-800">
                        {r.apprenant?.prenom} {r.apprenant?.nom}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 capitalize">
                      {format(new Date(r.periodeDebut), "d MMM", { locale: fr })} –{" "}
                      {format(new Date(r.periodeFin), "d MMM yyyy", { locale: fr })}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {formatDate(r.createdAt, "dd/MM/yyyy")}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${st.color}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/manager/rapports/${r.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
                      >
                        {r.statut === "EN_ATTENTE" ? <PenLine size={12} /> : <Eye size={12} />}
                        {r.statut === "EN_ATTENTE" ? "Signer" : "Voir"}
                      </Link>
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
