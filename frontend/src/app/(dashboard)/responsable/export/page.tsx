"use client";

import { useState } from "react";
import { exportApi } from "@/lib/api";
import { Download, FileText, Table, Calendar } from "lucide-react";

export default function ResponsableExportPage() {
  const [exportType, setExportType] = useState<"sessions" | "formateurs">("sessions");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleExportCSV = async () => {
    setError("");
    setSuccess("");
    try {
      setIsExporting(true);
      const response = await exportApi.csv({
        type: exportType,
        from: dateFrom || undefined,
        to: dateTo || undefined,
      });

      // Trigger download
      const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `coachplanner_${exportType}_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      setSuccess("Export CSV téléchargé avec succès.");
    } catch (e: any) {
      setError(e.response?.data?.message || "Erreur lors de l'export.");
    } finally {
      setIsExporting(false);
    }
  };

  const setPresetPeriod = (preset: "week" | "month" | "quarter") => {
    const now = new Date();
    const to = now.toISOString().slice(0, 10);
    let from: Date;

    if (preset === "week") {
      from = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
    } else if (preset === "month") {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      const q = Math.floor(now.getMonth() / 3);
      from = new Date(now.getFullYear(), q * 3, 1);
    }

    setDateFrom(from.toISOString().slice(0, 10));
    setDateTo(to);
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Exporter les données</h1>
        <p className="text-sm text-gray-500 mt-0.5">Export CSV des données de votre centre</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Type de données</h2>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            {
              value: "sessions" as const,
              label: "Sessions",
              icon: Calendar,
              desc: "Toutes les sessions avec apprenants et formateurs",
            },
            {
              value: "formateurs" as const,
              label: "Formateurs",
              icon: Table,
              desc: "Indicateurs d'activité par formateur",
            },
          ].map((opt) => (
            <label
              key={opt.value}
              className={`flex gap-3 p-4 border rounded-xl cursor-pointer transition ${
                exportType === opt.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="exportType"
                value={opt.value}
                checked={exportType === opt.value}
                onChange={() => setExportType(opt.value)}
                className="sr-only"
              />
              <opt.icon size={20} className={exportType === opt.value ? "text-blue-600" : "text-gray-400"} />
              <div>
                <p className={`text-sm font-medium ${exportType === opt.value ? "text-blue-700" : "text-gray-800"}`}>
                  {opt.label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>

        <h2 className="text-sm font-semibold text-gray-900 mb-3">Période</h2>

        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { label: "Cette semaine", preset: "week" as const },
            { label: "Ce mois", preset: "month" as const },
            { label: "Ce trimestre", preset: "quarter" as const },
          ].map((p) => (
            <button
              key={p.preset}
              onClick={() => setPresetPeriod(p.preset)}
              className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition"
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Du</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Au</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}
        {success && <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-lg mb-4">{success}</div>}

        <button
          onClick={handleExportCSV}
          disabled={isExporting}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-medium text-sm hover:bg-blue-700 transition disabled:opacity-60"
        >
          {isExporting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Download size={16} />
          )}
          Télécharger en CSV
        </button>
      </div>

      {/* Info */}
      <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500">
        <p className="font-medium text-gray-700 mb-1">Colonnes incluses dans l'export :</p>
        {exportType === "sessions" ? (
          <ul className="space-y-0.5 list-disc list-inside">
            <li>Formateur, Apprenant, Entreprise/Organisme</li>
            <li>Module de formation, Type de session</li>
            <li>Date de début, Heure de début/fin, Durée</li>
            <li>Statut, Signature (Oui/Non)</li>
          </ul>
        ) : (
          <ul className="space-y-0.5 list-disc list-inside">
            <li>Nom, Prénom, Email, Téléphone</li>
            <li>Matières enseignées, Statut</li>
            <li>Nombre d'apprenants actifs</li>
            <li>Volume horaire (semaine / mois / trimestre)</li>
          </ul>
        )}
      </div>
    </div>
  );
}
