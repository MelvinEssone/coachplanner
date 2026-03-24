"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { sessionsApi, modulesApi, usersApi } from "@/lib/api";
import { Module, User } from "@/types";
import { ArrowLeft, Plus, BookOpen } from "lucide-react";

export default function NewSessionPage() {
  const router = useRouter();
  const [modules, setModules] = useState<Module[]>([]);
  const [apprenants, setApprenants] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    apprenantId: "",
    moduleId: "",
    dateDebut: "",
    dateFin: "",
    type: "individuelle",
    notes: "",
  });

  useEffect(() => {
    modulesApi.getAll().then((r) => setModules(r.data.data)).catch(console.error);
    usersApi.getAll({ role: "APPRENANT" }).then((r) => setApprenants(r.data.data)).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.apprenantId || !formData.moduleId || !formData.dateDebut || !formData.dateFin) {
      setError("Tous les champs obligatoires doivent être remplis");
      return;
    }

    if (new Date(formData.dateFin) <= new Date(formData.dateDebut)) {
      setError("La date de fin doit être après la date de début");
      return;
    }

    setIsLoading(true);
    try {
      await sessionsApi.create(formData);
      router.push("/formateur/sessions");
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          "Erreur lors de la création"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/formateur/sessions"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nouvelle session</h1>
          <p className="text-sm text-gray-500">Planifiez une session de formation</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-5 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Module */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Module de formation <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <select
                value={formData.moduleId}
                onChange={(e) => setFormData({ ...formData, moduleId: e.target.value })}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Sélectionner un module</option>
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nom}
                  </option>
                ))}
              </select>
              <Link
                href="/formateur/modules"
                className="flex items-center gap-1 px-3 py-2.5 text-sm text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition"
              >
                <Plus size={14} />
                Créer
              </Link>
            </div>
            {modules.length === 0 && (
              <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                <BookOpen size={11} />
                Vous devez d&apos;abord créer un module
              </p>
            )}
          </div>

          {/* Apprenant */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Apprenant <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.apprenantId}
              onChange={(e) => setFormData({ ...formData, apprenantId: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Sélectionner un apprenant</option>
              {apprenants.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.prenom} {a.nom} — {a.email}
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date et heure de début <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.dateDebut}
                onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date et heure de fin <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.dateFin}
                onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Type de session
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {["individuelle", "groupe", "presentiel", "distanciel"].map((type) => (
                <label
                  key={type}
                  className={`flex items-center justify-center gap-2 px-3 py-2 border-2 rounded-xl text-sm cursor-pointer transition ${
                    formData.type === type
                      ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={type}
                    checked={formData.type === type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="sr-only"
                  />
                  <span className="capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Notes (optionnel)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Notes sur la session..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Link
              href="/formateur/sessions"
              className="flex-1 text-center py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isLoading ? "Création en cours..." : "Créer la session"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
