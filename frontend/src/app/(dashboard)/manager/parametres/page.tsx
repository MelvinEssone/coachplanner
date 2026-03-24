"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { FrequenceRapport } from "@/types";
import { Settings, Check } from "lucide-react";

const frequenceOptions: { value: FrequenceRapport; label: string; description: string }[] = [
  {
    value: "HEBDOMADAIRE",
    label: "Hebdomadaire",
    description: "Rapport généré chaque lundi pour la semaine précédente",
  },
  {
    value: "MENSUELLE",
    label: "Mensuelle",
    description: "Rapport généré le 1er du mois pour le mois précédent",
  },
  {
    value: "MANUELLE",
    label: "À la demande",
    description: "Rapport généré manuellement via le bouton 'Générer un rapport'",
  },
];

export default function ManagerParametresPage() {
  const { user } = useAuth();
  const [frequence, setFrequence] = useState<FrequenceRapport>("MENSUELLE");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user?.managerSettings?.frequenceRapport) {
      setFrequence(user.managerSettings.frequenceRapport);
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await api.put("/auth/manager-settings", { frequenceRapport: frequence });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-sm text-gray-500 mt-0.5">Configuration de votre compte Manager/RH</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
            <Settings size={18} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Fréquence des rapports horaires</h2>
            <p className="text-xs text-gray-500">Définissez quand vos rapports sont générés automatiquement</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {frequenceOptions.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition ${
                frequence === opt.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0 ${
                frequence === opt.value ? "border-blue-500 bg-blue-500" : "border-gray-300"
              }`}>
                {frequence === opt.value && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </div>
              <input
                type="radio"
                name="frequence"
                value={opt.value}
                checked={frequence === opt.value}
                onChange={() => setFrequence(opt.value)}
                className="sr-only"
              />
              <div>
                <p className={`text-sm font-medium ${frequence === opt.value ? "text-blue-700" : "text-gray-800"}`}>
                  {opt.label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>
              </div>
            </label>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Check size={15} />
            )}
            Enregistrer
          </button>

          {saved && (
            <span className="text-sm text-green-600 flex items-center gap-1.5">
              <Check size={14} />
              Paramètres sauvegardés
            </span>
          )}
        </div>
      </div>

      {/* Info box */}
      <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-xs text-blue-700">
          <strong>Rappel automatique :</strong> Si vous ne signez pas un rapport dans les 48h suivant sa génération,
          vous recevrez un rappel par e-mail et dans les notifications de l'application.
        </p>
      </div>
    </div>
  );
}
